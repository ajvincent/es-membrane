import {
  type ChildToParentReferenceGraphEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap,
} from "../search/ValueToNumericKeyMap.js";

export default class ChildToParentImpl implements ChildToParentReferenceGraphEdge {
  readonly childObjectKey: number;
  readonly jointOwnerKeys: number[];
  readonly isStrongOwningReference: boolean;
  readonly parentToChildEdgeId: number;

  constructor(
    childObject: GuestEngine.ObjectValue,
    jointOwnerObjects: readonly GuestEngine.ObjectValue[],
    isStrongOwningReference: boolean,
    parentToChildEdgeId: number,
    numericKeyMap: ValueToNumericKeyMap,
  )
  {
    this.childObjectKey = numericKeyMap.getKeyForHeldObject(childObject);
    this.isStrongOwningReference = isStrongOwningReference;
    this.parentToChildEdgeId = parentToChildEdgeId;

    this.jointOwnerKeys = jointOwnerObjects.map(
      ownerValue => numericKeyMap.getKeyForHeldObject(ownerValue)
    );
  }
}
