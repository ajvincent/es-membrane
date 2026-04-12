//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addInternalSlotEdge,
  createExpectedGraph,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph,
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Iterator searches, with helpers:", () => {
  const target = { isTarget: true };
  const firstValue = { isFirstValue: true };
  const lastValue = { isLastValue: true };
  const enclosedArray = [firstValue, target, lastValue];
  const hostCapturedValues = [enclosedArray]
  const iterator = enclosedArray.values();
  const outerIterator = {};
  const underlying = {};

  const [ ExpectedObjectGraph ] = createExpectedGraph(
    target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
    outerIterator, BuiltInJSTypeName.IteratorHelper, BuiltInJSTypeName.IteratorHelper
  );

  // object:3
  addObjectGraphNode(ExpectedObjectGraph, underlying, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addInternalSlotEdge(ExpectedObjectGraph, outerIterator, "[[UnderlyingIterators]]", underlying, true);

  // object:4
  addObjectGraphNode(ExpectedObjectGraph, iterator, BuiltInJSTypeName.ArrayIterator, BuiltInJSTypeName.ArrayIterator);
  addArrayIndexEdge(ExpectedObjectGraph, underlying, 0, iterator, false);

  // object:5
  addObjectGraphNode(ExpectedObjectGraph, hostCapturedValues, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addInternalSlotEdge(ExpectedObjectGraph, iterator, "[[HostCapturedValues]]", hostCapturedValues, true);

  // object:6
  addObjectGraphNode(ExpectedObjectGraph, enclosedArray, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addArrayIndexEdge(ExpectedObjectGraph, hostCapturedValues, 0, enclosedArray, false);

  // object:7
  addObjectGraphNode(ExpectedObjectGraph, firstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addArrayIndexEdge(ExpectedObjectGraph, enclosedArray, 0, firstValue, false);

  addArrayIndexEdge(ExpectedObjectGraph, enclosedArray, 1, target, false);

  addObjectGraphNode(ExpectedObjectGraph, lastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addArrayIndexEdge(ExpectedObjectGraph, enclosedArray, 2, lastValue, false);

  ExpectedObjectGraph.markStrongReferencesFromHeldValues();
  ExpectedObjectGraph.summarizeGraphToTarget(true);
  const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

  describe("we hold references", () => {
    it("before visiting any values", async () => {
      const actual = await getActualGraph("iterators/helpers.js", "before visiting any values", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the first value", async () => {
      const actual = await getActualGraph("iterators/helpers.js", "after visiting the first value", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the target value", async () => {
      const actual = await getActualGraph("iterators/helpers.js", "after visiting the target value", false);
      expect(actual).toEqual(expected);
    });
  });

  it("we hold no references after completing the iterator", async () => {
    const actual = await getActualGraph("iterators/helpers.js", "after completing the iterator", false);
    expect(actual).toBeNull();
  });
});
