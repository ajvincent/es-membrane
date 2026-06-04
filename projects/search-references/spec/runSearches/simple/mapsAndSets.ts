//#region preamble
import * as graphlib from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../../source/graph-analysis/ObjectGraphImpl.js";

import type {
  GraphObjectMetadata
} from "../../../source/types/GraphObjectMetadata.js";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addMapKeyAndValue,
  addSetElementEdge,
  addSymbolGraphNode,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";

//#endregion preamble

describe("Simple graph searches: Collections (object tests):", () => {
  const target = { isTarget: true, }, heldValues = { isHeldValues: true };

  const mapOrSet = { name: "isMapOrSet" }, key = { name: "key" }, value = { name: "value" };

  const targetMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Object,
    derivedClassName: BuiltInJSTypeName.Object,
    classSpecifier: null,
    classLineNumber: null,
  };

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array,
    classSpecifier: null,
    classLineNumber: null,
  };

  let ExpectedObjectGraph: ObjectGraphImpl;
  beforeEach(() => {
    ExpectedObjectGraph = new ObjectGraphImpl;

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

    const actual = await getActualGraph(
      "collections/mapKeyIsTarget.js", "strongMapHoldsObjectKeyStrongly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/mapKeyIsTarget.js", "after deleting object key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("Map objects store object values with strong references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addObjectGraphNode(ExpectedObjectGraph, key, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, true);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph(
      "collections/mapValueIsTarget.js", "strongMapHoldsObjectValueStrongly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/mapValueIsTarget.js", "after deleting object key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("Set objects store object values", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Set, BuiltInJSTypeName.Set);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, true);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/setHoldsTarget.js", "setHoldsObjectTargetStrongly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/setHoldsTarget.js", "after deleting object key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("WeakMap objects never store object keys strongly", async () => {
    const actual = await getActualGraph(
      "collections/weakMapKeyIsTarget.js", "weakMapHoldsObjectKeyStrongly", true
    );
    expect(actual).toBeNull();
  });

  it("WeakMap objects store object keys with weak references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, target, "value", false);
    }

    const expected = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/weakMapKeyIsTarget.js", "weakMapHoldsObjectKeyWeakly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/weakMapKeyIsTarget.js", "after deleting object key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("WeakMap objects never store object values strongly", async () => {
    const actual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "WeakMap with object key holds value strongly", true
    );
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

    const actual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "WeakMap with object key holds value weakly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "after deleting object key", false
    );
    expect(deletedActual).toBeNull();
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

    const actual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "WeakMap and object key jointly hold value", true
    );
    expect(actual).toEqual(expected);
  });

  it("WeakSet objects do not store object values strongly", async () => {
    const actual = await getActualGraph(
      "collections/weakSetHoldsTarget.js", "weakSetHoldsTargetObjectStrongly", true
    );
    expect(actual).toBeNull();
  });

  it("WeakSet objects stores object values weakly", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakSet, BuiltInJSTypeName.WeakSet);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, false);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/weakSetHoldsTarget.js", "weakSetHoldsTargetObjectWeakly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/weakSetHoldsTarget.js", "after deleting object key", false
    );
    expect(deletedActual).toBeNull();
  });
});

describe("Simple graph searches: Collections (symbol tests):", () => {
  const target = Symbol("is target"), heldValues = { isHeldValues: true };

  const mapOrSet = { name: "isMapOrSet" }, key = Symbol("key"), value = Symbol("value");

  const targetMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Symbol,
    derivedClassName: BuiltInJSTypeName.Symbol,
    classSpecifier: null,
    classLineNumber: null,
  };

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array,
    classSpecifier: null,
    classLineNumber: null,
  };

  let ExpectedObjectGraph: ObjectGraphImpl;
  beforeEach(() => {
    ExpectedObjectGraph = new ObjectGraphImpl;

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

  it("Map objects store symbol keys with strong references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSymbolGraphNode(ExpectedObjectGraph, value);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, target, value, true);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph(
      "collections/mapKeyIsTarget.js", "strongMapHoldsSymbolKeyStrongly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/mapKeyIsTarget.js", "after deleting symbol key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("Map objects store symbol values with strong references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSymbolGraphNode(ExpectedObjectGraph, key);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, true);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph(
      "collections/mapValueIsTarget.js", "strongMapHoldsSymbolValueStrongly", true
    );
    expect(actual).withContext("strongMapHoldsSymbolValueStrongly").toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/mapValueIsTarget.js", "after deleting symbol key", false
    );
    expect(deletedActual).withContext("after deleting symbol key").toBeNull();
  });

  it("Set objects store symbol values", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.Set, BuiltInJSTypeName.Set);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, true);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/setHoldsTarget.js", "setHoldsSymbolTargetStrongly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/setHoldsTarget.js", "after deleting symbol key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("WeakMap objects never store symbol keys strongly", async () => {
    const actual = await getActualGraph(
      "collections/weakMapKeyIsTarget.js", "weakMapHoldsSymbolKeyStrongly", true
    );
    expect(actual).toBeNull();
  });

  it("WeakMap objects store symbol keys with weak references", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, target, "value", false);
    }

    const expected = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/weakMapKeyIsTarget.js", "weakMapHoldsSymbolKeyWeakly", true
    );
    expect(actual).withContext("weakMapHoldsSymbolKeyWeakly").toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/weakMapKeyIsTarget.js", "after deleting symbol key", false
    );
    expect(deletedActual).withContext("after deleting symbol key").toBeNull();
  });

  it("WeakMap objects never store symbol values strongly", async () => {
    const actual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "WeakMap with symbol key holds value strongly", true
    );
    expect(actual).toBeNull();
  });

  it("WeakMap objects store symbol values weakly", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSymbolGraphNode(ExpectedObjectGraph, key);
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, false);
    }

    const expected = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "WeakMap with symbol key holds value weakly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "after deleting symbol key", false
    );
    expect(deletedActual).toBeNull();
  });

  it("WeakMap objects store symbol values jointly with their map key", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSymbolGraphNode(ExpectedObjectGraph, key);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, key, false);

      // Order of operations really matters here.  Remember this is a breadth-first search, starting from heldValues.
      addMapKeyAndValue(ExpectedObjectGraph, mapOrSet, key, target, false);
    }

    const expected = getExpectedGraph(true);

    const actual = await getActualGraph(
      "collections/weakMapValueIsTarget.js", "WeakMap and symbol key jointly hold value", true
    );
    expect(actual).toEqual(expected);
  });

  it("WeakSet objects do not store symbol values strongly", async () => {
    const actual = await getActualGraph(
      "collections/weakSetHoldsTarget.js", "weakSetHoldsTargetSymbolStrongly", true
    );
    expect(actual).toBeNull();
  });

  it("WeakSet objects stores symbol values weakly", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, mapOrSet, BuiltInJSTypeName.WeakSet, BuiltInJSTypeName.WeakSet);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, mapOrSet, false);

      addSetElementEdge(ExpectedObjectGraph, mapOrSet, target, false);
    }
    const expected: object = getExpectedGraph(false);

    const actual = await getActualGraph(
      "collections/weakSetHoldsTarget.js", "weakSetHoldsTargetSymbolWeakly", true
    );
    expect(actual).toEqual(expected);

    const deletedActual = await getActualGraph(
      "collections/weakSetHoldsTarget.js", "after deleting symbol key", false
    );
    expect(deletedActual).toBeNull();
  });
});
