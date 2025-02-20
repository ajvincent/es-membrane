//#region preamble
import type {
  ReadonlyDeep
} from "type-fest";

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
  type ReferenceGraph,
} from "../../../source/types/ReferenceGraph.js";

import {
  BuiltInCollectionName,
  PRESUMED_HELD_NODE_KEY,
  TARGET_NODE_KEY,
} from "../../../source/utilities/constants.js";

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

describe("Simple graph searches: weak references to direct values", () => {
  let graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = new Map;
  beforeAll(async () => {
    const pathToSearch = getReferenceSpecPath("simple/weakRefToTarget.js");
    graphs = await runSearchesInGuestEngine(pathToSearch);
  });

  it("(internal: all searches ran)", () => {
    expect(graphs.size).toBe(2);
  });

  it("are not reachable in a strong-references-only search", () => {
    const heldValuesGraph = graphs.get("WeakRef to target does not hold strongly");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });

  it("are reachable in a weak-references-included search", () => {
    const ExpectedGraph = new ReferenceGraphImpl;
    ExpectedGraph.foundTargetValue = true;
    ExpectedGraph.succeeded = true;

    addObjectToGraphs(
      ExpectedGraph,
      TARGET_NODE_KEY,
      BuiltInCollectionName.Object,
      BuiltInCollectionName.Object
    );

    addObjectToGraphs(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      BuiltInCollectionName.Array,
      "Array"
    );

    const GraphCodes = {
      nodes: {
        weakRef: 2,
      },

      parentEdgeIds: {
        arrayHoldingWeakRef: 0,
        weakRefHoldingTarget: 1,
      }
    };

    addObjectToGraphs(
      ExpectedGraph,
      GraphCodes.nodes.weakRef,
      BuiltInCollectionName.WeakRef,
      BuiltInCollectionName.WeakRef,
    );

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      0,
      GraphCodes.nodes.weakRef,
      GraphCodes.parentEdgeIds.arrayHoldingWeakRef
    );

    addInternalSlotEdge(
      ExpectedGraph,
      GraphCodes.nodes.weakRef,
      `[[WeakRefTarget]]`,
      TARGET_NODE_KEY,
      GraphCodes.parentEdgeIds.weakRefHoldingTarget,
      false
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);

    const heldValuesGraph = graphs.get("weakRef to target holds weakly");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });
});

describe("Simple graph searches: weak references to indirect values", () => {
  let graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = new Map;
  beforeAll(async () => {
    const pathToSearch = getReferenceSpecPath("simple/weakRefIndirectToTarget.js");
    graphs = await runSearchesInGuestEngine(pathToSearch);
  });

  it("(internal: all searches ran)", () => {
    expect(graphs.size).toBe(2);
  });

  it("are not reachable in a strong-references-only search", () => {
    const heldValuesGraph = graphs.get("WeakRef indirect to target does not hold strongly");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(EmptyReferenceGraph);
  });

  it("are reachable in a weak-references-included search", () => {
    const ExpectedGraph = new ReferenceGraphImpl;
    ExpectedGraph.foundTargetValue = true;
    ExpectedGraph.succeeded = true;

    addObjectToGraphs(
      ExpectedGraph,
      TARGET_NODE_KEY,
      BuiltInCollectionName.Object,
      BuiltInCollectionName.Object
    );

    addObjectToGraphs(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      BuiltInCollectionName.Array,
      "Array"
    );

    const GraphCodes = {
      nodes: {
        weakRef: 2,
        indirectTarget: 3,
      },

      parentEdgeIds: {
        arrayHoldingWeakRef: 0,
        weakRefHoldingIndirectTarget: 1,
        indirectToRealTarget: 2,
      }
    };

    addObjectToGraphs(
      ExpectedGraph,
      GraphCodes.nodes.weakRef,
      BuiltInCollectionName.WeakRef,
      BuiltInCollectionName.WeakRef,
    );

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      0,
      GraphCodes.nodes.weakRef,
      GraphCodes.parentEdgeIds.arrayHoldingWeakRef
    );

    addObjectToGraphs(
      ExpectedGraph,
      GraphCodes.nodes.indirectTarget,
      BuiltInCollectionName.Object,
      BuiltInCollectionName.Object
    );

    addInternalSlotEdge(
      ExpectedGraph,
      GraphCodes.nodes.weakRef,
      `[[WeakRefTarget]]`,
      GraphCodes.nodes.indirectTarget,
      GraphCodes.parentEdgeIds.weakRefHoldingIndirectTarget,
      false
    );

    addPropertyNameEdge(
      ExpectedGraph,
      GraphCodes.nodes.indirectTarget,
      "target",
      TARGET_NODE_KEY,
      GraphCodes.parentEdgeIds.indirectToRealTarget
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);

    const heldValuesGraph = graphs.get("weakRef indirect to target holds weakly");
    expect(heldValuesGraph).withContext("held values graph exists").toBeDefined();
    if (!heldValuesGraph)
      return;

    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });
});
