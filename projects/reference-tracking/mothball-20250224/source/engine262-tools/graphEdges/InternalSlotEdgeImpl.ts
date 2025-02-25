import type {
  InternalSlotEdge,
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
    isStrongOwningReference: boolean,
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.InternalSlot,
      isStrongOwningReference,
      topDownSearch
    );
    this.slotName = slotName;
  }
}
