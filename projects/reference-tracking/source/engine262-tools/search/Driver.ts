import {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ChildToParentReferenceGraphEdge,
  ParentToChildReferenceGraphEdge,
  ReferenceGraph,
  ReferenceGraphNode,
} from "../../ReferenceGraph.js";

export class SearchDriver implements ReferenceGraph
{
  #internal: SearchDriverInternal;
  #summary: SearchDriverSummary;

  constructor(
    targetValue: GuestEngine.Value,
    heldValues: readonly GuestEngine.Value[],
    strongReferencesOnly: boolean
  )
  {
    this.#internal = new SearchDriverInternal(targetValue, heldValues, strongReferencesOnly);
    this.#summary = new SearchDriverSummary;
  }

  get nodes(): ReferenceGraphNode[] {
    return this.#summary.nodes;
  }

  get parentToChildEdges(): ParentToChildReferenceGraphEdge[] {
    return this.#summary.parentToChildEdges;
  };

  get childToParentEdges(): ChildToParentReferenceGraphEdge[] {
    return this.#summary.childToParentEdges;
  }

  get succeeded(): boolean {
    return this.#summary.succeeded;
  }

  public run(): void {
    this.#internal.run();
    this.#summary.run(this.#internal);
  }
}

class SearchDriverInternal implements ReferenceGraph
{
  #targetValue: GuestEngine.Value;
  #heldValues: readonly GuestEngine.Value[];
  #strongReferencesOnly: boolean;

  constructor(
    targetValue: GuestEngine.Value,
    heldValues: readonly GuestEngine.Value[],
    strongReferencesOnly: boolean
  )
  {
    this.#targetValue = targetValue;
    this.#heldValues = heldValues;
    this.#strongReferencesOnly = strongReferencesOnly;
  }

  get nodes(): ReferenceGraphNode[] {
    return [];
  }

  get parentToChildEdges(): ParentToChildReferenceGraphEdge[] {
    return [];
  };

  get childToParentEdges(): ChildToParentReferenceGraphEdge[] {
    return [];
  }

  succeeded = false;

  public run(): void {
    void(this.#targetValue);
    void(this.#heldValues);
    void(this.#strongReferencesOnly);
  }
}

class SearchDriverSummary implements ReferenceGraph
{
  nodes: ReferenceGraphNode[] = [];
  parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  succeeded = false;

  run(
    internalResults: SearchDriverInternal
  )
  {
    if (internalResults.succeeded === false)
      return;
  }
}
