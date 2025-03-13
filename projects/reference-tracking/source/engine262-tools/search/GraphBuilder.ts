//#region preamble
import {
  InstanceGetterTracking
} from "../../graph-analysis/InstanceGetterTracking.js";

import type {
  InstanceGetterDefinitions
} from "../../graph-analysis/types/InstanceGetterDefinitions.js";

import type {
  EngineWeakKey,
  ObjectGraphIfc,
} from "../../graph-analysis/types/ObjectGraphIfc.js"

import type {
  GraphObjectMetadata
} from "../../types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../types/GraphRelationshipMetadata.js";

import {
  BuiltInJSTypeName,
  ChildReferenceEdgeType,
} from "../../utilities/constants.js";

import {
  GuestEngine,
  type PlainCompletion,
} from "../host-to-guest/GuestEngine.js";

import type {
  GuestObjectGraphIfc
} from "../types/GuestObjectGraphIfc.js";

import {
  GuestObjectGraphImpl
} from "./GuestObjectGraphImpl.js";

import {
  buildObjectMetadata
} from "./ObjectMetadata.js";

import {
  EnsureValueOrThrow
} from "../host-to-guest/ValueOrThrow.js";
//#endregion preamble

export class GraphBuilder
implements InstanceGetterDefinitions<GuestEngine.ObjectValue, GuestEngine.SymbolValue>
{
  //#region private class fields and static private fields
  static readonly #stringConstants: ReadonlyMap<string, GuestEngine.JSStringValue> = new Map([
    ["constructor", GuestEngine.Value("constructor")],
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
      [Intrinsics["%Function.prototype%"], BuiltInJSTypeName.Function],
      [Intrinsics["%WeakRef.prototype%"], BuiltInJSTypeName.WeakRef],
      [Intrinsics["%Map.prototype%"], BuiltInJSTypeName.Map],
      [Intrinsics["%Set.prototype%"], BuiltInJSTypeName.Set],
      [Intrinsics["%WeakMap.prototype%"], BuiltInJSTypeName.WeakMap],
      [Intrinsics["%WeakSet.prototype%"], BuiltInJSTypeName.WeakSet],
    ]);
  }

  readonly #guestObjectGraph: GuestObjectGraphIfc<GraphObjectMetadata, GraphRelationshipMetadata>;
  // eslint-disable-next-line no-unused-private-class-members
  #currentNodeId?: string;

  readonly #intrinsicToBuiltInNameMap: ReadonlyMap<GuestEngine.Value, BuiltInJSTypeName>;
  readonly #intrinsics: Pick<WeakSet<GuestEngine.Value>, "has">;

  readonly #objectsToExcludeFromSearch = new Set<GuestEngine.ObjectValue>;
  readonly #objectQueue = new Set<GuestEngine.ObjectValue>;

  readonly #instanceGetterTracking = new InstanceGetterTracking<
    GuestEngine.ObjectValue, GuestEngine.SymbolValue
  >(this);

  readonly #internalErrorTrap?: () => void;
  //#endregion private class fields and static private fields

  constructor(
    targetValue: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    heldValues: GuestEngine.ObjectValue,
    realm: GuestEngine.ManagedRealm,
    hostObjectGraph: ObjectGraphIfc<object, symbol, GraphObjectMetadata, GraphRelationshipMetadata>,
    internalErrorTrap?: () => void,
  )
  {
    this.#internalErrorTrap = internalErrorTrap;
    this.#intrinsicToBuiltInNameMap = GraphBuilder.#builtInNamesFromInstrinsics(realm);
    this.#intrinsics = new WeakSet(Object.values(realm.Intrinsics));

    this.#guestObjectGraph = new GuestObjectGraphImpl(hostObjectGraph);

    const targetMetadata: GraphObjectMetadata = buildObjectMetadata(
      ...this.#getCollectionAndClassName(targetValue)
    );

    const heldValuesMetadata: GraphObjectMetadata = buildObjectMetadata(
      ...this.#getCollectionAndClassName(heldValues)
    );

    this.#guestObjectGraph.defineTargetAndHeldValues(
      targetValue, targetMetadata, heldValues, heldValuesMetadata
    );

    if (targetValue.type === "Object")
      this.#objectsToExcludeFromSearch.add(targetValue);
    this.#objectQueue.add(heldValues);
  }

  defineInstanceGetter(
    guestInstance: GuestEngine.ObjectValue,
    getterKey: string | number | GuestEngine.SymbolValue
  ): void
  {
    const guestKey: GuestEngine.JSStringValue | GuestEngine.SymbolValue = (
      typeof getterKey === "object" ? getterKey : GuestEngine.Value(getterKey.toString())
    );

    // GetV says it will return a GuestEngine.Value.  For getters, it returns a NormalCompletion<GuestEngine.Value> sometimes.
    //FIXME: when engine262 is type-checked throughout, this should be cleaned up.
    const guestValue: GuestEngine.Value = GuestEngine.EnsureCompletion(
      GuestEngine.GetV(guestInstance, guestKey)
    ).Value;

    if (guestValue.type === "Object" || guestValue.type === "Symbol") {
      this.#defineGraphNode(guestValue, false);
      this.#addObjectPropertyOrGetter(guestInstance, guestKey, guestValue, true);
    }
  }

  definePrivateInstanceGetter(
    instance: GuestEngine.ObjectValue,
    privateKey: GuestEngine.ObjectValue
  ): void
  {
    void(instance);
    void(privateKey);
    this.#throwInternalError(new Error("definePrivateInstanceGetter not yet implemented"));
  }

  public run(): void
  {
    for (const guestObject of this.#objectQueue) {
      this.#currentNodeId = this.#guestObjectGraph.getWeakKeyId(guestObject);
      if (this.#objectsToExcludeFromSearch.has(guestObject) === false) {
        if (GuestEngine.isProxyExoticObject(guestObject) === false) {
          this.#addObjectProperties(guestObject);
          this.#addConstructorOf(guestObject);
        }

        this.#lookupAndAddInternalSlots(guestObject);
      }
      this.#currentNodeId = undefined;
    }
  }

  //#region private methods
  #throwInternalError(error: Error): never {
    if (this.#internalErrorTrap) {
      this.#internalErrorTrap();
    }
    throw error;
  }

  #defineGraphNode(
    guestWeakKey: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    excludeFromSearch: boolean,
  ): void
  {
    if (guestWeakKey.type === "Object") {
      this.#defineGraphObjectNode(guestWeakKey, excludeFromSearch);
    }
    else {
      if (excludeFromSearch) {
        this.#throwInternalError(new Error("excludeFromSearch must not be true for a symbol!"));
      }
      this.#defineGraphSymbolNode(guestWeakKey);
    }
  }

  #defineGraphObjectNode(
    guestObject: GuestEngine.ObjectValue,
    excludeFromSearch: boolean
  ): void
  {
    if (this.#guestObjectGraph.hasObject(guestObject) === false) {
      this.#guestObjectGraph.defineObject(
        guestObject,
        buildObjectMetadata(...this.#getCollectionAndClassName(guestObject))
      );

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
      this.#guestObjectGraph.defineSymbol(
        guestSymbol,
        buildObjectMetadata(BuiltInJSTypeName.Symbol, BuiltInJSTypeName.Symbol)
      );
    }
  }

  #getCollectionAndClassName(
    guestValue: GuestEngine.ObjectValue | GuestEngine.SymbolValue,
  ): [BuiltInJSTypeName, string]
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

    let proto: GuestEngine.ObjectValue | GuestEngine.NullValue = EnsureValueOrThrow(value.GetPrototypeOf());

    while (proto.type !== "Null") {
      const builtIn = this.#intrinsicToBuiltInNameMap.get(proto);
      if (builtIn) {
        return [builtIn, isDirectMatch ? builtIn : derivedClassName];
      }

      if (isDirectMatch) {
        const guestCtor = EnsureValueOrThrow(
          GuestEngine.GetV(value, GraphBuilder.#stringConstants.get("constructor")!)
        );
        if (guestCtor.type === "Object") {
          const guestName = EnsureValueOrThrow(
            GuestEngine.GetV(guestCtor, GraphBuilder.#stringConstants.get("name")!)
          );
          if (guestName.type === "String") {
            derivedClassName = guestName.stringValue();
          }
        }

        isDirectMatch = false;
      }

      value = proto;
      proto = EnsureValueOrThrow(value.GetPrototypeOf());
    }

    return [BuiltInJSTypeName.Object, isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName];
  }

  #addObjectProperties(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    const OwnKeys: PlainCompletion<GuestEngine.PropertyKeyValue[]> = guestObject.OwnPropertyKeys();
    GuestEngine.Assert(Array.isArray(OwnKeys));
    for (const guestKey of OwnKeys) {
      if (guestKey.type === "Symbol") {
        this.#defineGraphSymbolNode(guestKey);
      }

      const descriptor = guestObject.GetOwnProperty(guestKey);
      GuestEngine.Assert(descriptor instanceof GuestEngine.Descriptor);

      if (GuestEngine.IsDataDescriptor(descriptor)) {
        GuestEngine.Assert(descriptor.Value !== undefined);
        const childGuestValue: GuestEngine.Value = descriptor.Value;
        if (childGuestValue.type === "Object" || childGuestValue.type === "Symbol") {
          this.#defineGraphNode(childGuestValue, false);
          this.#addObjectPropertyOrGetter(guestObject, guestKey, childGuestValue, false);
        }
      }
      else {
        let key: number | string | GuestEngine.SymbolValue;
        if (guestKey.type === "Symbol") {
          key = guestKey;
        } else if (GuestEngine.isArrayIndex(guestKey)) {
          key = parseInt(guestKey.stringValue());
        } else {
          key = guestKey.stringValue();
        }

        const ctor = EnsureValueOrThrow(GuestEngine.GetV(
          guestObject, GraphBuilder.#stringConstants.get("constructor")!
        ));
        if (ctor.type === "Object") {
          this.#instanceGetterTracking.addGetterName(ctor, key);
        }
      }
    }
  }

  #addObjectPropertyOrGetter(
    parentObject: GuestEngine.ObjectValue,
    key: GuestEngine.JSStringValue | GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue | GuestEngine.SymbolValue,
    isGetter: boolean,
  ): void
  {
    if (GuestEngine.isArrayIndex(key)) {
      GuestEngine.Assert(key.type === "String");
      const localIndex = parseInt(key.stringValue());

      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.ArrayIndex);
      this.#guestObjectGraph.definePropertyOrGetter(
        parentObject, localIndex, childObject, edgeRelationship, isGetter
      );
    }

    else if (key.type === "String") {
      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertyName);
      this.#guestObjectGraph.definePropertyOrGetter(
        parentObject, key.stringValue(), childObject, edgeRelationship, isGetter
      );
    }

    else {
      this.#defineGraphSymbolNode(key);
      const keyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.SymbolKey);
      this.#guestObjectGraph.defineAsSymbolKey(parentObject, key, keyRelationship);

      const propertyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertySymbol);
      this.#guestObjectGraph.definePropertyOrGetter(
        parentObject, key, childObject, propertyRelationship, isGetter
      );
    }
  }

  #lookupAndAddInternalSlots(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    if (GuestEngine.isProxyExoticObject(guestObject)) {
      this.#addInternalSlotIfObject(guestObject, "ProxyTarget", true, true);
      this.#addInternalSlotIfObject(guestObject, "ProxyHandler", false, true);
      return;
    }

    if (GuestEngine.IsConstructor(guestObject).booleanValue()) {
      const kind = Reflect.get(guestObject, "ConstructorKind");
      if (kind === "derived") {
        const proto = Reflect.get(guestObject, "Prototype");
        if (this.#intrinsics.has(proto) === false) {
          this.#addInternalSlotIfObject(guestObject, "Prototype", false, true);
          this.#instanceGetterTracking.addBaseClass(guestObject, proto);
        }
      }
    }

    if (guestObject.internalSlotsList.includes("RevocableProxy")) {
      this.#addInternalSlotIfObject(guestObject, "RevocableProxy", false, true);
      return;
    }

    if (guestObject.internalSlotsList.includes("WeakRefTarget")) {
      this.#addInternalSlotIfObject(guestObject, "WeakRefTarget", false, false);
      return;
    }

    if (guestObject.internalSlotsList.includes("SetData")) {
      this.#addSetData(guestObject, "SetData");
      return;
    }
    if (guestObject.internalSlotsList.includes("WeakSetData")) {
      this.#addSetData(guestObject, "WeakSetData");
      return;
    }

    if (guestObject.internalSlotsList.includes("MapData")) {
      this.#addMapData(guestObject, "MapData");
      return;
    }
    if (guestObject.internalSlotsList.includes("WeakMapData")) {
      this.#addMapData(guestObject, "WeakMapData");
      return;
    }
  }

  #addInternalSlotIfObject(
    parentObject: GuestEngine.ObjectValue,
    slotName: string,
    excludeFromSearches: boolean,
    isStrongReference: boolean
  ): void
  {
    const slotObject = Reflect.get(parentObject, slotName) as GuestEngine.ObjectValue | GuestEngine.NullValue;
    if (slotObject.type === "Null")
      return;

    this.#defineGraphNode(slotObject, excludeFromSearches);
    const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InternalSlot);
    this.#guestObjectGraph.defineInternalSlot(parentObject, `[[${slotName}]]`, slotObject, isStrongReference, edgeRelationship);
  }

  #addConstructorOf(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    const guestCtor = EnsureValueOrThrow(GuestEngine.GetV(
      guestObject, GraphBuilder.#stringConstants.get("constructor")!
    ));
    GuestEngine.Assert(GuestEngine.isFunctionObject(guestCtor));

    const guestCtorProto = EnsureValueOrThrow(GuestEngine.GetPrototypeFromConstructor(
      guestCtor, "%Object.prototype%"
    ));
    if (this.#intrinsicToBuiltInNameMap.has(guestCtorProto))
      return;
    if (guestCtorProto === guestObject)
      return;

    GuestEngine.Assert(guestCtor.type === "Object");
    GuestEngine.Assert(GuestEngine.IsConstructor(guestCtor).booleanValue());

    this.#defineGraphNode(guestCtor, false);
    const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InstanceOf);
    this.#guestObjectGraph.defineConstructorOf(guestObject, guestCtor, edgeRelationship);

    this.#instanceGetterTracking.addInstance(guestObject, guestCtor);
  }

  #addMapData(
    mapObject: GuestEngine.ObjectValue,
    slotName: "MapData" | "WeakMapData"
  ): void
  {
    const elements = Reflect.get(mapObject, slotName) as readonly Record<"Key" | "Value", GuestEngine.Value>[];
    for (const {Key, Value} of elements) {
      if (Key.type !== "Object" && Value.type !== "Object") {
        continue;
      }

      let keyRelationship: GraphRelationshipMetadata | undefined;
      let valueRelationship: GraphRelationshipMetadata | undefined;
      if (Key.type === "Object") {
        this.#defineGraphNode(Key, false);
        keyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.MapKey);
      }

      if (Value.type === "Object") {
        this.#defineGraphNode(Value, false);
        valueRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.MapValue);
      }

      this.#guestObjectGraph.defineMapKeyValueTuple(
        mapObject, Key, Value, slotName === "MapData", keyRelationship, valueRelationship
      );
    }
  }

  #addSetData(
    parentObject: GuestEngine.ObjectValue,
    slotName: "SetData" | "WeakSetData",
  ): void
  {
    const elements = Reflect.get(parentObject, slotName) as readonly GuestEngine.Value[];
    for (const value of elements) {
      if (value.type !== "Object")
        continue;
      this.#defineGraphNode(value, false);

      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.SetElement);
      this.#guestObjectGraph.defineSetValue(parentObject, value, slotName === "SetData", edgeRelationship);
    }
  }
  //#endregion private methods
}
