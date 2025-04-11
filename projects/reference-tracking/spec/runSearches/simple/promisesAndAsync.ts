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
  addInternalSlotEdge,
  createExpectedGraph,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches, promises support", () => {
  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  const target = { isTarget: true };
  it("resolved promises hold references to the target", async () => {
    const secondPromise = Promise.resolve(target);

    [ExpectedObjectGraph] = createExpectedGraph(
      target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      secondPromise, BuiltInJSTypeName.Promise, BuiltInJSTypeName.Promise
    );

    addInternalSlotEdge(ExpectedObjectGraph, secondPromise, `[[PromiseResult]]`, target, true);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "simple/promises.js", "promise after resolve", false
    );
    expect(actual).toEqual(expected);
  });

  xit("resolved promise chains hold references to the target", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise chain to target", false
    );
    expect(actual).not.toBeNull();
  });
});
