import {
  buildDagreGraph
} from "../../source/dagre-tools/buildGraph.js";

import {
  TARGET_NODE_KEY,
  BuiltInJSTypeName,
  PRESUMED_HELD_NODE_KEY
} from "../../source/utilities/constants.js";

import {
  ReferenceGraphImpl
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

import {
  addObjectToGraphs,
  addArrayIndexEdge,
  addPropertyNameEdge
} from "../support/fillReferenceGraph.js";

it("basic test for building a dagre graph from a ReferenceGraph", () => {
  const engineGraph = new ReferenceGraphImpl();

  engineGraph.foundTargetValue = true;
  engineGraph.succeeded = true;

  const GraphCodes = {
    nodes: {
      objectHoldingTarget: 3,
    },

    parentEdgeIds: {
      objectHoldingTarget: 1,
      targetToHoldingObject: 3,
    }
  }

  addObjectToGraphs(
    engineGraph,
    TARGET_NODE_KEY,
    BuiltInJSTypeName.Object,
    "Object"
  );
  addObjectToGraphs(
    engineGraph,
    PRESUMED_HELD_NODE_KEY,
    BuiltInJSTypeName.Array,
    "Array"
  );
  addObjectToGraphs(
    engineGraph,
    GraphCodes.nodes.objectHoldingTarget,
    BuiltInJSTypeName.Object,
    "Object"
  );

  addArrayIndexEdge(
    engineGraph,
    PRESUMED_HELD_NODE_KEY,
    1,
    GraphCodes.nodes.objectHoldingTarget,
    GraphCodes.parentEdgeIds.objectHoldingTarget,
  );

  addPropertyNameEdge(
    engineGraph,
    GraphCodes.nodes.objectHoldingTarget,
    "target",
    TARGET_NODE_KEY,
    GraphCodes.parentEdgeIds.targetToHoldingObject,
  );

  const dagreGraph = buildDagreGraph(engineGraph);
  expect(dagreGraph).toBeDefined();

  /*
  const output: object = {
    nodes: Object.fromEntries(dagreGraph.nodes().map(v => [v, reparse(dagreGraph.node(v))])),
    edges: Object.fromEntries(dagreGraph.edges().map(e => [e.v + " -> " + e.w, reparse(dagreGraph.edge(e))]))
  };
  */
});
