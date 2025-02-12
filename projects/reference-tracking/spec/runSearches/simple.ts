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

import {
  ReferenceGraphImpl,
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

import {
  addObjectToGraphs,
  addArrayIndexEdge,
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
  
    expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
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
