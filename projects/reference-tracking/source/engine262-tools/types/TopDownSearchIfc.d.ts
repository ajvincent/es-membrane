import { GuestEngine } from "../GuestEngine.ts";

export interface TopDownSearchIfc {
  defineGraphNode(
    guestObject: GuestEngine.ObjectValue
  ): void;

  excludeObjectFromSearch(
    guestObject: GuestEngine.ObjectValue
  )

  addInternalSlotEdge(
    parentObject: GuestEngine.ObjectValue,
    slotName: `[[${string}]]`,
    childObject: GuestEngine.ObjectValue
  ): void;
}
