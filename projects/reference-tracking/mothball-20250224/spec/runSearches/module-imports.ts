//#region preamble
import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ReferenceGraph
} from "../../source/types/ReferenceGraph.js";
import {
  TARGET_NODE_KEY,
  BuiltInJSTypeName,
  PRESUMED_HELD_NODE_KEY
} from "../../source/utilities/constants.js";

import {
  BottomUpSearchForChildEdges
} from "../../source/engine262-tools/search/BottomUpSearchForChildEdges.js";

import {
  ReferenceGraphImpl
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

import {
  runSearchesInGuestEngine
} from "../../source/runSearchesInGuestEngine.js";

import {
  addObjectToGraphs,
  addArrayIndexEdge,
  addPropertyNameEdge
} from "../support/fillReferenceGraph.js";

import {
  getReferenceSpecPath
} from "../support/projectRoot.js";

import {
  reparse
} from "../support/reparse.js";
//#endregion preamble

it("Simple graph searches: when there is an import involved (modules importing other modules), we can load them.", async () => {
  const pathToSearch = getReferenceSpecPath("module-imports/importWrapObject.js");

  const ExpectedGraph = new ReferenceGraphImpl;
  ExpectedGraph.foundTargetValue = true;
  ExpectedGraph.succeeded = true;

  const GraphCodes = {
    nodes: {
      objectHoldingTarget: 2,
    },

    parentEdgeIds: {
      objectHoldingTarget: 0,
      targetToHoldingObject: 1,
    },

    symbolKey: 3,
  }

  addObjectToGraphs(
    ExpectedGraph,
    TARGET_NODE_KEY,
    BuiltInJSTypeName.Object,
    "Object"
  );

  addObjectToGraphs(
    ExpectedGraph,
    PRESUMED_HELD_NODE_KEY,
    BuiltInJSTypeName.Array,
    "Array"
  );

  addObjectToGraphs(
    ExpectedGraph,
    GraphCodes.nodes.objectHoldingTarget,
    BuiltInJSTypeName.Object,
    "Object"
  );

  addArrayIndexEdge(
    ExpectedGraph,
    PRESUMED_HELD_NODE_KEY,
    0,
    GraphCodes.nodes.objectHoldingTarget,
    GraphCodes.parentEdgeIds.objectHoldingTarget,
  );

  addPropertyNameEdge(
    ExpectedGraph,
    GraphCodes.nodes.objectHoldingTarget,
    "value",
    TARGET_NODE_KEY,
    GraphCodes.parentEdgeIds.targetToHoldingObject,
  );

  BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);

  const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
  expect(graphs.size).toBe(1);

  const ActualGraph = graphs.get("importWrapObject");
  expect(ActualGraph).toBeDefined();
  if (!ActualGraph)
    return;

  expect(reparse(ActualGraph)).toEqual(reparse(ExpectedGraph));
});
