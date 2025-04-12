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
  addMapKeyAndValue,
  addPropertyNameEdge,
  addScopeValueEdge,
  createExpectedGraph,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph,
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches: function support,", () => {
  //#region common test fixtures
  class Person {
    readonly name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
  const Fred = new Person("Fred");

  class Vehicle {
    get owner(): string {
      throw new Error("not implemented");
    }
  }

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  //#endregion common test fixtures

  it("functions with no arguments and a single statement, a return, return a value", async () => {
    const target = { isTarget: true };
    function returnTarget() {
      return target;
    }

    [ExpectedObjectGraph] = createExpectedGraph(
      target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      returnTarget, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );

    // object:3
    addObjectGraphNode(
      ExpectedObjectGraph, returnTarget.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
    );
    addPropertyNameEdge(
      ExpectedObjectGraph, returnTarget, "prototype", returnTarget.prototype, false
    );

    addScopeValueEdge(ExpectedObjectGraph, returnTarget, "[[return value]]", target);

    addPropertyNameEdge(
      ExpectedObjectGraph, returnTarget.prototype, "constructor", returnTarget, false
    );

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "functions/returnValue.js", "return target", false
    );
    expect(actual).toEqual(expected);
  });

  it("arrow functions refer to this", async () => {
    function compare() {}
    const sorter = { isSorter: true };
    [ExpectedObjectGraph] = createExpectedGraph(sorter, BuiltInJSTypeName.Object, "PropertyKeySorter",
      compare, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );
    addScopeValueEdge(ExpectedObjectGraph, compare, "this", sorter);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "functions/arrow.js", "this as part of an arrow function", false
    );
    expect(actual).toEqual(expected);
  });

  it("arrow functions without arguemtns returning a value", async () => {
    const target = { isTarget: true };
    const returnTarget = () => target;

    [ExpectedObjectGraph] = createExpectedGraph(
      target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      returnTarget, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );
    addScopeValueEdge(ExpectedObjectGraph, returnTarget, "[[return value]]", target);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "functions/arrowReturnValue.js", "return target", false
    );
    expect(actual).toEqual(expected);
  });

  it("async arrow functions", async () => {
    function compare() {}
    const sorter = { isSorter: true };
    [ExpectedObjectGraph] = createExpectedGraph(sorter, BuiltInJSTypeName.Object, "PropertyKeySorter",
      compare, BuiltInJSTypeName.AsyncFunction, BuiltInJSTypeName.AsyncFunction
    );
    addScopeValueEdge(ExpectedObjectGraph, compare, "this", sorter);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "functions/asyncArrow.js", "this as part of an arrow function", false
    );
    expect(actual).toEqual(expected);
  });

  it("bound functions can refer jointly to a target", async () => {
    function boundGetOwner() {
      // empty on purpose
    }
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      boundGetOwner, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );
    function getOwner() {
      // empty on purpose
    }

    addObjectGraphNode(ExpectedObjectGraph, getOwner, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addInternalSlotEdge(ExpectedObjectGraph, boundGetOwner, `[[BoundTargetFunction]]`, getOwner, true);

    const vehicleToOwnerMap = {};
    addObjectGraphNode(ExpectedObjectGraph, vehicleToOwnerMap, BuiltInJSTypeName.WeakMap, BuiltInJSTypeName.WeakMap); // object:4
    addInternalSlotEdge(ExpectedObjectGraph, boundGetOwner, `[[BoundThis]]`, vehicleToOwnerMap, true);

    const boundArguments: unknown[] = [];
    addObjectGraphNode(ExpectedObjectGraph, boundArguments, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:5
    addInternalSlotEdge(ExpectedObjectGraph, boundGetOwner, "[[BoundArguments]]", boundArguments, true);

    addObjectGraphNode(ExpectedObjectGraph, getOwner.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:6
    addPropertyNameEdge(ExpectedObjectGraph, getOwner, "prototype", getOwner.prototype, false);

    const hisBike = new Vehicle;
    addObjectGraphNode(ExpectedObjectGraph, hisBike, BuiltInJSTypeName.Object, "Vehicle"); // object:7
    addMapKeyAndValue(ExpectedObjectGraph, vehicleToOwnerMap, hisBike, Fred, false);

    boundArguments.push(hisBike);
    addArrayIndexEdge(ExpectedObjectGraph, boundArguments, 0, hisBike, false);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "functions/bound.js", "bound function to target", true
    );
    expect(actual).toEqual(expected);
  });

  describe("closures", () => {
    const target = { isTarget: true };
    const miscellaneous = { isSomeOtherObject: true };

    function enclosure() {
    }

    it("one level deep", async () => {
      [ExpectedObjectGraph] = createExpectedGraph(
        target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
        enclosure, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
      );
      addObjectGraphNode(
        ExpectedObjectGraph, enclosure.prototype,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:3
      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure, "prototype",
        enclosure.prototype, false
      );

      addObjectGraphNode(
        ExpectedObjectGraph, miscellaneous,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:4

      addScopeValueEdge(ExpectedObjectGraph, enclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "secondValue", target);

      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure.prototype, "constructor",
        enclosure, false
      );

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/closures.js", "targetNotDirectlyHeld", false
      );
      expect(actual).toEqual(expected);
    });

    it("two levels deep, from the outer enclosure", async () => {
      [ExpectedObjectGraph] = createExpectedGraph(
        target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
        enclosure, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
      );
      addObjectGraphNode(
        ExpectedObjectGraph, enclosure.prototype,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:3
      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure, "prototype",
        enclosure.prototype, false
      );

      addObjectGraphNode(
        ExpectedObjectGraph, miscellaneous,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:4

      addScopeValueEdge(ExpectedObjectGraph, enclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "secondValue", target);

      function innerEnclosure() {
      }
      addObjectGraphNode(
        ExpectedObjectGraph, innerEnclosure,
        BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
      ); // object:5
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "[[return value]]", innerEnclosure);

      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure.prototype, "constructor",
        enclosure, false
      );

      addObjectGraphNode(
        ExpectedObjectGraph, innerEnclosure.prototype,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:6
      addPropertyNameEdge(
        ExpectedObjectGraph, innerEnclosure, "prototype", innerEnclosure.prototype, false
      );
      addScopeValueEdge(ExpectedObjectGraph, innerEnclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, innerEnclosure, "secondValue", target);

      addPropertyNameEdge(ExpectedObjectGraph, innerEnclosure.prototype, "constructor", innerEnclosure, false);

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/closures.js", "outerEnclosure", false
      );
      expect(actual).toEqual(expected);
    });

    it("two levels deep, from the inner enclosure", async () => {
      [ExpectedObjectGraph] = createExpectedGraph(
        target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
        enclosure, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
      ); // target:0, heldValues:1, object:2
      addObjectGraphNode(
        ExpectedObjectGraph, enclosure.prototype,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:3
      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure, "prototype",
        enclosure.prototype, false
      );

      addObjectGraphNode(
        ExpectedObjectGraph, miscellaneous,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:5

      addScopeValueEdge(ExpectedObjectGraph, enclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "secondValue", target);

      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure.prototype, "constructor",
        enclosure, false
      );

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/closures.js", "innerEnclosure", false
      );
      expect(actual).toEqual(expected);
    });
  });

  xdescribe("async closures", () => {
    const target = { isTarget: true };
    const miscellaneous = { isSomeOtherObject: true };

    function enclosure() {
    }

    it("one level deep", async () => {
      [ExpectedObjectGraph] = createExpectedGraph(
        target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
        enclosure, BuiltInJSTypeName.AsyncFunction, BuiltInJSTypeName.AsyncFunction
      );

      addObjectGraphNode(
        ExpectedObjectGraph, miscellaneous,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:3

      addScopeValueEdge(ExpectedObjectGraph, enclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "secondValue", target);

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/asyncClosures.js", "targetNotDirectlyHeld", false
      );
      expect(actual).toEqual(expected);
    });

    it("two levels deep, from the outer enclosure", async () => {
      [ExpectedObjectGraph] = createExpectedGraph(
        target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
        enclosure, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
      );
      addObjectGraphNode(
        ExpectedObjectGraph, enclosure.prototype,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:3
      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure, "prototype",
        enclosure.prototype, false
      );

      addObjectGraphNode(
        ExpectedObjectGraph, miscellaneous,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:4

      addScopeValueEdge(ExpectedObjectGraph, enclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "secondValue", target);

      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure.prototype, "constructor",
        enclosure, false
      );

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/asyncClosures.js", "outerEnclosure", false
      );
      expect(actual).toEqual(expected);
    });

    it("two levels deep, from the inner enclosure", async () => {
      [ExpectedObjectGraph] = createExpectedGraph(
        target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
        enclosure, BuiltInJSTypeName.AsyncFunction, BuiltInJSTypeName.AsyncFunction
      ); // target:0, heldValues:1, object:2

      addObjectGraphNode(
        ExpectedObjectGraph, miscellaneous,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:3

      addScopeValueEdge(ExpectedObjectGraph, enclosure, "firstValue", miscellaneous);
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "secondValue", target);

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/asyncClosures.js", "innerEnclosure", false
      );
      expect(actual).toEqual(expected);
    });
  });
});
