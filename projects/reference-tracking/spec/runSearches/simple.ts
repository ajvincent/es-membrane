import type {
  ReadonlyDeep
} from "type-fest";

import {
  BuiltInCollectionName,
  PRESUMED_HELD_NODE_KEY,
  type ReferenceGraph,
  TARGET_NODE_KEY,
} from "../../source/ReferenceGraph.js";

import {
  runSearchesInGuestEngine,
} from "../../source/runSearchesInGuestEngine.js";

import BottomUpSearchForChildEdges from "../../source/engine262-tools/search/BottomUpSearchForChildEdges.js";

import {
  ReferenceGraphImpl,
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

import {
  addObjectToGraphs,
  addArrayIndexEdge,
  addPropertyNameEdge,
} from "../support/fillReferenceGraph.js";

import {
  getReferenceSpecPath,
} from "../support/projectRoot.js"

import {
  reparse
} from "../support/reparse.js";

describe("Simple graph searches: " , () => {
  it("we can find the target when it's among the held values", async () => {
    const pathToSearch = getReferenceSpecPath("simple/targetInHeldValuesArray.js");
    const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
    expect(graphs.size).toBe(1);
    const heldValuesGraph = graphs.get("targetHeldValuesArray");
    expect(heldValuesGraph).toBeDefined();
    if (!heldValuesGraph)
      return;

    const ExpectedGraph = new ReferenceGraphImpl;
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

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      1,
      TARGET_NODE_KEY,
      1
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
  });

  it("we can find the target when it's inside an array literal among the held values", async () => {
    const pathToSearch = getReferenceSpecPath("simple/targetIsElementOfHeldArray.js");
    const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
    expect(graphs.size).toBe(1);

    const ActualGraph = graphs.get("targetIsElementOfHeldArray");
    expect(ActualGraph).toBeDefined();
    if (!ActualGraph)
      return;

    const ExpectedGraph = new ReferenceGraphImpl;
    ExpectedGraph.foundTargetValue = true;
    ExpectedGraph.succeeded = true;

    const GraphCodes = {
      nodes: {
        arrayHoldingTarget: 3,
      },

      parentEdgeIds: {
        arrayHoldingTarget: 1,
        targetToHoldingArray: 3,
      }
    }

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
    addObjectToGraphs(
      ExpectedGraph,
      GraphCodes.nodes.arrayHoldingTarget,
      BuiltInCollectionName.Array,
      "Array"
    );

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      1,
      GraphCodes.nodes.arrayHoldingTarget,
      GraphCodes.parentEdgeIds.arrayHoldingTarget,
    );

    addArrayIndexEdge(
      ExpectedGraph,
      GraphCodes.nodes.arrayHoldingTarget,
      0,
      TARGET_NODE_KEY,
      GraphCodes.parentEdgeIds.targetToHoldingArray,
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(ActualGraph)).toEqual(reparse(ExpectedGraph));
  });

  it("we can find the target when it's inside an object literal among the held values", async () => {
    const pathToSearch = getReferenceSpecPath("simple/targetIsElementOfHeldObject.js");
    const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
    expect(graphs.size).toBe(1);

    const ActualGraph = graphs.get("targetIsElementOfHeldObject");
    expect(ActualGraph).toBeDefined();
    if (!ActualGraph)
      return;

    const ExpectedGraph = new ReferenceGraphImpl;
    ExpectedGraph.foundTargetValue = true;
    ExpectedGraph.succeeded = true;

    const GraphCodes = {
      nodes: {
        objectHoldingTarget: 3,
      },

      parentEdgeIds: {
        objectHoldingTarget: 1,
        targetToHoldingArray: 3,
      }
    }

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
    addObjectToGraphs(
      ExpectedGraph,
      GraphCodes.nodes.objectHoldingTarget,
      BuiltInCollectionName.Object,
      "Object"
    );

    addArrayIndexEdge(
      ExpectedGraph,
      PRESUMED_HELD_NODE_KEY,
      1,
      GraphCodes.nodes.objectHoldingTarget,
      GraphCodes.parentEdgeIds.objectHoldingTarget,
    );

    addPropertyNameEdge(
      ExpectedGraph,
      GraphCodes.nodes.objectHoldingTarget,
      "target",
      TARGET_NODE_KEY,
      GraphCodes.parentEdgeIds.targetToHoldingArray,
    );

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);
    expect(reparse(ActualGraph)).toEqual(reparse(ExpectedGraph));
  });
  
  it("when the target is not reachable, we report so", async () => {
    const pathToSearch = getReferenceSpecPath("simple/targetUnreachable.js");
    const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
    expect(graphs.size).toBe(1);
  
    const targetUnreachableGraph = graphs.get("targetUnreachable");
    expect(targetUnreachableGraph).toBeDefined();
    if (!targetUnreachableGraph)
      return;
  
    const ExpectedGraph = new ReferenceGraphImpl;
    ExpectedGraph.foundTargetValue = false;
    ExpectedGraph.succeeded = true;
  
    expect(targetUnreachableGraph).toEqual(ExpectedGraph);
  });
});
