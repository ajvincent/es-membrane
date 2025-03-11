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
  addInternalSlotEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches: weak references to direct values", () => {
  it("are not reachable in a strong-references-only search", async () => {
    const actual = await getActualGraph(
      "simple/weakRefToTarget.js",
      "WeakRef to target does not hold strongly"
    );
    expect(actual).toBeNull();
  });

  it("are reachable in a search including weak references", async () => {
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

    const weakRefObject = { "name": "weakRefObject" };
    addObjectGraphNode(ExpectedObjectGraph, weakRefObject, BuiltInJSTypeName.WeakRef, BuiltInJSTypeName.WeakRef);
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, weakRefObject, false);

    addInternalSlotEdge(ExpectedObjectGraph, weakRefObject, `[[WeakRefTarget]]`, target, false);

    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "simple/weakRefToTarget.js",
      "weakRef to target holds weakly"
    );

    expect(actual).toEqual(expected);
  });
});
