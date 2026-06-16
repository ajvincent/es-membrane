import {
  Graph,
} from "@dagrejs/graphlib";

import type {
  ReadonlyDeep
} from "type-fest";

import type {
  GraphEdgeWithMetadata
} from "../source/graph-analysis/types/ObjectGraphIfc.js";

import type {
  ValueDescription
} from "../source/types/ValueDescription.js";

import {
  BuiltInJSTypeName,
  EdgePrefix,
  ValueDiscrimant
} from "../source/utilities/constants.js";

import type {
  SearchGraph
} from "../source/graph-analysis/types/SearchGraph.js";

import {
  type NodeAndEdgeLabels,
  pathsToTarget
} from "../source/public/core-host/pathsToTarget.js";

import {
  HostObjectGraphImpl
} from "../source/graph-analysis/HostObjectGraphImpl.js";

import type {
  GraphWeakKeyMetadata
} from "../source/types/GraphWeakKeyMetadata.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addMapKeyAndValue
} from "./support/fillExpectedGraph.js";

it("pathsToTarget responds with all paths to a target", () => {
  expect(pathsToTarget(null)).toEqual([]);

  const graph: SearchGraph = new Graph;

  class GraphEdge implements GraphEdgeWithMetadata<null> {
    label: string;
    edgeType: EdgePrefix = EdgePrefix.PropertyKey;
    description: ReadonlyDeep<ValueDescription> = {
      valueType: ValueDiscrimant.NotApplicable
    };
    metadata: null = null;
    isStrongReference: boolean = true;

    constructor(label: string) {
      this.label = label;
    }
  }

  graph.setNode("target:0", { metadata: null });
  graph.setNode("heldValues:1", { metadata: null });
  graph.setNode("object:2", { metadata: null });
  graph.setNode("object:3", { metadata: null });
  graph.setNode("object:4", { metadata: null });
  graph.setNode("object:5", { metadata: null });

  graph.setEdge("heldValues:1", "object:2", new GraphEdge("1:2"));
  graph.setEdge("object:2", "object:3", new GraphEdge("2:3"));
  graph.setEdge("object:3", "target:0", new GraphEdge("3:0"));
  graph.setEdge("object:2", "target:0", new GraphEdge("2:0"));
  graph.setEdge("heldValues:1", "object:4", new GraphEdge("1:4"));
  graph.setEdge("object:4", "object:5", new GraphEdge("4:5"));
  graph.setEdge("object:5", "target:0", new GraphEdge("5:0"));
  graph.setEdge("object:2", "object:5", new GraphEdge("2:5"));

  const actual: readonly (readonly NodeAndEdgeLabels[])[] = pathsToTarget(graph);
  expect(actual).withContext(JSON.stringify(actual, null, 2)).toEqual([
    [
      { nodeIndex: 2, nextEdgeLabel: "2:0" },
      { nodeIndex: 0 }
    ],
    [
      { nodeIndex: 2, nextEdgeLabel: "2:3" },
      { nodeIndex: 3, nextEdgeLabel: "3:0" },
      { nodeIndex: 0 }
    ],
    [
      { nodeIndex: 2, nextEdgeLabel: "2:5" },
      { nodeIndex: 5, nextEdgeLabel: "5:0" },
      { nodeIndex: 0, }
    ],
    [
      { nodeIndex: 4, nextEdgeLabel: "4:5" },
      { nodeIndex: 5, nextEdgeLabel: "5:0" },
      { nodeIndex: 0 }
    ],
  ]);
});

describe("pathsToTarget works well with ObjectGraphImpl (weak map simulation)", () => {
  let ExpectedObjectGraph: HostObjectGraphImpl;
  beforeEach(() => {
    const target = { isTarget: true };
    const heldValues: object[] = [];

    const mapOrSet = { name: "isMapOrSet" }, key = { name: "key" };

    const targetMetadata: GraphWeakKeyMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Object,
      derivedClassName: BuiltInJSTypeName.Object,
      classSpecifier: null,
      classLineNumber: null,
      symbolDescription: null,
    };

    const heldValuesMetadata: GraphWeakKeyMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Array,
      derivedClassName: BuiltInJSTypeName.Array,
      classSpecifier: null,
      classLineNumber: null,
      symbolDescription: null,
    };

    ExpectedObjectGraph = new HostObjectGraphImpl;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );

    addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

    addObjectGraphNode(ExpectedObjectGraph, key, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
    addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, false);
  });

  it("directly", () => {
    const allPaths: readonly (readonly NodeAndEdgeLabels[])[] = pathsToTarget(ExpectedObjectGraph.cloneGraph());
    expect(allPaths).withContext(JSON.stringify(allPaths, null, 2)).toEqual([
      [
        { nodeIndex: 2, nextEdgeLabel: "(map tuple)" },
        { nodeIndex: 4, nextEdgeLabel: "(map value)" },
        { nodeIndex: 0 }
      ],
      [
        { nodeIndex: 2, nextEdgeLabel: "(map key)" },
        { nodeIndex: 3, nextEdgeLabel: "(map key to tuple)" },
        { nodeIndex: 4, nextEdgeLabel: "(map value)" },
        { nodeIndex: 0 }
      ]
    ]);
  });

  it("with weak reference summaries", () => {
    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const allPaths = pathsToTarget(ExpectedObjectGraph.cloneGraph());
    expect(allPaths).withContext(JSON.stringify(allPaths, null, 2)).toEqual([
      [
        { nodeIndex: 2, nextEdgeLabel: "(map tuple)" },
        { nodeIndex: 4, nextEdgeLabel: "(map value)" },
        { nodeIndex: 0 }
      ],
      [
        { nodeIndex: 2, nextEdgeLabel: "(map key)" },
        { nodeIndex: 3, nextEdgeLabel: "(map key to tuple)" },
        { nodeIndex: 4, nextEdgeLabel: "(map value)" },
        { nodeIndex: 0 }
      ]
    ]);
  });

  it("with strong reference summaries", () => {
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const allPaths = pathsToTarget(ExpectedObjectGraph.cloneGraph());
    expect(allPaths).toEqual([]);
  });
});
