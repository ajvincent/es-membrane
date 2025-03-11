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
  addMapKeyAndValue,
  addSetElementEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";

//#endregion preamble

describe("Simple graph searches:", () => {
  const target = { isTarget: true, }, heldValues = { isHeldValues: true };

  const mapOrSet = { name: "isMapOrSet" }, key = { name: "key" }, value = { name: "value" };

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

  it("Map objects store object keys with strong references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addObjectGraphNode(ExpectedObjectGraph, value, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, target, value, true);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph("collections/mapKeyIsTarget.js", "strongMapHoldsKeyStrongly");
    expect(actual).toEqual(expected);
  });

  it("Map objects store object values with strong references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addObjectGraphNode(ExpectedObjectGraph, key, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, true);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph("collections/mapValueIsTarget.js", "strongMapHoldsValueStrongly");
    expect(actual).toEqual(expected);
  });

  it("Set objects store values", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Set, BuiltInJSTypeName.Set);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, true);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph("collections/setHoldsTarget.js", "setHoldsTargetStrongly");
    expect(actual).toEqual(expected);
  });

  it("WeakMap objects never store keys strongly", async () => {
    const actual = await getActualGraph("collections/weakMapKeyIsTarget.js", "weakMapHoldsKeyStrongly");
    expect(actual).toBeNull();
  });

  it("WeakMap objects store object keys with weak references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, target, "value", false);
    }

    const expected = getExpectedGraph(false);

    const actual = await getActualGraph("collections/weakMapKeyIsTarget.js", "weakMapHoldsKeyWeakly");
    expect(actual).toEqual(expected);
  });

  it("WeakMap objects never store values strongly", async () => {
    const actual = await getActualGraph("collections/weakMapValueIsTarget.js", "weakMapHoldsValueStrongly");
    expect(actual).toBeNull();
  });

  it("WeakMap objects store object values weakly", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addObjectGraphNode(ExpectedObjectGraph, key, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, false);
    }

    const expected = getExpectedGraph(false);

    const actual = await getActualGraph("collections/weakMapValueIsTarget.js", "weakMapHoldsValueWeakly");
    expect(actual).toEqual(expected);
  });

  it("WeakMap objects store object values jointly with their map key", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addObjectGraphNode(ExpectedObjectGraph, key, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, key, false);

      // Order of operations really matters here.  Remember this is a breadth-first search, starting from heldValues.
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, false);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph("collections/weakMapValueIsTarget.js", "weakMapAndKeyJointlyHoldValue");
    expect(actual).toEqual(expected);
  });

  it("WeakSet objects do not store values strongly", async () => {
    const actual = await getActualGraph("collections/weakSetHoldsTarget.js", "weakSetHoldsTargetStrongly");
    expect(actual).toBeNull();
  });

  it("WeakSet objects stores values weakly", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakSet, BuiltInJSTypeName.WeakSet);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, false);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph("collections/weakSetHoldsTarget.js", "weakSetHoldsTargetWeakly");
    expect(actual).toEqual(expected);
  });
});
