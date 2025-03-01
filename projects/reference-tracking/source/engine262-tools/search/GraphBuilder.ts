//#region preamble
import type {
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
  ThrowOr,
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
  readonly #guestObjectGraph: GuestObjectGraphIfc<GraphObjectMetadata, GraphRelationshipMetadata>;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #objectsToExcludeFromSearch = new Set<GuestEngine.ObjectValue>;
  readonly #objectQueue = new Set<GuestEngine.ObjectValue>;

  static #buildChildEdgeType(
    type: ChildReferenceEdgeType,
  ): GraphRelationshipMetadata
  {
    return {
      parentToChildEdgeType: type
    }
  }

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    realm: GuestEngine.ManagedRealm,
    hostObjectGraph: ObjectGraphIfc<object, symbol, GraphObjectMetadata, GraphRelationshipMetadata>,
  )
  {
    this.#realm = realm;
    this.#guestObjectGraph = new GuestObjectGraphImpl(hostObjectGraph);

    const targetMetadata: GraphObjectMetadata = buildObjectMetadata(
      BuiltInJSTypeName.Object,
      BuiltInJSTypeName.Object,
    );

    const heldValuesMetadata: GraphObjectMetadata = buildObjectMetadata(
      BuiltInJSTypeName.Array,
      BuiltInJSTypeName.Array,
    );

    this.#guestObjectGraph.defineTargetAndHeldValues(
      targetValue, targetMetadata, heldValues, heldValuesMetadata
    );

    this.#objectsToExcludeFromSearch.add(targetValue);
    this.#objectQueue.add(heldValues);
  }

  public run(): ThrowOr<void>
  {
    for (const guestObject of this.#objectQueue) {
      if (this.#objectsToExcludeFromSearch.has(guestObject))
        continue;
      if (GuestEngine.isProxyExoticObject(guestObject) === false) {
        this.#addObjectProperties(guestObject);
      }
    }
  }

  #defineGraphNode(
    guestObject: GuestEngine.ObjectValue,
    excludeFromSearch: boolean,
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
      switch (proto) {
        case this.#realm.Intrinsics["%Array.prototype%"]:
          return [BuiltInJSTypeName.Array, isDirectMatch ? BuiltInJSTypeName.Array : derivedClassName];
        case this.#realm.Intrinsics["%Object.prototype%"]:
          return [BuiltInJSTypeName.Object, isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName];
        case this.#realm.Intrinsics["%WeakRef.prototype%"]:
          return [BuiltInJSTypeName.WeakRef, isDirectMatch ? BuiltInJSTypeName.WeakRef : derivedClassName];
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
      const childGuestValue: GuestEngine.Value = GuestEngine.GetV(guestObject, guestKey);
      if (childGuestValue.type === "Object") {
        this.#defineGraphNode(childGuestValue, false);
        this.#addObjectProperty(guestObject, guestKey, childGuestValue);
      }
    }
  }

  #addObjectProperty(
    parentObject: GuestEngine.ObjectValue,
    key: GuestEngine.JSStringValue | GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue
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
}
