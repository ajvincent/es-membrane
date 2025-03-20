//#region preamble
import type {
  Graph
} from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../graph-analysis/ObjectGraphImpl.js";

import type {
  CloneableGraphIfc
} from "../../graph-analysis/types/CloneableGraphIfc.js";

import type {
  EngineWeakKey
} from "../../graph-analysis/types/ObjectGraphIfc.js";

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
  SearchConfiguration
} from "../../types/SearchConfiguration.js";

import type {
  GuestEngine,
} from "../host-to-guest/GuestEngine.js";

import {
  GraphBuilder
} from "./GraphBuilder.js";
//#endregion preamble

export class SearchDriver
{
  readonly #strongReferencesOnly: boolean;
  readonly #graphBuilder: GraphBuilder;

  readonly #searchReferences: SearchReferencesIfc;
  readonly #cloneableGraph: CloneableGraphIfc;

  constructor(
    targetValue: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
    searchConfiguration?: SearchConfiguration,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;

    const hostGraphImpl = new ObjectGraphImpl<
      GraphObjectMetadata, GraphRelationshipMetadata
    >(searchConfiguration?.internalErrorTrap);
    this.#graphBuilder = new GraphBuilder(
      targetValue,
      heldValues,
      realm,
      hostGraphImpl,
      searchConfiguration
    );

    this.#cloneableGraph = hostGraphImpl;
    this.#searchReferences = hostGraphImpl;
  }

  public run(): Graph | null
  {
    this.#graphBuilder.run();

    if (this.#strongReferencesOnly) {
      this.#searchReferences.markStrongReferencesFromHeldValues();
    }
    this.#searchReferences.summarizeGraphToTarget(this.#strongReferencesOnly);

    const graph = this.#cloneableGraph.cloneGraph();
    if (graph.nodeCount() === 0)
      return null;

    return graph;
  }
}
