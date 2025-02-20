import {
  GuestEngine
} from "../GuestEngine.js";

import type {
  InternalSlotAnalyzer,
  InternalSlotAnalyzerStatic
} from "../types/InternalSlotAnalyzer.js";

import type {
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

import {
  InternalSlotTypesEnum
} from "./InternalSlotTypesEnum.js";

export class RevokerToProxyAnalyzer implements InternalSlotAnalyzer {
  public static registerSlotHandler(
    slotMap: Map<InternalSlotTypesEnum, InternalSlotAnalyzer>
  ): void
  {
    slotMap.set(InternalSlotTypesEnum.RevokerToProxy, new RevokerToProxyAnalyzer);
  }

  public addEdgesForObject(
    topDownSearch: GuestValueRegistarIfc,
    guestObjectValue: GuestEngine.ObjectValue
  ): void
  {
    const guestProxyValue = guestObjectValue as unknown as Record<
      "RevocableProxy", GuestEngine.ObjectValue | GuestEngine.NullValue
    >;
    const { RevocableProxy } = guestProxyValue;

    if (RevocableProxy.type === "Object") {
      topDownSearch.defineGraphNode(RevocableProxy);
      topDownSearch.addInternalSlotEdge(guestObjectValue, "[[RevocableProxy]]", RevocableProxy, true);
    }
  }
}
RevokerToProxyAnalyzer satisfies InternalSlotAnalyzerStatic;
