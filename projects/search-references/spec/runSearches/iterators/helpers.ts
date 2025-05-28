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
  addPropertyNameEdge,
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
  const nextValue = {};

  const [ ExpectedObjectGraph ] = createExpectedGraph(
    target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
    outerIterator, BuiltInJSTypeName.IteratorHelper, BuiltInJSTypeName.IteratorHelper
  );

  addObjectGraphNode(ExpectedObjectGraph, underlying, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addInternalSlotEdge(ExpectedObjectGraph, outerIterator, "[[UnderlyingIterator]]", underlying, true);

  addObjectGraphNode(ExpectedObjectGraph, iterator, BuiltInJSTypeName.ArrayIterator, BuiltInJSTypeName.ArrayIterator);
  addPropertyNameEdge(ExpectedObjectGraph, underlying, "Iterator", iterator, false);

  // this will not be serialized, so we don't care
  addObjectGraphNode(ExpectedObjectGraph, nextValue, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function);
  addPropertyNameEdge(ExpectedObjectGraph, underlying, "NextValue", nextValue, false);

  addObjectGraphNode(ExpectedObjectGraph, hostCapturedValues, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addInternalSlotEdge(ExpectedObjectGraph, iterator, "[[HostCapturedValues]]", hostCapturedValues, true);

  addObjectGraphNode(ExpectedObjectGraph, enclosedArray, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addArrayIndexEdge(ExpectedObjectGraph, hostCapturedValues, 0, enclosedArray, false);

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
