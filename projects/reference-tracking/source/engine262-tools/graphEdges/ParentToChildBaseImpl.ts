import {
  ChildReferenceEdgeType,
  type BaseParentToChildReferenceGraphEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

export default
abstract class ParentToChildBaseImpl<EdgeType extends ChildReferenceEdgeType>
implements BaseParentToChildReferenceGraphEdge<EdgeType>
{
  readonly parentObjectKey: number;
  readonly childObjectKey: number;
  readonly parentToChildEdgeType: EdgeType;
  readonly parentToChildEdgeId: number;

  constructor(
    parentObject: GuestEngine.ObjectValue,
    childObject: GuestEngine.ObjectValue,
    edgeType: EdgeType,
    topDownSearch: TopDownSearchIfc,
  )
  {
    this.parentObjectKey = topDownSearch.getKeyForExistingHeldObject(parentObject);
    this.childObjectKey = topDownSearch.getKeyForExistingHeldObject(childObject);
    this.parentToChildEdgeId = topDownSearch.getNextParentToChildEdgeId();
    this.parentToChildEdgeType = edgeType;
  }
}
