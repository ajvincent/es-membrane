import type {
  ChildToParentReferenceGraphEdge,
} from "../../types/ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

export class ChildToParentImpl implements ChildToParentReferenceGraphEdge {
  readonly childObjectKey: number;
  readonly jointOwnerKeys: number[];
  readonly isStrongOwningReference: boolean;
  readonly parentToChildEdgeId: number;

  constructor(
    childObject: GuestEngine.ObjectValue,
    jointOwnerObjects: readonly GuestEngine.ObjectValue[],
    isStrongOwningReference: boolean,
    parentToChildEdgeId: number,
    topDownSearch: TopDownSearchIfc
  )
  {
    this.childObjectKey = topDownSearch.getKeyForExistingHeldObject(childObject);
    this.isStrongOwningReference = isStrongOwningReference;
    this.parentToChildEdgeId = parentToChildEdgeId;

    this.jointOwnerKeys = jointOwnerObjects.map(
      ownerValue => topDownSearch.getKeyForExistingHeldObject(ownerValue)
    );
  }
}
