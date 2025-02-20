import {
  GuestEngine
} from "../GuestEngine.js";

import type {
  InternalSlotAnalyzer,
  InternalSlotAnalyzerStatic
} from "../types/InternalSlotAnalyzer.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

import {
  InternalSlotTypesEnum
} from "./InternalSlotTypesEnum.js";

export class WeakRefAnalyzer implements InternalSlotAnalyzer {
  public static registerSlotHandler(
    slotMap: Map<InternalSlotTypesEnum, InternalSlotAnalyzer>
  ): void
  {
    slotMap.set(InternalSlotTypesEnum.WeakRef, new WeakRefAnalyzer);
  }

  public addEdgesForObject(
    topDownSearch: TopDownSearchIfc,
    guestObjectValue: GuestEngine.ObjectValue
  ): void
  {
    const guestProxyValue = guestObjectValue as unknown as Record<
      "WeakRefTarget", GuestEngine.ObjectValue | GuestEngine.NullValue
    >;
    const { WeakRefTarget } = guestProxyValue;

    if (WeakRefTarget.type === "Object") {
      topDownSearch.defineGraphNode(WeakRefTarget);
      topDownSearch.addInternalSlotEdge(guestObjectValue, "[[WeakRefTarget]]", WeakRefTarget, false);
    }
  }
}
WeakRefAnalyzer satisfies InternalSlotAnalyzerStatic;
