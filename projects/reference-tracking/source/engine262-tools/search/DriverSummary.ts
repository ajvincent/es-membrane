import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
} from "../../ReferenceGraph.js";

export default class SearchDriverSummary implements ReferenceGraph {
  nodes: ReferenceGraphNode[] = [];
  parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  succeeded = false;

  run(
    internalResults: ReadonlyDeep<ReferenceGraph>
  ): void
  {
    if (internalResults.succeeded === false)
      return;
  }
}
