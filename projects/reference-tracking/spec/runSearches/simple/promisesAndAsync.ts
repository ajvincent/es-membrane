//#region preamble
/*
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
  addMapKeyAndValue,
  addPropertyNameEdge,
  addScopeValueEdge,
} from "../../support/fillExpectedGraph.js";
*/
import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches,", () => {
  describe("promises support", () => {
    it("resolved promises hold references to the target", async () => {
      // eslint-disable-next-line no-debugger
      debugger;
      const actual = await getActualGraph(
        "simple/promises.js", "promise after resolve", false
      );
      expect(actual).not.toBeNull();
    });

    xit("resolved promise chains hold references to the target", async () => {
      const actual = await getActualGraph(
        "simple/promises.js", "promise chain to target", false
      );
      expect(actual).not.toBeNull();
    });
  });

  xit("async functions support", () => {
    fail();
  });
});
