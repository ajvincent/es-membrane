import {
  ChildReferenceEdgeType,
  type BaseParentToChildReferenceGraphEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap,
} from "../search/ValueToNumericKeyMap.js";

export default
abstract class ParentToChildBaseImpl<EdgeType extends ChildReferenceEdgeType>
implements BaseParentToChildReferenceGraphEdge<EdgeType>
{
  readonly parentObjectKey: number;
  readonly childObjectKey: number;
  readonly childEdgeType: EdgeType;

  constructor(
    parentObject: GuestEngine.ObjectValue,
    childObject: GuestEngine.ObjectValue,
    edgeType: EdgeType,
    numericKeyMap: ValueToNumericKeyMap,
  )
  {
    this.parentObjectKey = numericKeyMap.getKeyForHeldObject(parentObject);
    this.childObjectKey = numericKeyMap.getKeyForHeldObject(childObject);
    this.childEdgeType = edgeType;
  }
}
