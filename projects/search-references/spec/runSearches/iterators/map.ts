//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addInternalSlotEdge,
  addMapKeyAndValue,
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
  const enclosedMap = new Map<number, object>([
    [0, firstValue],
    [1, target,],
    [2, lastValue]
  ]);
  const hostCapturedValues = [enclosedMap]
  const iterator = enclosedMap.values();

  const [ ExpectedObjectGraph ] = createExpectedGraph(
    target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
    iterator, BuiltInJSTypeName.MapIterator, BuiltInJSTypeName.MapIterator
  );

  addObjectGraphNode(ExpectedObjectGraph, hostCapturedValues, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
  addInternalSlotEdge(ExpectedObjectGraph, iterator, "[[HostCapturedValues]]", hostCapturedValues, true);

  addObjectGraphNode(ExpectedObjectGraph, enclosedMap, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map);
  addArrayIndexEdge(ExpectedObjectGraph, hostCapturedValues, 0, enclosedMap, false);

  addObjectGraphNode(ExpectedObjectGraph, firstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addMapKeyAndValue(ExpectedObjectGraph, enclosedMap, 0, firstValue, true);

  addMapKeyAndValue(ExpectedObjectGraph, enclosedMap, 1, target, true);

  addObjectGraphNode(ExpectedObjectGraph, lastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
  addMapKeyAndValue(ExpectedObjectGraph, enclosedMap, 2, lastValue, true);

  ExpectedObjectGraph.markStrongReferencesFromHeldValues();
  ExpectedObjectGraph.summarizeGraphToTarget(true);
  const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

  describe("we hold references", () => {
    it("before visiting any values", async () => {
      const actual = await getActualGraph("iterators/map.js", "before visiting any values", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the first value", async () => {
      const actual = await getActualGraph("iterators/map.js", "after visiting the first value", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the target value", async () => {
      const actual = await getActualGraph("iterators/map.js", "after visiting the target value", false);
      expect(actual).toEqual(expected);
    });

    it("after visiting the last value", async () => {
      const actual = await getActualGraph("iterators/map.js", "after visiting the last value", false);
      expect(actual).toEqual(expected);
    });
  });

  it("we hold no references after completing the iterator", async () => {
    const actual = await getActualGraph("iterators/map.js", "after completing the iterator", false);
    expect(actual).toBeNull();
  });
});
