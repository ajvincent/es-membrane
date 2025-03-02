//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../../source/graph-analysis/ObjectGraphImpl.js";

import type {
  GraphObjectMetadata
} from "../../../source/types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../../source/types/GraphRelationshipMetadata.js";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addSetElementEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";

//#endregion preamble

describe("Simple graph searches:", () => {
  const target = { isTarget: true, }, heldValues = { isHeldValues: true };

  const mapOrSet = { name: "isMapOrSet" };//, key = { name: "key" }, value = { name: "value" };

  const targetMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Object,
    derivedClassName: BuiltInJSTypeName.Object,
  };

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array
  };

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  beforeEach(() => {
    ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );
  });

  function getExpectedGraph(strongReferencesOnly: boolean): object {
    if (strongReferencesOnly)
      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(strongReferencesOnly);

    return graphlib.json.write(ExpectedObjectGraph.cloneGraph());
  }

  xit("Map objects store keys and values", () => {
    fail();
  });

  xit("WeakMap objects store keys and values", () => {
    fail();
  });

  it("Set objects store values", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Set, BuiltInJSTypeName.Set);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, true);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph("simple/setHoldsTarget.js", "setHoldsTargetStrongly");
    expect(actual).toEqual(expected);
  });

  it("WeakSet objects do not store values strongly", async () => {
    const actual = await getActualGraph("simple/weakSetHoldsTarget.js", "weakSetHoldsTargetStrongly");
    expect(actual).toBeNull();
  });

  it("WeakSet objects stores values weakly", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakSet, BuiltInJSTypeName.WeakSet);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, false);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph("simple/weakSetHoldsTarget.js", "weakSetHoldsTargetWeakly");
    expect(actual).toEqual(expected);
  });
});
