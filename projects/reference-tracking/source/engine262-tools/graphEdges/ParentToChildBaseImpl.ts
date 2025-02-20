import type {
  BaseParentToChildReferenceGraphEdge,
} from "../../types/ReferenceGraph.js";

import {
  ChildReferenceEdgeType
} from "../../utilities/constants.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

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
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    this.parentObjectKey = topDownSearch.getKeyForExistingHeldObject(parentObject);
    this.childObjectKey = topDownSearch.getKeyForExistingHeldObject(childObject);
    this.parentToChildEdgeId = topDownSearch.getNextParentToChildEdgeId();
    this.parentToChildEdgeType = edgeType;
  }
}
