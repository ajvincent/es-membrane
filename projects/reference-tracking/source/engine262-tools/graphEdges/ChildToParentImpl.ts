import type {
  ChildToParentReferenceGraphEdge,
} from "../../types/ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import {
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

export class ChildToParentImpl implements ChildToParentReferenceGraphEdge {
  readonly childObjectKey: number;
  readonly jointOwnerKeys: number[];
  readonly parentToChildEdgeId: number;
  isMarkedStrongEdge = false;

  constructor(
    childObject: GuestEngine.ObjectValue,
    jointOwnerObjects: readonly GuestEngine.ObjectValue[],
    parentToChildEdgeId: number,
    topDownSearch: GuestValueRegistarIfc
  )
  {
    this.childObjectKey = topDownSearch.getKeyForExistingHeldObject(childObject);
    this.parentToChildEdgeId = parentToChildEdgeId;

    this.jointOwnerKeys = jointOwnerObjects.map(
      ownerValue => topDownSearch.getKeyForExistingHeldObject(ownerValue)
    );
  }
}
