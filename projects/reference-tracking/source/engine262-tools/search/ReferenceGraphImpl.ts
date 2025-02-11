import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
} from "../../ReferenceGraph.js";

export class ReferenceGraphImpl implements ReferenceGraph {
  nodes: ReferenceGraphNode[] = [];
  parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  succeeded = false;
  foundTargetValue = false;
}
