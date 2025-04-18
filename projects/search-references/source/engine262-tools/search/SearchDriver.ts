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

import {
  SearchConfiguration
} from "../../public/host/types/SearchConfiguration.js";

import type {
  GraphObjectMetadata
} from "../../types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../types/GraphRelationshipMetadata.js";

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

  readonly #targetValue: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>;
  readonly #heldValues: GuestEngine.ObjectValue;

  readonly #searchConfiguration?: SearchConfiguration;

  constructor(
    targetValue: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
    resultsKey: string,
    searchConfiguration?: SearchConfiguration,
  )
  {
    this.#targetValue = targetValue;
    this.#heldValues = heldValues;
    this.#strongReferencesOnly = strongReferencesOnly;
    this.#searchConfiguration = searchConfiguration;

    const hostGraphImpl = new ObjectGraphImpl<
      GraphObjectMetadata, GraphRelationshipMetadata
    >(searchConfiguration);
    this.#graphBuilder = new GraphBuilder(
      realm,
      hostGraphImpl,
      resultsKey,
      searchConfiguration
    );

    this.#cloneableGraph = hostGraphImpl;
    this.#searchReferences = hostGraphImpl;
  }

  public * run(): GuestEngine.Evaluator<Graph | null>
  {
    if (this.#searchConfiguration?.beginSearch) {
      this.#searchConfiguration.beginSearch(
        this.#graphBuilder.sourceSpecifier, this.#graphBuilder.resultsKey
      );
    }
    try {
      yield * this.#graphBuilder.run(this.#targetValue, this.#heldValues);

      if (this.#strongReferencesOnly) {
        this.#searchReferences.markStrongReferencesFromHeldValues();
      }
      this.#searchReferences.summarizeGraphToTarget(this.#strongReferencesOnly);
  
      const graph = this.#cloneableGraph.cloneGraph();
      if (graph.nodeCount() === 0)
        return null;

      return graph;
    }
    finally {
      if (this.#searchConfiguration?.endSearch) {
        this.#searchConfiguration.endSearch(
          this.#graphBuilder.sourceSpecifier, this.#graphBuilder.resultsKey
        );
      }
    }
  }
}
