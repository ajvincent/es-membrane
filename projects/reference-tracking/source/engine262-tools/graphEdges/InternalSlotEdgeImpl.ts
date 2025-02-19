import {
  ChildReferenceEdgeType,
  type InternalSlotEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

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
    topDownSearch: TopDownSearchIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.InternalSlot,
      topDownSearch
    );
    this.slotName = slotName;
  }
}
