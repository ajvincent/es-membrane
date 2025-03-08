//#region preamble
import type {
  Graph
} from "@dagrejs/graphlib";

import {
  GuestEngine,
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
    internalErrorTrap?: () => void,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;

    const hostGraphImpl = new ObjectGraphImpl<
      GraphObjectMetadata, GraphRelationshipMetadata
    >(internalErrorTrap);
    this.#graphBuilder = new GraphBuilder(
      targetValue,
      heldValues,
      realm,
      hostGraphImpl,
      internalErrorTrap
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
