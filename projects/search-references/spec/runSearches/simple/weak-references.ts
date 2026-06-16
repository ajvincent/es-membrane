//#region preamble
import * as graphlib from "@dagrejs/graphlib";

import {
  HostObjectGraphImpl
} from "../../../source/graph-analysis/HostObjectGraphImpl.js";

import type {
  GraphWeakKeyMetadata
} from "../../../source/types/GraphWeakKeyMetadata.js";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addInternalSlotEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches: weak references to direct", () => {
  it("objects are not reachable in a strong-references-only search", async () => {
    const actual = await getActualGraph(
      "simple/weakRefToTarget.js",
      "WeakRef to target object does not hold strongly",
      true
    );
    expect(actual).toBeNull();
  });

  it("objects are reachable in a search including weak references", async () => {
    const target = { isTarget: true, }, heldValues = { isHeldValues: true };

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

    const ExpectedObjectGraph = new HostObjectGraphImpl;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );

    const weakRefObject = { "name": "weakRefObject" };
    addObjectGraphNode(ExpectedObjectGraph, weakRefObject, BuiltInJSTypeName.WeakRef, BuiltInJSTypeName.WeakRef);
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, weakRefObject, false);

    addInternalSlotEdge(ExpectedObjectGraph, weakRefObject, `[[WeakRefTarget]]`, target, false);

    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "simple/weakRefToTarget.js",
      "WeakRef to target object holds weakly",
      true
    );

    expect(actual).toEqual(expected);
  });

  it("symbols are not reachable in a strong-references-only search", async () => {
    const actual = await getActualGraph(
      "simple/weakRefToTarget.js",
      "WeakRef to target symbol does not hold strongly",
      true
    );
    expect(actual).toBeNull();
  });

  it("symbols are reachable in a search including weak references", async () => {
    const target = Symbol("target symbol"), heldValues = { isHeldValues: true };

    const targetMetadata: GraphWeakKeyMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Symbol,
      derivedClassName: BuiltInJSTypeName.Symbol,
      classSpecifier: null,
      classLineNumber: null,
      symbolDescription: target.description!,
    };

    const heldValuesMetadata: GraphWeakKeyMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Array,
      derivedClassName: BuiltInJSTypeName.Array,
      classSpecifier: null,
      classLineNumber: null,
      symbolDescription: null,
    };

    const ExpectedObjectGraph = new HostObjectGraphImpl;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );

    const weakRefObject = { "name": "weakRefObject" };
    addObjectGraphNode(ExpectedObjectGraph, weakRefObject, BuiltInJSTypeName.WeakRef, BuiltInJSTypeName.WeakRef);
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, weakRefObject, false);

    addInternalSlotEdge(ExpectedObjectGraph, weakRefObject, `[[WeakRefTarget]]`, target, false);

    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "simple/weakRefToTarget.js",
      "WeakRef to target symbol holds weakly",
      true
    );

    expect(actual).toEqual(expected);
  });
});
