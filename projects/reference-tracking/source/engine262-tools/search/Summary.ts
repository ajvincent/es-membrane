import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
} from "../../ReferenceGraph.js";

import type {
  SearchDriverInternal
} from "./Internal.js";

export class SearchDriverSummary implements ReferenceGraph {
  nodes: ReferenceGraphNode[] = [];
  parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  succeeded = false;

  run(
    internalResults: SearchDriverInternal
  ) {
    if (internalResults.succeeded === false)
      return;
  }
}
