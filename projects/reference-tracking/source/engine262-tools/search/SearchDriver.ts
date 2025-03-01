//#region preamble
import type {
  Graph
} from "@dagrejs/graphlib";

import {
  GuestEngine,
  type ThrowOr,
} from "../host-to-guest/GuestEngine.js";

import {
  ObjectGraphImpl
} from "../../graph-analysis/ObjectGraphImpl.js";

import type {
  CloneableGraphIfc
} from "../../graph-analysis/types/CloneableGraphIfc.js";

import type {
  SearchReferencesIfc
} from "../../graph-analysis/types/SearchReferencesIfc.js";

import type {
  GraphObjectMetadata
} from "../../types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../types/GraphRelationshipMetadata.js";

import {
  BuiltInJSTypeName
} from "../../utilities/constants.js";

import {
  GuestObjectGraphImpl
} from "./GuestObjectGraphImpl.js";

import {
  buildObjectMetadata
} from "./ObjectMetadata.js";
//#endregion preamble

export class SearchDriver
{
  readonly #strongReferencesOnly: boolean;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #guestObjectGraph: GuestObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  readonly #cloneableGraph: CloneableGraphIfc;
  readonly #searchReferences: SearchReferencesIfc;

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;
    this.#realm = realm;

    const hostGraphImpl = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
    this.#guestObjectGraph = new GuestObjectGraphImpl(hostGraphImpl);

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

    this.#cloneableGraph = hostGraphImpl;
    this.#searchReferences = hostGraphImpl;
  }

  public run(): ThrowOr<Graph | null>
  {
    void(this.#strongReferencesOnly);
    void(this.#realm);
    void(this.#cloneableGraph);
    void(this.#searchReferences);
    return null;
  }
}
