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

  readonly #objectsToExcludeFromSearch = new Set<GuestEngine.ObjectValue>;
  readonly #objectQueue = new Set<GuestEngine.ObjectValue>;

  #internalErrorTrap?: () => void;

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    realm: GuestEngine.ManagedRealm,
    hostObjectGraph: ObjectGraphIfc<object, symbol, GraphObjectMetadata, GraphRelationshipMetadata>,
    internalErrorTrap?: () => void,
  )
  {
    this.#internalErrorTrap = internalErrorTrap;
    this.#intrinsicToBuiltInNameMap = GraphBuilder.#builtInNamesFromInstrinsics(realm);

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

    this.#objectsToExcludeFromSearch.add(targetValue);
    this.#objectQueue.add(heldValues);
  }

  #throwInternalError(error: Error): never {
    if (this.#internalErrorTrap) {
      this.#internalErrorTrap();
    }
    throw error;
  }

  public run(): void
  {
    for (const guestObject of this.#objectQueue) {
      if (this.#objectsToExcludeFromSearch.has(guestObject))
        continue;
      if (GuestEngine.isProxyExoticObject(guestObject) === false) {
        this.#addObjectProperties(guestObject);
      }

      this.#lookupAndAddInternalSlots(guestObject);
    }
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
    guestObject: GuestEngine.ObjectValue,
  ): [BuiltInJSTypeName, string]
  {
    if (GuestEngine.isProxyExoticObject(guestObject)) {
      return [BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy];
    }

    let isDirectMatch = true;
    let value: GuestEngine.ObjectValue = guestObject;

    // this will be fixed in the near future
    // eslint-disable-next-line prefer-const
    let derivedClassName: string = "(unknown)";

    let proto: GuestEngine.ObjectValue | GuestEngine.NullValue = value.GetPrototypeOf();
    while (proto.type !== "Null") {
      const builtIn = this.#intrinsicToBuiltInNameMap.get(proto);
      if (builtIn) {
        return [builtIn, isDirectMatch ? builtIn : derivedClassName];
      }

      isDirectMatch = false;
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
      const edgeRelationship = GraphBuilder.#buildChildEdgeType(ChildReferenceEdgeType.PropertySymbol);
      this.#guestObjectGraph.defineProperty(parentObject, key, childObject, edgeRelationship);
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
}
