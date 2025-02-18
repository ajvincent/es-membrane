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

export class ProxyEdgeAnalyzer implements InternalSlotAnalyzer {
  public static registerSlotHandler(
    slotMap: Map<InternalSlotTypesEnum, InternalSlotAnalyzer>
  ): void
  {
    slotMap.set(InternalSlotTypesEnum.Proxy, new ProxyEdgeAnalyzer);
  }

  public addEdgesForObject(
    topDownSearch: TopDownSearchIfc,
    guestObjectValue: GuestEngine.ObjectValue
  ): void
  {
    const guestProxyValue = guestObjectValue as unknown as Record<
      "ProxyHandler" | "ProxyTarget", GuestEngine.ObjectValue | GuestEngine.NullValue
    >;
    const { ProxyHandler, ProxyTarget } = guestProxyValue;

    if (ProxyTarget.type === "Object") {
      topDownSearch.defineGraphNode(ProxyTarget);
      /* Proxy targets can be to real objects, or to "shadow targets" for
      bookkeeping (i.e. making sure the proxy invariants hold).  For my purposes
      in building a membrane, I use shadow targets.  So I don't want to search
      the shadow targets for properties, etc.
      */
      topDownSearch.excludeObjectFromSearch(ProxyTarget);
      topDownSearch.addInternalSlotEdge(guestObjectValue, "[[ProxyTarget]]", ProxyTarget);
    }

    if (ProxyHandler.type === "Object") {
      topDownSearch.defineGraphNode(ProxyHandler);
      topDownSearch.addInternalSlotEdge(guestObjectValue, "[[ProxyHandler]]", ProxyHandler);
    }
  }
}
ProxyEdgeAnalyzer satisfies InternalSlotAnalyzerStatic;
