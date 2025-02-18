import type {
  ReadonlyDeep
} from "type-fest";

import {
  BuiltInCollectionName,
  PRESUMED_HELD_NODE_KEY,
  type ReferenceGraph,
  TARGET_NODE_KEY,
} from "../../../source/ReferenceGraph.js";

import {
  BottomUpSearchForChildEdges,
} from "../../../source/engine262-tools/search/BottomUpSearchForChildEdges.js";

import {
  ReferenceGraphImpl,
} from "../../../source/engine262-tools/search/ReferenceGraphImpl.js";

import {
  runSearchesInGuestEngine,
} from "../../../source/runSearchesInGuestEngine.js";

import {
  addArrayIndexEdge,
  addInternalSlotEdge,
  addObjectToGraphs,
} from "../../support/fillReferenceGraph.js";

import {
  getReferenceSpecPath,
} from "../../support/projectRoot.js"

import {
  reparse
} from "../../support/reparse.js";

describe("Simple graph searches, proxy support:", () => {
  let graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = new Map;
  beforeAll(async () => {
    const pathToSearch = getReferenceSpecPath("simple/proxies.js");
    graphs = await runSearchesInGuestEngine(pathToSearch);
  });

  let ExpectedGraph: ReferenceGraphImpl;
  beforeEach(() => {
    ExpectedGraph = new ReferenceGraphImpl;
    ExpectedGraph.foundTargetValue = true;
    ExpectedGraph.succeeded = true;

    addObjectToGraphs(
      ExpectedGraph,
      TARGET_NODE_KEY,
      BuiltInCollectionName.Object,
      "Object"
    );

    addObjectToGraphs(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      BuiltInCollectionName.Array,
      "Array"
    );
  });

  const ProxyHeldGraphCodes = {
    nodes: {
      proxy: 2,
      proxyTargetSlot: 3,
      proxyHandlerSlot: 4,
    },

    parentEdgeIds: {
      heldValuesToProxy: 0,
      proxyToTargetSlot: 1,
      proxyToHandlerSlot: 2,
    },
  };

  it("(internal: all searches ran)", () => {
    expect(graphs.size).toBe(9);
  });

  it("proxies hold shadow targets before revocation", () => {
    const heldValuesGraph = graphs.get("shadow target held before revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    addObjectToGraphs(
      ExpectedGraph,
      ProxyHeldGraphCodes.nodes.proxy,
      BuiltInCollectionName.Proxy,
      BuiltInCollectionName.Proxy,
    );

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      0,
      ProxyHeldGraphCodes.nodes.proxy,
      ProxyHeldGraphCodes.parentEdgeIds.heldValuesToProxy
    );

    addInternalSlotEdge(
      ExpectedGraph,
      ProxyHeldGraphCodes.nodes.proxy,
      `[[ProxyTarget]]`,
      TARGET_NODE_KEY,
      ProxyHeldGraphCodes.parentEdgeIds.proxyToTargetSlot,
      true
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });
});
