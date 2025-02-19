import { GuestEngine } from "../GuestEngine.ts";

export interface TopDownSearchIfc {
  defineGraphNode(
    guestObject: GuestEngine.ObjectValue
  ): void;

  excludeObjectFromSearch(
    guestObject: GuestEngine.ObjectValue
  )

  getNextParentToChildEdgeId(): number;

  getKeyForExistingHeldObject(objectValue: GuestEngine.ObjectValue): number;
  getKeyForExistingHeldSymbol(symbolValue: GuestEngine.SymbolValue): number;

  addInternalSlotEdge(
    parentObject: GuestEngine.ObjectValue,
    slotName: `[[${string}]]`,
    childObject: GuestEngine.ObjectValue
  ): void;
}
