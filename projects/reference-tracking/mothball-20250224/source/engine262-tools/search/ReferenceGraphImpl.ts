import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
  CollectionToKeyValueEdge,
} from "../../types/ReferenceGraph.js";

export class ReferenceGraphImpl implements ReferenceGraph {
  nodes: ReferenceGraphNode[] = [];
  parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  collectionToKeyValueEdges: CollectionToKeyValueEdge[] = [];

  succeeded = false;
  foundTargetValue = false;
}
