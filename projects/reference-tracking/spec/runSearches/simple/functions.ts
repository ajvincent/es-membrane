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
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
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

  let heldValues: object[];
  beforeEach(() => {
    heldValues = [];
  });

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array
  };

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  function setExpectedGraph(
    target: object,
    targetJSTypeName: BuiltInJSTypeName,
    targetClassName: string,
    startingObject: object,
    startingJSTypeName: BuiltInJSTypeName,
    startingClassName: string
  ): void
  {
    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: targetJSTypeName,
      derivedClassName: targetClassName,
    };

    ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );

    heldValues.push(startingObject);

    addObjectGraphNode(ExpectedObjectGraph, startingObject, startingJSTypeName, startingClassName);
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, startingObject, false);
  }
  //#endregion common test fixtures

  it("bound functions can refer jointly to a target", async () => {
    function boundGetOwner() {
      // empty on purpose
    }
    setExpectedGraph(
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
      setExpectedGraph(
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

      const enclosureArgs = [miscellaneous, target];
      addObjectGraphNode(
        ExpectedObjectGraph, enclosureArgs,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:5
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "arguments", enclosureArgs);

      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure.prototype, "constructor",
        enclosure, false
      );

      addArrayIndexEdge(ExpectedObjectGraph, enclosureArgs, 0, miscellaneous, false);
      addArrayIndexEdge(ExpectedObjectGraph, enclosureArgs, 1, target, false);

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/closures.js", "targetNotDirectlyHeld", false
      );
      expect(actual).toEqual(expected);
    });

    it("two levels deep, from the outer enclosure", async () => {
      setExpectedGraph(
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

      const enclosureArgs = [miscellaneous, target];
      addObjectGraphNode(
        ExpectedObjectGraph, enclosureArgs,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:5
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "arguments", enclosureArgs);

      addPropertyNameEdge(
        ExpectedObjectGraph, enclosure.prototype, "constructor",
        enclosure, false
      );

      addArrayIndexEdge(ExpectedObjectGraph, enclosureArgs, 0, miscellaneous, false);
      addArrayIndexEdge(ExpectedObjectGraph, enclosureArgs, 1, target, false);

      ExpectedObjectGraph.markStrongReferencesFromHeldValues();
      ExpectedObjectGraph.summarizeGraphToTarget(true);
      const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

      const actual = await getActualGraph(
        "functions/closures.js", "outerEnclosure", false
      );
      expect(actual).toEqual(expected);
    });

    it("two levels deep, from the inner enclosure", async () => {
      setExpectedGraph(
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

      const innerEnclosureArgs: unknown[] = [];
      addObjectGraphNode(
        ExpectedObjectGraph, innerEnclosureArgs,
        BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      ); // object:4
      addScopeValueEdge(ExpectedObjectGraph, enclosure, "arguments", innerEnclosureArgs);

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

  xit("async functions", async () => {

  });

  xit("async closures", async () => {

  });

  xit("arrow functions", async () => {

  });
});
