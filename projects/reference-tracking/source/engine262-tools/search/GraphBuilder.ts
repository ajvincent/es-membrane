//#region preamble
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
//#endregion preamble

export class GraphBuilder {
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

  readonly #intrinsicToBuiltInNameMap: ReadonlyMap<GuestEngine.Value, BuiltInJSTypeName>;
  readonly #intrinsics: Pick<WeakSet<GuestEngine.Value>, "has">;

  readonly #objectsToExcludeFromSearch = new Set<GuestEngine.ObjectValue>;
  readonly #objectQueue = new Set<GuestEngine.ObjectValue>;

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

  public run(): void
  {
    for (const guestObject of this.#objectQueue) {
      if (this.#objectsToExcludeFromSearch.has(guestObject))
        continue;
      if (GuestEngine.isProxyExoticObject(guestObject) === false) {
        this.#addObjectProperties(guestObject);
        this.#addConstructorOf(guestObject);
      }

      this.#lookupAndAddInternalSlots(guestObject);
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
    if (guestWeakKey.type === "Object")
      this.#defineGraphObjectNode(guestWeakKey, excludeFromSearch);
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

    let proto: GuestEngine.ObjectValue | GuestEngine.NullValue = value.GetPrototypeOf();
    while (proto.type !== "Null") {
      const builtIn = this.#intrinsicToBuiltInNameMap.get(proto);
      if (builtIn) {
        return [builtIn, isDirectMatch ? builtIn : derivedClassName];
      }

      if (isDirectMatch) {
        const guestCtor = GuestEngine.GetV(value, GraphBuilder.#stringConstants.get("constructor")!);
        if (guestCtor.type === "Object") {
          const guestName = GuestEngine.GetV(guestCtor, GraphBuilder.#stringConstants.get("name")!);
          if (guestName.type === "String") {
            derivedClassName = guestName.stringValue();
          }
        }

        isDirectMatch = false;
      }

      value = proto;
      proto = value.GetPrototypeOf();
    }

    return [BuiltInJSTypeName.Object, isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName];
  }

  #addObjectProperties(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    for (const guestKey of guestObject.OwnPropertyKeys()) {
      if (guestKey.type === "Symbol") {
        this.#defineGraphSymbolNode(guestKey);
      }

      const childGuestValue: GuestEngine.Value = GuestEngine.GetV(guestObject, guestKey);
      if (childGuestValue.type === "Object" || childGuestValue.type === "Symbol") {
        this.#defineGraphNode(childGuestValue, false);
        this.#addObjectProperty(guestObject, guestKey, childGuestValue);
      }
    }
  }

  #addObjectProperty(
    parentObject: GuestEngine.ObjectValue,
    key: GuestEngine.JSStringValue | GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue | GuestEngine.SymbolValue
  ): void
  {
    if (GuestEngine.isArrayIndex(key)) {
      GuestEngine.Assert(key.type === "String");
      const localIndex = parseInt(key.stringValue());

      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.ArrayIndex);
      this.#guestObjectGraph.defineProperty(
        parentObject, localIndex, childObject, edgeRelationship
      );
    }

    else if (key.type === "String") {
      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertyName);
      this.#guestObjectGraph.defineProperty(parentObject, key.stringValue(), childObject, edgeRelationship);
    }

    else {
      this.#defineGraphSymbolNode(key);
      const keyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.SymbolKey);
      this.#guestObjectGraph.defineAsSymbolKey(parentObject, key, keyRelationship);

      const propertyRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertySymbol);
      this.#guestObjectGraph.defineProperty(parentObject, key, childObject, propertyRelationship);
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
        if (this.#intrinsics.has(proto) === false)
          this.#addInternalSlotIfObject(guestObject, "Prototype", false, true);
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
    const guestCtor = GuestEngine.GetV(
      guestObject, GraphBuilder.#stringConstants.get("constructor")!
    );

    const guestCtorProto = GuestEngine.GetPrototypeFromConstructor(
      guestCtor, "%Object.prototype%"
    );
    if (this.#intrinsicToBuiltInNameMap.has(guestCtorProto))
      return;
    if (GuestEngine.SameValue(guestCtorProto, guestObject).booleanValue())
      return;

    GuestEngine.Assert(guestCtor.type === "Object");
    GuestEngine.Assert(GuestEngine.IsConstructor(guestCtor).booleanValue());

    this.#defineGraphNode(guestCtor, false);
    const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.InstanceOf);
    this.#guestObjectGraph.defineConstructorOf(guestObject, guestCtor, edgeRelationship);
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
