//#region preamble
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
  addPropertyNameEdge,
  EmptyReferenceGraph,
} from "../../support/fillReferenceGraph.js";

import {
  getReferenceSpecPath,
} from "../../support/projectRoot.js"

import {
  reparse
} from "../../support/reparse.js";
//#endregion preamble

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
      handlerSearchTarget: 6,
    },

    parentEdgeIds: {
      heldValuesToProxy: 0,
      proxyToTargetSlot: 1,
      proxyToHandlerSlot: 2,
      handlerToSearchTarget: 3,
    },
  };

  const RevokerHeldGraphCodes = {
    nodes: {
      revoke: 2,
      proxy: 3,
      proxyTargetSlot: 4,
      proxyHandlerSlot: 5,
    },

    parentEdgeIds: {
      heldValuesToRevoke: 0,
      revokeToProxy: 1,
      proxyToTargetSlot: 2,
      proxyToHandlerSlot: 3,
    }
  }

  function addObjectTarget(targetType: BuiltInCollectionName) {
    addObjectToGraphs(
      ExpectedGraph,
      TARGET_NODE_KEY,
      targetType,
      targetType
    );
  }

  it("(internal: all searches ran)", () => {
    expect(graphs.size).toBe(9);
  });

  it("proxies hold shadow targets before revocation", () => {
    const heldValuesGraph = graphs.get("shadow target held before revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    addObjectTarget(BuiltInCollectionName.Object);

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

  it("proxies hold proxy handlers before revocation", () => {
    const heldValuesGraph = graphs.get("proxy handler held before revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    addObjectTarget(BuiltInCollectionName.Object);

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
      `[[ProxyHandler]]`,
      TARGET_NODE_KEY,
      ProxyHeldGraphCodes.parentEdgeIds.proxyToHandlerSlot,
      true
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });

  it("revokers hold proxies before revocation", () => {
    const heldValuesGraph = graphs.get("proxy held before revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    addObjectTarget(BuiltInCollectionName.Proxy);

    addObjectToGraphs(
      ExpectedGraph,
      RevokerHeldGraphCodes.nodes.revoke,
      BuiltInCollectionName.Object,
      "(unknown)"
    );

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      0,
      RevokerHeldGraphCodes.nodes.revoke,
      RevokerHeldGraphCodes.parentEdgeIds.heldValuesToRevoke
    );

    addInternalSlotEdge(
      ExpectedGraph,
      RevokerHeldGraphCodes.nodes.revoke,
      `[[RevocableProxy]]`,
      TARGET_NODE_KEY,
      RevokerHeldGraphCodes.parentEdgeIds.revokeToProxy,
      true
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });

  it("proxies do not hold references to their revokers", () => {
    const heldValuesGraph = graphs.get("revoke not held by proxy");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });

  it("proxies do not search shadow targets", () => {
    const heldValuesGraph = graphs.get("shadow search target");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });

  it("proxies search proxy handlers", () => {
    const heldValuesGraph = graphs.get("proxy handler search target");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    addObjectTarget(BuiltInCollectionName.Object);

    addObjectToGraphs(
      ExpectedGraph,
      ProxyHeldGraphCodes.nodes.proxy,
      BuiltInCollectionName.Proxy,
      BuiltInCollectionName.Proxy,
    );

    addObjectToGraphs(
      ExpectedGraph,
      ProxyHeldGraphCodes.nodes.proxyHandlerSlot,
      BuiltInCollectionName.Object,
      BuiltInCollectionName.Object
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
      `[[ProxyHandler]]`,
      ProxyHeldGraphCodes.nodes.proxyHandlerSlot,
      ProxyHeldGraphCodes.parentEdgeIds.proxyToHandlerSlot,
      true
    );

    addPropertyNameEdge(
      ExpectedGraph,
      ProxyHeldGraphCodes.nodes.proxyHandlerSlot,
      "searchTarget",
      TARGET_NODE_KEY,
      ProxyHeldGraphCodes.parentEdgeIds.handlerToSearchTarget
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });

  it("proxies do not hold references to their shadow targets after revocation", () => {
    const heldValuesGraph = graphs.get("shadow target held by proxy after revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });

  it("proxies do not hold references to their proxy handlers after revocation", () => {
    const heldValuesGraph = graphs.get("proxy handler held by proxy after revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });

  it("revokers do not hold references to their proxies after revocation", () => {
    const heldValuesGraph = graphs.get("proxy held after revocation");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });
});
