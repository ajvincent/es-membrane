import {
  GuestEngine,
  type ThrowOr
} from "../GuestEngine.js";

import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge
} from "source/ReferenceGraph.js";

export class SearchDriverInternal implements ReferenceGraph {
  #targetValue: GuestEngine.Value;
  #heldValues: readonly GuestEngine.Value[];
  #strongReferencesOnly: boolean;

  constructor(
    targetValue: GuestEngine.Value,
    heldValues: readonly GuestEngine.Value[],
    strongReferencesOnly: boolean
  ) {
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

  public run(): ThrowOr<void> {
    void (this.#targetValue);
    void (this.#heldValues);
    void (this.#strongReferencesOnly);
  }
}
