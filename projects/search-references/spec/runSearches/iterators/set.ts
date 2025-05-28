//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addInternalSlotEdge,
  addSetElementEdge,
  createExpectedGraph,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph,
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Iterator searches, Array:", () => {
  const target = { isTarget: true };
  const firstValue = { isFirstValue: true };
  const lastValue = { isLastValue: true };
  const enclosedSet = new Set([firstValue, target, lastValue]);
  const hostCapturedValues = [enclosedSet]
  const iterator = enclosedSet.values();

  const [ ExpectedObjectGraph ] = createExpectedGraph(
    target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
    iterator, BuiltInJSTypeName.SetIterator, BuiltInJSTypeName.SetIterator
  );

  addObjectGraphNode(ExpectedObjectGraph, hostCapturedValues, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addInternalSlotEdge(ExpectedObjectGraph, iterator, "[[HostCapturedValues]]", hostCapturedValues, true);

  addObjectGraphNode(ExpectedObjectGraph, enclosedSet, BuiltInJSTypeName.Set, BuiltInJSTypeName.Set);
  addArrayIndexEdge(ExpectedObjectGraph, hostCapturedValues, 0, enclosedSet, false);

  addObjectGraphNode(ExpectedObjectGraph, firstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addSetElementEdge(ExpectedObjectGraph, enclosedSet, firstValue, true);

  addSetElementEdge(ExpectedObjectGraph, enclosedSet, target, true);

  addObjectGraphNode(ExpectedObjectGraph, lastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addSetElementEdge(ExpectedObjectGraph, enclosedSet, lastValue, true);

  ExpectedObjectGraph.markStrongReferencesFromHeldValues();
  ExpectedObjectGraph.summarizeGraphToTarget(true);
  const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

  describe("we hold references", () => {
    it("before visiting any values", async () => {
      const actual = await getActualGraph("iterators/set.js", "before visiting any values", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the first value", async () => {
      const actual = await getActualGraph("iterators/set.js", "after visiting the first value", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the target value", async () => {
      const actual = await getActualGraph("iterators/set.js", "after visiting the target value", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the last value", async () => {
      const actual = await getActualGraph("iterators/set.js", "after visiting the last value", false);
      expect(actual).toEqual(expected);
    });
  });

  it("we hold no references after completing the iterator", async () => {
    const actual = await getActualGraph("iterators/set.js", "after completing the iterator", false);
    expect(actual).toBeNull();
  });
});
