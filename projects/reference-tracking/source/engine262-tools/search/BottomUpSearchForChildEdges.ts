import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ReferenceGraph,
  /*
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
  */
} from "../../ReferenceGraph.js";

import {
  ReferenceGraphImpl
} from "./ReferenceGraphImpl.js";

export default class BottomUpSearchForChildEdges {
  run(
    internalResults: ReadonlyDeep<ReferenceGraph>
  ): ReadonlyDeep<ReferenceGraph>
  {
    const graph = new ReferenceGraphImpl;
    if (internalResults.succeeded === false)
      return graph;
    graph.succeeded = true;
    graph.foundTargetValue = internalResults.foundTargetValue;
    return graph;
  }
}
