//#region preamble
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
  type PathsArray,
  pathsToTarget,
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
//#endregion preamble

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

it("pathsToTarget treats null as no paths", () => {
  expect(pathsToTarget(null)).toEqual([]);
});

it("pathsToTarget responds with all paths to a target", () => {
  const graph: SearchGraph = new Graph({ multigraph: true, directed: true });

  graph.setNode("target:0", { metadata: null });
  graph.setNode("heldValues:1", { metadata: null });
  graph.setNode("object:2", { metadata: null });
  graph.setNode("object:3", { metadata: null });
  graph.setNode("object:4", { metadata: null });
  graph.setNode("object:5", { metadata: null });

  graph.setEdge("heldValues:1", "object:2", new GraphEdge("label 1:2"), "1:2");
  graph.setEdge("object:2", "object:3", new GraphEdge("label 2:3"), "2:3");
  graph.setEdge("object:3", "target:0", new GraphEdge("label 3:0"), "3:0");
  graph.setEdge("object:2", "target:0", new GraphEdge("label 2:0"), "2:0");
  graph.setEdge("heldValues:1", "object:4", new GraphEdge("label 1:4"), "1:4");
  graph.setEdge("object:4", "object:5", new GraphEdge("label 4:5"), "4:5");
  graph.setEdge("object:5", "target:0", new GraphEdge("label 5:0"), "5:0");
  graph.setEdge("object:2", "object:5", new GraphEdge("label 2:5"), "2:5");

  const actual: PathsArray = pathsToTarget(graph);
  expect(actual).withContext(JSON.stringify(actual, null, 2)).toEqual([
    [
      { v: "heldValues:1", w: "object:2", name: "1:2" },
      { v: "object:2", w: "target:0", name: "2:0" },
    ],
    [
      { v: "heldValues:1", w: "object:2", name: "1:2" },
      { v: "object:2", w: "object:3", name: "2:3" },
      { v: "object:3", w: "target:0", name: "3:0" },
    ],
    [
      { v: "heldValues:1", w: "object:2", name: "1:2" },
      { v: "object:2", w: "object:5", name: "2:5" },
      { v: "object:5", w: "target:0", name: "5:0" },
    ],
    [
      { v: "heldValues:1", w: "object:4", name: "1:4" },
      { v: "object:4", w: "object:5", name: "4:5" },
      { v: "object:5", w: "target:0", name: "5:0" },
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
    const allPaths: PathsArray = pathsToTarget(ExpectedObjectGraph.cloneGraph());
    expect(allPaths).withContext(JSON.stringify(allPaths, null, 2)).toEqual([
      [
        { v: "heldValues:1", w: "object:2", name: "propertyKey:0" },
        { v: "object:2", w: "keyValueTuple:4", name: "mapToTuple:2" },
        { v: "keyValueTuple:4", w: "target:0", name: "mapValue:4" },
      ],
      [
        { v: "heldValues:1", w: "object:2", name: "propertyKey:0" },
        { v: "object:2", w: "object:3", name: "mapKey:1" },
        { v: "object:3", w: "keyValueTuple:4", name: "mapKeyToTuple:3" },
        { v: "keyValueTuple:4", w: "target:0", name: "mapValue:4" },
      ]
    ]);
  });

  it("with weak reference summaries", () => {
    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const allPaths: PathsArray = pathsToTarget(ExpectedObjectGraph.cloneGraph());
    expect(allPaths).withContext(JSON.stringify(allPaths, null, 2)).toEqual([
      [
        { v: "heldValues:1", w: "object:2", name: "propertyKey:0" },
        { v: "object:2", w: "keyValueTuple:4", name: "mapToTuple:2" },
        { v: "keyValueTuple:4", w: "target:0", name: "mapValue:4" },
      ],
      [
        { v: "heldValues:1", w: "object:2", name: "propertyKey:0" },
        { v: "object:2", w: "object:3", name: "mapKey:1" },
        { v: "object:3", w: "keyValueTuple:4", name: "mapKeyToTuple:3" },
        { v: "keyValueTuple:4", w: "target:0", name: "mapValue:4" },
      ]
    ]);
  });

  it("with strong reference summaries", () => {
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const allPaths = pathsToTarget(ExpectedObjectGraph.cloneGraph());
    expect(allPaths).toEqual([]);
  });
});

it("pathsToTarget excludes cycles", () => {
  const graph: SearchGraph = new Graph({ multigraph: true, directed: true });

  graph.setNode("target:0", { metadata: null });
  graph.setNode("heldValues:1", { metadata: null });
  graph.setNode("object:2", { metadata: null });
  graph.setNode("object:3", { metadata: null });
  graph.setNode("object:4", { metadata: null });
  graph.setNode("object:5", { metadata: null });
  graph.setNode("object:6", { metadata: null });

  graph.setEdge("heldValues:1", "object:2", new GraphEdge("label 1:2"), "1:2");
  graph.setEdge("object:2", "object:3", new GraphEdge("label 2:3"), "2:3");
  graph.setEdge("object:2", "object:4", new GraphEdge("label 2:4"), "2:4");
  graph.setEdge("object:3", "object:5", new GraphEdge("label 3:5"), "3:5");
  graph.setEdge("object:4", "target:0", new GraphEdge("label 4:0"), "4:0");
  graph.setEdge("object:5", "object:6", new GraphEdge("label 5:6"), "5:6");
  graph.setEdge("object:6", "object:2", new GraphEdge("label 6:2"), "6:2");

  const actual: PathsArray = pathsToTarget(graph);
  expect(actual).withContext(JSON.stringify(actual, null, 2)).toEqual([
    [
      { v: "heldValues:1", w: "object:2", name: "1:2" },
      { v: "object:2", w: "object:4", name: "2:4" },
      { v: "object:4", w: "target:0", name: "4:0" },
    ],
  ]);
});
