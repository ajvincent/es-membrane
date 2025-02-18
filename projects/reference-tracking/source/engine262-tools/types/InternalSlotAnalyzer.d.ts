import type {
  GuestEngine
} from "../GuestEngine.ts";

import type {
  TopDownSearchIfc
} from "./TopDownSearchIfc.js";

export interface InternalSlotAnalyzerStatic {
  registerSlotHandler(
    slotMap: Map<string, InternalSlotAnalyzer>
  ): void;
}

export interface InternalSlotAnalyzer {
  addEdgesForObject(
    topDownSearch: TopDownSearchIfc,
    guestObjectValue: GuestEngine.ObjectValue,
  ): void;
}
