import type {
  GuestEngine
} from "../GuestEngine.ts";

import type {
  GuestValueRegistarIfc
} from "./GuestValueRegistrar.js";

export interface InternalSlotAnalyzerStatic {
  registerSlotHandler(
    slotMap: Map<string, InternalSlotAnalyzer>
  ): void;
}

export interface InternalSlotAnalyzer {
  addEdgesForObject(
    topDownSearch: GuestValueRegistarIfc,
    guestObjectValue: GuestEngine.ObjectValue,
  ): void;
}
