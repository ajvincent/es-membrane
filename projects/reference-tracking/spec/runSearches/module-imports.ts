//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../source/graph-analysis/ObjectGraphImpl.js";

import type {
  GraphObjectMetadata
} from "../../source/types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../source/types/GraphRelationshipMetadata.js";

import {
  BuiltInJSTypeName
} from "../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addPropertyNameEdge,
} from "../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../support/getActualGraph.js";
//#endregion preamble

it("Simple graph searches: when there is an import involved (modules importing other modules), we can load them.", async () => {
  const target = { isTarget: true, }, heldValues = { isHeldValues: true };

  const targetMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Object,
    derivedClassName: BuiltInJSTypeName.Object,
  };

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array
  };

  const ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

  ExpectedObjectGraph.defineTargetAndHeldValues(
    target, targetMetadata, heldValues, heldValuesMetadata
  );

  const objectHoldingTarget = { "name": "objectHoldingTarget" };
  addObjectGraphNode(ExpectedObjectGraph, objectHoldingTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, objectHoldingTarget);

  addPropertyNameEdge(ExpectedObjectGraph, objectHoldingTarget, "value", target);

  // this object will be dropped from the graph, but I include it for completeness.
  const addedProperty = { "isAddedProperty": true };
  addObjectGraphNode(ExpectedObjectGraph, addedProperty, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addPropertyNameEdge(ExpectedObjectGraph, objectHoldingTarget, "addedProperty", addedProperty);

  function getExpectedGraph(): object {
    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);

    return graphlib.json.write(ExpectedObjectGraph.cloneGraph());
  }

  const expected: object = getExpectedGraph();
  const actual = await getActualGraph("module-imports/importWrapObject.js", "importWrapObject");
  expect(actual).toEqual(expected);
});
