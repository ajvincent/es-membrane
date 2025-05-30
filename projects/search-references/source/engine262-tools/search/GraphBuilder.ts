//#region preamble
import {
  InstanceGetterTracking
} from "./InstanceGetterTracking.js";

import type {
  InstanceGetterDefinitions
} from "../types/InstanceGetterDefinitions.js";

import type {
  EngineWeakKey,
  ObjectGraphIfc,
} from "../../graph-analysis/types/ObjectGraphIfc.js"

import type {
  SearchConfiguration
} from "../../public/core-host/types/SearchConfiguration.js";

import type {
  GraphObjectMetadata
} from "../../types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../types/GraphRelationshipMetadata.js";

import type {
  PrefixedNumber
} from "../../types/PrefixedNumber.js";

import {
  BuiltInJSTypeName,
  ChildReferenceEdgeType,
  type NodePrefix,
} from "../../utilities/constants.js";

import {
  GuestEngine,
} from "../host-to-guest/GuestEngine.js";

import {
  EnsureTypeOrThrow
} from "../host-to-guest/EnsureTypeOrThrow.js";

import type {
  GuestObjectGraphIfc
} from "../types/GuestObjectGraphIfc.js";

import {
  GuestObjectGraphImpl
} from "./GuestObjectGraphImpl.js";

import {
  buildObjectMetadata
} from "./ObjectMetadata.js";
//#endregion preamble

interface GuestFinalizationRegistryCell {
  WeakRefTarget: GuestEngine.Value | undefined;
  readonly HeldValue: GuestEngine.Value;
  readonly UnregisterToken: GuestEngine.Value | undefined;
}

type GuestObjectOrNull = GuestEngine.ObjectValue | GuestEngine.NullValue

export class GraphBuilder implements InstanceGetterDefinitions
{
  //#region private class fields and static private fields
  static readonly #stringConstants: ReadonlyMap<string, GuestEngine.JSStringValue> = new Map([
    ["constructor", GuestEngine.Value("constructor")],
    ["length", GuestEngine.Value("length")],
    ["name", GuestEngine.Value("name")],
  ]);

  static #buildChildEdgeType(
    type: ChildReferenceEdgeType,
  ): GraphRelationshipMetadata
  {
    return {
      parentToChildEdgeType: type
    }
  }

  static #builtInNamesFromInstrinsics(
    realm: GuestEngine.ManagedRealm
  ): Map<GuestEngine.Value, BuiltInJSTypeName>
  {
    const { Intrinsics } = realm;
    return new Map<GuestEngine.Value, BuiltInJSTypeName>([
      [Intrinsics["%Array.prototype%"], BuiltInJSTypeName.Array],
      [Intrinsics["%Object.prototype%"], BuiltInJSTypeName.Object],
      [Intrinsics["%AsyncFunction.prototype%"], BuiltInJSTypeName.AsyncFunction],
      [Intrinsics["%Function.prototype%"], BuiltInJSTypeName.Function],
      [Intrinsics["%WeakRef.prototype%"], BuiltInJSTypeName.WeakRef],
      [Intrinsics["%FinalizationRegistry.prototype%"], BuiltInJSTypeName.FinalizationRegistry],
      [Intrinsics["%Map.prototype%"], BuiltInJSTypeName.Map],
      [Intrinsics["%Set.prototype%"], BuiltInJSTypeName.Set],
      [Intrinsics["%WeakMap.prototype%"], BuiltInJSTypeName.WeakMap],
      [Intrinsics["%WeakSet.prototype%"], BuiltInJSTypeName.WeakSet],
      [Intrinsics["%Promise.prototype%"], BuiltInJSTypeName.Promise],

      [Intrinsics["%GeneratorPrototype%"], BuiltInJSTypeName.Generator],
      [Intrinsics["%AsyncGeneratorPrototype%"], BuiltInJSTypeName.AsyncGenerator],
      [Intrinsics["%ArrayIteratorPrototype%"], BuiltInJSTypeName.ArrayIterator],
      [Intrinsics["%MapIteratorPrototype%"], BuiltInJSTypeName.MapIterator],
      [Intrinsics["%SetIteratorPrototype%"], BuiltInJSTypeName.SetIterator],
      [Intrinsics["%IteratorHelperPrototype%"], BuiltInJSTypeName.IteratorHelper],
    ]);
  }

  static * #isConstructorPrototype(
    guestObject: GuestEngine.ObjectValue
  ): GuestEngine.Evaluator<boolean>
  {
    const guestCtor: GuestEngine.Value = yield * EnsureTypeOrThrow(GuestEngine.GetV(
      guestObject, GraphBuilder.#stringConstants.get("constructor")!
    ));

    if (GuestEngine.isFunctionObject(guestCtor) === false) {
      return false;
    }

    const guestCtorProto: GuestEngine.ObjectValue = yield* EnsureTypeOrThrow(GuestEngine.GetPrototypeFromConstructor(
      guestCtor, "%Object.prototype%"
    ));
    return guestCtorProto === guestObject;
  }

  static * #isDirectReturnFunction(
    guestFunction: GuestEngine.ECMAScriptFunctionObject
  ): GuestEngine.Evaluator<boolean>
  {
    {
      const lengthValue: GuestEngine.Value = yield* EnsureTypeOrThrow(
        GuestEngine.Get(guestFunction, GraphBuilder.#stringConstants.get("length")!)
      );
      GuestEngine.Assert(lengthValue.type === "Number");
      const length: number = lengthValue.numberValue();
      if (length > 0)
        return false;
    }

    const type = guestFunction.ECMAScriptCode?.type;

    if (type === "ConciseBody") {
      return true;
    }

    if (type === "FunctionBody") {
      const { FunctionStatementList } = guestFunction.ECMAScriptCode;
      if (FunctionStatementList.length === 1 && FunctionStatementList[0].type === "ReturnStatement")
        return true;
    }

    return false;
  }

  readonly #guestObjectGraph: GuestObjectGraphIfc<GraphObjectMetadata, GraphRelationshipMetadata>;
  #currentNodeId?: string;

  readonly #intrinsicToBuiltInNameMap: ReadonlyMap<GuestEngine.Value, BuiltInJSTypeName>;
  readonly #intrinsics: Pick<WeakSet<GuestEngine.Value>, "has">;

  readonly #objectsToExcludeFromSearch = new Set<GuestEngine.ObjectValue>;
  readonly #objectQueue = new Set<GuestEngine.ObjectValue>;

  readonly #instanceGetterTracking = new InstanceGetterTracking(this);

  readonly #searchConfiguration?: SearchConfiguration;
  //#endregion private class fields and static private fields

  public readonly resultsKey: string;
  public readonly sourceSpecifier: string;
  public readonly lineNumber: number;

  constructor(
    realm: GuestEngine.ManagedRealm,
    hostObjectGraph: ObjectGraphIfc<object, symbol, object, GraphObjectMetadata, GraphRelationshipMetadata>,
    resultsKey: string,
    searchConfiguration?: SearchConfiguration
  )
  {
    this.resultsKey = resultsKey;
    {
      const callerContext = GuestEngine.surroundingAgent.executionContextStack[2];
      if ("HostDefined" in callerContext.ScriptOrModule)
        this.sourceSpecifier = callerContext.ScriptOrModule.HostDefined.specifier ?? "";
      else
        this.sourceSpecifier = "";
      this.lineNumber = callerContext.callSite.lineNumber ?? NaN;
    }

    this.#searchConfiguration = searchConfiguration;
    this.#intrinsicToBuiltInNameMap = GraphBuilder.#builtInNamesFromInstrinsics(realm);
    this.#intrinsics = new WeakSet(Object.values(realm.Intrinsics));

    this.#guestObjectGraph = new GuestObjectGraphImpl(hostObjectGraph, this.#searchConfiguration);
  }

  * defineInstanceGetter(
    guestInstance: GuestEngine.ObjectValue,
    getterKey: string | number | GuestEngine.SymbolValue
  ): GuestEngine.Evaluator<void>
  {
    const guestKey: GuestEngine.JSStringValue | GuestEngine.SymbolValue = (
      typeof getterKey === "object" ? getterKey : GuestEngine.Value(getterKey.toString())
    );

    const guestValue: GuestEngine.Value = yield* EnsureTypeOrThrow(
      GuestEngine.GetV(guestInstance, guestKey)
    );

    if (guestValue.type === "Object" || guestValue.type === "Symbol") {
      const details = "instance: key=" + (guestKey.type === "String" ? guestKey.stringValue() : "(symbol)");
      yield* this.#defineGraphNode(guestValue, false, details);
      this.#addObjectPropertyOrGetter(guestInstance, guestKey, guestValue, true);
    }
  }

  public * run(
    targetValue: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    heldValues: GuestEngine.ObjectValue,
  ): GuestEngine.Evaluator<void>
  {
    const targetMetadata: GraphObjectMetadata = buildObjectMetadata(
      ...yield * this.#getCollectionAndClassName(targetValue)
    );

    const heldValuesMetadata: GraphObjectMetadata = buildObjectMetadata(
      ...yield * this.#getCollectionAndClassName(heldValues)
    );

    this.#guestObjectGraph.defineTargetAndHeldValues(
      targetValue, targetMetadata, heldValues, heldValuesMetadata
    );

    if (targetValue.type === "Object")
      this.#objectsToExcludeFromSearch.add(targetValue);
    this.#objectQueue.add(heldValues);

    for (const guestObject of this.#objectQueue) {
      if (this.#objectsToExcludeFromSearch.has(guestObject)) {
        continue;
      }

      this.#currentNodeId = this.#guestObjectGraph.getWeakKeyId(guestObject);
      if (this.#searchConfiguration?.enterNodeIdTrap)
        this.#searchConfiguration.enterNodeIdTrap(this.#currentNodeId);

      if (GuestEngine.isProxyExoticObject(guestObject)) {
        yield* this.#addInternalSlotIfObject(guestObject, "ProxyTarget", true, true);
        yield* this.#addInternalSlotIfObject(guestObject, "ProxyHandler", false, true);
      } else {
        yield * this.#addObjectProperties(guestObject);
        yield * this.#addPrivateFields(guestObject);

        if ((this.#searchConfiguration?.noFunctionEnvironment !== true) &&
          GuestEngine.isECMAScriptFunctionObject(guestObject))
        {
          // closures
          yield * this.#addReferencesInFunction(guestObject);
        }

        yield * this.#lookupAndAddInternalSlots(guestObject);
      }

      if (this.#searchConfiguration?.leaveNodeIdTrap)
        this.#searchConfiguration.leaveNodeIdTrap(this.#currentNodeId);
      this.#currentNodeId = undefined;
    }
  }

  //#region private methods
  #throwInternalError(error: Error): never {
    if (this.#searchConfiguration?.internalErrorTrap) {
      this.#searchConfiguration.internalErrorTrap();
    }
    throw error;
  }

  * #defineGraphNode(
    guestWeakKey: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    excludeFromSearch: boolean,
    details: string,
  ): GuestEngine.Evaluator<PrefixedNumber<NodePrefix>>
  {
    GuestEngine.Assert(("next" in guestWeakKey) === false);
    if (guestWeakKey.type === "Object") {
      yield * this.#defineGraphObjectNode(guestWeakKey, excludeFromSearch);
    }
    else {
      if (excludeFromSearch) {
        this.#throwInternalError(new Error("excludeFromSearch must not be true for a symbol!"));
      }
      this.#defineGraphSymbolNode(guestWeakKey);
    }

    const weakKey: PrefixedNumber<NodePrefix> = this.#guestObjectGraph.getWeakKeyId(guestWeakKey);
    if (this.#searchConfiguration?.defineNodeTrap) {
      this.#searchConfiguration.defineNodeTrap(this.#currentNodeId!, weakKey, details);
    }
    return weakKey;
  }

  * #defineGraphObjectNode(
    guestObject: GuestEngine.ObjectValue,
    excludeFromSearch: boolean
  ): GuestEngine.Evaluator<void>
  {
    if (this.#guestObjectGraph.hasObject(guestObject) === false) {
      const collectionAndClass = yield * this.#getCollectionAndClassName(guestObject);
      const objectMetadata = buildObjectMetadata(...collectionAndClass);
      if (guestObject.ConstructedBy.length > 0) {
        const classObject: GuestEngine.ObjectValue = guestObject.ConstructedBy[guestObject.ConstructedBy.length - 1];
        const slots = new Set<string>(classObject.internalSlotsList);
        if (slots.has("ScriptOrModule")) {
          const ScriptOrModule = Reflect.get(
            classObject, "ScriptOrModule"
          ) as GuestEngine.ModuleRecord | GuestEngine.ScriptRecord | GuestEngine.NullValue;
          if (ScriptOrModule instanceof GuestEngine.NullValue === false)
            objectMetadata.classSpecifier = ScriptOrModule?.HostDefined?.specifier;
        }

        if (slots.has("ECMAScriptCode")) {
          const ECMAScriptCode = Reflect.get(
            classObject, "ECMAScriptCode"
          ) as GuestEngine.ParseNode.Module | GuestEngine.ParseNode.Script;
          let parseNode: GuestEngine.ParseNode | undefined = ECMAScriptCode;
          for (let i = 0; i < 5; i++) {
            if ((parseNode.type === "ClassDeclaration") || (parseNode.type === "ClassExpression")) {
              break;
            }
            parseNode = parseNode.parent;
            if (!parseNode)
              break;
          }

          if ((parseNode?.type !== "ClassDeclaration") && (parseNode?.type !== "ClassExpression")) {
            parseNode = ECMAScriptCode;
          }
          objectMetadata.classLineNumber = parseNode?.location.start.line;
        }
      }
      this.#guestObjectGraph.defineObject(guestObject, objectMetadata);

      if (excludeFromSearch) {
        this.#objectsToExcludeFromSearch.add(guestObject);
      }

      this.#objectQueue.add(guestObject);
    }
  }

  #defineGraphSymbolNode(
    guestSymbol: GuestEngine.SymbolValue,
  ): void
  {
    if (this.#guestObjectGraph.hasSymbol(guestSymbol) === false) {
      const objectMetadata = buildObjectMetadata(
        BuiltInJSTypeName.Symbol, BuiltInJSTypeName.Symbol
      );
      this.#guestObjectGraph.defineSymbol(guestSymbol, objectMetadata);
    }
  }

  * #getCollectionAndClassName(
    guestValue: GuestEngine.ObjectValue | GuestEngine.SymbolValue,
  ): GuestEngine.Evaluator<[BuiltInJSTypeName, string]>
  {
    if (guestValue.type === "Symbol") {
      return [BuiltInJSTypeName.Symbol, BuiltInJSTypeName.Symbol]
    }

    if (GuestEngine.isProxyExoticObject(guestValue)) {
      return [BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy];
    }

    let isDirectMatch = true;
    let value: GuestEngine.ObjectValue = guestValue;

    let derivedClassName: string = "(unknown)";

    let proto: GuestObjectOrNull = yield * EnsureTypeOrThrow(value.GetPrototypeOf());

    while (proto.type !== "Null") {
      const builtIn = this.#intrinsicToBuiltInNameMap.get(proto);
      if (builtIn) {
        return [builtIn, isDirectMatch ? builtIn : derivedClassName];
      }

      if (isDirectMatch) {
        const guestCtor: GuestEngine.Value = yield * EnsureTypeOrThrow(
          GuestEngine.GetV(value, GraphBuilder.#stringConstants.get("constructor")!)
        );
        if (guestCtor.type === "Object") {
          const guestName: GuestEngine.Value = yield * EnsureTypeOrThrow(
            GuestEngine.GetV(guestCtor, GraphBuilder.#stringConstants.get("name")!)
          );
          if (guestName.type === "String") {
            derivedClassName = guestName.stringValue();
          }
        }

        isDirectMatch = false;
      }

      value = proto;
      proto = yield * EnsureTypeOrThrow(value.GetPrototypeOf());
    }

    return [
      BuiltInJSTypeName.Object,
      isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName
    ];
  }

  * #addObjectProperties(
    guestObject: GuestEngine.ObjectValue
  ): GuestEngine.Evaluator<void>
  {
    const OwnKeys: GuestEngine.PropertyKeyValue[] = yield * EnsureTypeOrThrow(guestObject.OwnPropertyKeys());
    GuestEngine.Assert(Array.isArray(OwnKeys));
    for (const guestKey of OwnKeys) {
      if (guestKey.type === "Symbol") {
        this.#defineGraphSymbolNode(guestKey);
      }

      const descriptor = yield* guestObject.GetOwnProperty(guestKey);
      GuestEngine.Assert(descriptor instanceof GuestEngine.Descriptor);

      let childGuestValue: GuestEngine.Value;
      let isGetter: boolean;

      let key: number | string | GuestEngine.SymbolValue;
      if (guestKey.type === "Symbol") {
        key = guestKey;
      } else if (GuestEngine.isArrayIndex(guestKey)) {
        key = parseInt(guestKey.stringValue());
      } else {
        key = guestKey.stringValue();
      }

      if (GuestEngine.IsDataDescriptor(descriptor)) {
        GuestEngine.Assert(descriptor.Value !== undefined);
        childGuestValue = descriptor.Value;
        isGetter = false;
      }
      else {
        const guestCtor = yield * EnsureTypeOrThrow(GuestEngine.GetV(
          guestObject, GraphBuilder.#stringConstants.get("constructor")!
        ));
        if (guestCtor.type === "Object" && this.#intrinsics.has(guestCtor) === false) {
          yield* this.#instanceGetterTracking.addGetterName(guestCtor, key);
        }

        const isObjectPrototype: boolean = yield * GraphBuilder.#isConstructorPrototype(guestObject);
        if (isObjectPrototype)
          continue;

        /* In the case of getters, this can definitely have side effects.  For instance, the getter
        could trigger code to delete something.  Well, too bad, this is what we have to do to get
        the answer.

        GetV can also throw if guestObject is a prototype and guestObject[guestKey] refers to this.
        */
        const childOrCompletion = yield * EnsureTypeOrThrow(GuestEngine.GetV(guestObject, guestKey));
        if (childOrCompletion instanceof GuestEngine.ThrowCompletion)
          continue;

        if (childOrCompletion instanceof GuestEngine.NormalCompletion)
          childGuestValue = childOrCompletion.Value;
        else
          childGuestValue = childOrCompletion;
        isGetter = true;
      }

      if (this.#intrinsics.has(childGuestValue))
        continue;

      if (childGuestValue.type === "Object" || childGuestValue.type === "Symbol") {
        let details = `addObjectProperties: `;
        if (typeof key !== "object") {
          details += "key=" + key;
        } else {
          details += "key=(symbol)";
        }

        yield* this.#defineGraphNode(childGuestValue, false, details);
        this.#addObjectPropertyOrGetter(guestObject, guestKey, childGuestValue, isGetter);
      }
    }
  }

  #addObjectPropertyOrGetter(
    parentObject: GuestEngine.ObjectValue,
    guestKey: GuestEngine.JSStringValue | GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue | GuestEngine.SymbolValue,
    isGetter: boolean,
  ): void
  {
    let key: number | string | GuestEngine.SymbolValue;
    let valueRelationship: GraphRelationshipMetadata;
    if (GuestEngine.isArrayIndex(guestKey)) {
      GuestEngine.Assert(guestKey.type === "String");

      key = parseInt(guestKey.stringValue());
      valueRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.ArrayIndex);
    }

    else if (guestKey.type === "String") {
      key = guestKey.stringValue();
      valueRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertyName);
    }

    else {
      //this.#defineGraphSymbolNode(key);
      const keyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.SymbolKey);
      this.#guestObjectGraph.defineAsSymbolKey(parentObject, guestKey, keyRelationship);

      key = guestKey;
      valueRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertySymbol);
    }

    this.#guestObjectGraph.definePropertyOrGetter(
      parentObject, key, childObject, valueRelationship, isGetter
    );
  }

  * #addPrivateFields(
    guestObject: GuestEngine.ObjectValue
  ): GuestEngine.Evaluator<void>
  {
    for (const element of guestObject.PrivateElements) {
      const { Key, Kind } = element;
      const privateKey: string = Key.Description.stringValue();
      GuestEngine.Assert(privateKey.startsWith("#"));

      if (this.#guestObjectGraph.hasPrivateName(Key) === false) {
        this.#guestObjectGraph.definePrivateName(Key, privateKey as `#${string}`);
      }

      let guestValue: GuestEngine.Value;

      if (Kind === "accessor") {
        const { Get } = element;
        if (Get?.type !== "Object")
          continue;

        guestValue = yield * EnsureTypeOrThrow(GuestEngine.PrivateGet(guestObject, Key));
      }
      else {
        const { Value } = element;
        GuestEngine.Assert(Value !== undefined);
        guestValue = Value;
      }

      if (guestValue.type !== "Object" && guestValue.type !== "Symbol")
        continue;

      yield* this.#defineGraphNode(
        guestValue,
        false,
        "addPrivateFields: key=" + privateKey
      );
      const privateNameMetadata = GraphBuilder.#buildChildEdgeType(
        ChildReferenceEdgeType.PrivateClassKey
      );
      const privateValueMetadata = GraphBuilder.#buildChildEdgeType(
        ChildReferenceEdgeType.PrivateClassValue
      );
      this.#guestObjectGraph.definePrivateField(
        guestObject, Key, privateKey as `#${string}`, guestValue,
        privateNameMetadata, privateValueMetadata, Kind === "accessor"
      );
    }
  }

  * #lookupAndAddInternalSlots(
    guestObject: GuestEngine.ObjectValue
  ): GuestEngine.Evaluator<void>
  {
    if (GuestEngine.IsConstructor(guestObject)) {
      const kind = Reflect.get(guestObject, "ConstructorKind");
      if (kind === "derived") {
        const proto = Reflect.get(guestObject, "Prototype");
        if (proto.type !== "Null" && this.#intrinsics.has(proto) === false) {
          yield* this.#addInternalSlotIfObject(guestObject, "Prototype", false, true);
          yield* this.#instanceGetterTracking.addBaseClass(guestObject, proto);
        }
      }
    }

    const internalSlots: ReadonlySet<string> = new Set(guestObject.internalSlotsList);

    if (internalSlots.has("RevocableProxy")) {
      yield* this.#addInternalSlotIfObject(guestObject, "RevocableProxy", false, true);
      return;
    }

    if (internalSlots.has("WeakRefTarget")) {
      yield* this.#addInternalSlotIfObject(guestObject, "WeakRefTarget", false, false);
      return;
    }

    if (internalSlots.has("CleanupCallback")) {
      type JobCallbackRecord = { Callback: GuestEngine.Value };
      const { Callback } = Reflect.get(guestObject, "CleanupCallback") as JobCallbackRecord;
      if (Callback.type === "Object") {
        yield* this.#defineGraphNode(Callback, false, `internal slot: [[CleanupCallback]]`);
        const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
        this.#guestObjectGraph.defineInternalSlot(
          guestObject, `[[CleanupCallback]]`, Callback, true, edgeRelationship
        );
      }

      if (internalSlots.has("Cells")) {
        const cells = Reflect.get(guestObject, "Cells") as readonly GuestFinalizationRegistryCell[];
        for (const cell of cells) {
          yield* this.#addInternalFinalizationCell(guestObject, cell);
        }
      }
      return;
    }

    if (internalSlots.has("SetData")) {
      yield* this.#addSetData(guestObject, "SetData");
      return;
    }
    if (internalSlots.has("WeakSetData")) {
      yield* this.#addSetData(guestObject, "WeakSetData");
      return;
    }

    if (internalSlots.has("MapData")) {
      yield* this.#addMapData(guestObject, "MapData");
      return;
    }
    if (internalSlots.has("WeakMapData")) {
      yield* this.#addMapData(guestObject, "WeakMapData");
      return;
    }

    if (internalSlots.has("BoundTargetFunction")) {
      yield* this.#addInternalSlotIfObject(guestObject, "BoundTargetFunction", false, true);
      if (internalSlots.has("BoundThis"))
        yield* this.#addInternalSlotIfObject(guestObject, "BoundThis", false, true);
      if (internalSlots.has("BoundArguments")) {
        yield* this.#addInternalSlotIfList(guestObject, "BoundArguments");
      }
      return;
    }

    if (internalSlots.has("PromiseResult")) {
      yield* this.#addInternalSlotIfObject(guestObject, "PromiseResult", false, true);
      yield* this.#addInternalPromiseRecordsList(guestObject, "PromiseFulfillReactions");
      yield* this.#addInternalPromiseRecordsList(guestObject, "PromiseRejectReactions");
    }

    if (internalSlots.has("HostCapturedValues") &&
        "HostCapturedValues" in guestObject &&
        Array.isArray(guestObject.HostCapturedValues)
    )
    {
      yield* this.#addInternalSlotIfList(guestObject, "HostCapturedValues");
    }

    if (internalSlots.has("UnderlyingIterator")) {
      const UnderlyingRecord = Reflect.get(guestObject, "UnderlyingIterator") as GuestEngine.IteratorRecord;
      const guestRecord = GuestEngine.OrdinaryObjectCreate.from(
        UnderlyingRecord as unknown as Record<string, GuestEngine.Value>
      );
      yield* this.#defineGraphNode(
        guestRecord, false, `internal slot object: UnderlyingIterator`
      );
      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
      this.#guestObjectGraph.defineInternalSlot(
        guestObject, `[[UnderlyingIterator]]`, guestRecord, true, edgeRelationship
      );
    }

    if (guestObject.ConstructedBy?.length > 0) {
      yield* this.#addInternalSlotIfList(guestObject, "ConstructedBy");
      yield* this.#instanceGetterTracking.addInstance(
        guestObject, guestObject.ConstructedBy[guestObject.ConstructedBy.length - 1]!
      );
    }
  }

  * #addInternalSlotIfObject(
    parentObject: GuestEngine.ObjectValue,
    slotName: string,
    excludeFromSearches: boolean,
    isStrongReference: boolean
  ): GuestEngine.Evaluator<void>
  {
    const slotObject = Reflect.get(parentObject, slotName) as GuestEngine.Value;
    if (slotObject.type !== "Object")
      return;

    yield* this.#defineGraphNode(
      slotObject, excludeFromSearches, `internal slot object: ${slotName}`
    );
    const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
    this.#guestObjectGraph.defineInternalSlot(
      parentObject, `[[${slotName}]]`, slotObject, isStrongReference, edgeRelationship
    );
  }

  * #addInternalSlotIfList(
    parentObject: GuestEngine.ObjectValue,
    slotName: string,
  ): GuestEngine.Evaluator<void>
  {
    const slotArray = Reflect.get(parentObject, slotName) as readonly GuestEngine.Value[] | undefined;
    if (slotArray === undefined)
      return;
    const guestArray: GuestEngine.ObjectValue = GuestEngine.CreateArrayFromList(slotArray);
    yield* this.#defineGraphNode(
      guestArray, false, `internal slot list: ${slotName}`
    );

    const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
    this.#guestObjectGraph.defineInternalSlot(
      parentObject, `[[${slotName}]]`, guestArray, true, edgeRelationship
    );
  }

  * #addInternalPromiseRecordsList(
    promiseObject: GuestEngine.ObjectValue,
    slotName: "PromiseFulfillReactions" | "PromiseRejectReactions"
  ): GuestEngine.Evaluator<void>
  {
    const records = Reflect.get(promiseObject, slotName) as readonly GuestEngine.PromiseReactionRecord[] | undefined;
    if (records === undefined)
      return;

    const handlers = records.map(r => r.Handler).filter(Boolean) as readonly GuestEngine.JobCallbackRecord[];
    const callbacks: readonly GuestEngine.FunctionObject[] = handlers.map(h => h.Callback);

    const guestArray: GuestEngine.ObjectValue = GuestEngine.CreateArrayFromList(callbacks);
    yield* this.#defineGraphNode(guestArray, false, "internal slot:" + slotName);
    const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
    this.#guestObjectGraph.defineInternalSlot(promiseObject, `[[${slotName}]]`, guestArray, true, edgeRelationship);
  }

  * #addInternalFinalizationCell(
    registry: GuestEngine.ObjectValue,
    cell: GuestFinalizationRegistryCell
  ): GuestEngine.Evaluator<void>
  {
    let WeakRefTarget: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>;
    if (cell.WeakRefTarget?.type === "Object" || cell.WeakRefTarget?.type === "Symbol")
      WeakRefTarget = cell.WeakRefTarget;
    else
      return;

    const { HeldValue } = cell;

    let UnregisterToken: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue> | undefined;
    if (cell.UnregisterToken?.type === "Object" || cell.UnregisterToken?.type === "Symbol")
      UnregisterToken = cell.UnregisterToken;

    yield* this.#defineGraphNode(
      WeakRefTarget, false, "finalization cell target");
    if (HeldValue.type === "Object" || HeldValue.type === "Symbol")
      yield* this.#defineGraphNode(
        HeldValue, false, "finalization cell heldValue");
    if (UnregisterToken)
      yield* this.#defineGraphNode(
        UnregisterToken, false, "finalization cell unregisterToken"
      );

    this.#guestObjectGraph.defineFinalizationTuple(registry, WeakRefTarget, HeldValue, UnregisterToken);
  }

  * #addMapData(
    mapObject: GuestEngine.ObjectValue,
    slotName: "MapData" | "WeakMapData"
  ): GuestEngine.Evaluator<void>
  {
    const elements = Reflect.get(mapObject, slotName) as readonly Record<"Key" | "Value", GuestEngine.Value>[];
    for (const {Key, Value} of elements) {
      if (Key.type !== "Object" && Value.type !== "Object") {
        continue;
      }

      let keyRelationship: GraphRelationshipMetadata | undefined;
      let valueRelationship: GraphRelationshipMetadata | undefined;
      if (Key.type === "Object" || Key.type === "Symbol") {
        yield* this.#defineGraphNode(Key, false, "map key");
        keyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.MapKey);
      }

      if (Value.type === "Object" || Value.type === "Symbol") {
        yield* this.#defineGraphNode(Value, false, "map value");
        valueRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.MapValue);
      }

      this.#guestObjectGraph.defineMapKeyValueTuple(
        mapObject, Key, Value, slotName === "MapData", keyRelationship, valueRelationship
      );
    }
  }

  * #addSetData(
    parentObject: GuestEngine.ObjectValue,
    slotName: "SetData" | "WeakSetData",
  ): GuestEngine.Evaluator<void>
  {
    const elements = Reflect.get(parentObject, slotName) as readonly GuestEngine.Value[];
    for (const value of elements) {
      if (value.type === "Object" || value.type === "Symbol") {
        yield* this.#defineGraphNode(value, false, "set value");

        const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.SetElement);
        this.#guestObjectGraph.defineSetValue(parentObject, value, slotName === "SetData", edgeRelationship);
      }
    }
  }

  * #addReferencesInFunction(
    guestFunction: GuestEngine.ECMAScriptFunctionObject
  ): GuestEngine.Evaluator<void>
  {
    // the 'arguments' property is off-limits... engine262 throws for this.
    const visitedNames = new Set<string>(["arguments"]);

    let env: GuestEngine.EnvironmentRecord | GuestEngine.NullValue = guestFunction.Environment;
    let thisValue: GuestEngine.Value | undefined = undefined;
    if (env instanceof GuestEngine.FunctionEnvironmentRecord) {
      if (env.HasThisBinding() === GuestEngine.Value.true) {
        const thisBinding = env.GetThisBinding();
        GuestEngine.Assert(thisBinding instanceof GuestEngine.Value);
        thisValue = thisBinding;

        yield* this.#buildFunctionValueReference(
          guestFunction, "this", thisBinding
        )
      }

      if (env.HasSuperBinding() === GuestEngine.Value.true) {
        const superBinding = env.GetSuperBase();
        yield* this.#buildFunctionValueReference(
          guestFunction, "super", superBinding
        );
      }
    }

    while (env instanceof GuestEngine.FunctionEnvironmentRecord) {
      for (const [guestName, guestValue] of env.bindings.entries()) {
        const hostName = guestName.stringValue();
        if (visitedNames.has(hostName))
          continue;
        visitedNames.add(hostName);

        yield* this.#buildFunctionValueReference(
          guestFunction, hostName, guestValue.value ?? GuestEngine.Value.undefined
        );
      }
      env = env.OuterEnv;
    }

    if (yield* GraphBuilder.#isDirectReturnFunction(guestFunction)) {
      // here be dragons: not sure if `this` will be the right value for a given module
      thisValue ??= GuestEngine.surroundingAgent.currentRealmRecord.GlobalObject;
      const result: GuestEngine.Value = yield* EnsureTypeOrThrow(guestFunction.Call(thisValue, []));
      if (result.type === "Object" || result.type === "Symbol") {
        yield* this.#buildFunctionValueReference(guestFunction, `[[return value]]`, result);
      }
    }
  }

  * #buildFunctionValueReference(
    guestFunction: GuestEngine.FunctionObject,
    nameOfValue: string,
    guestValue: GuestEngine.Value,
  ): GuestEngine.Evaluator<void>
  {
    if (guestValue.type !== "Object" && guestValue.type !== "Symbol")
      return;

    yield* this.#defineGraphNode(
      guestValue, false, "function reference: " + nameOfValue
    );
    const relationship = GraphBuilder.#buildChildEdgeType(
      ChildReferenceEdgeType.ScopeValue
    );
    this.#guestObjectGraph.defineScopeValue(
      guestFunction, nameOfValue, guestValue, relationship
    );
  }
  //#endregion private methods
}
