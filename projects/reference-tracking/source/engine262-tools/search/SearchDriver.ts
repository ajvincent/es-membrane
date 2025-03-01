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
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;

    const hostGraphImpl = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
    this.#graphBuilder = new GraphBuilder(
      targetValue,
      heldValues,
      realm,
      hostGraphImpl
    );

    this.#cloneableGraph = hostGraphImpl;
    this.#searchReferences = hostGraphImpl;
  }

  public run(): ThrowOr<Graph | null>
  {
    const buildResult = this.#graphBuilder.run();
    if (buildResult)
      return buildResult;

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
