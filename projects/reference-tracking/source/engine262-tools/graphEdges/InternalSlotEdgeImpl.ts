import {
  ChildReferenceEdgeType,
  type InternalSlotEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap,
} from "../search/ValueToNumericKeyMap.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export class InternalSlotEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.InternalSlot>
implements InternalSlotEdge
{
  slotName: `[[${string}]]`;

  public constructor(
    parentObject: GuestEngine.ObjectValue,
    slotName: `[[${string}]]`,
    childObject: GuestEngine.ObjectValue,
    parentToChildEdgeId: number,
    numericKeyMap: ValueToNumericKeyMap<GuestEngine.ObjectValue>
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.InternalSlot,
      parentToChildEdgeId,
      numericKeyMap
    );
    this.slotName = slotName;
  }
}
