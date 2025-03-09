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
  addPropertyNameEdge,
  addConstructorOf,
  addInternalSlotEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches, class support:", () => {
  it("class instances refer to their constructors", async () => {
    class target {
      // empty on purpose
    }

    const heldValues: object[] = [];

    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Function,
      derivedClassName: BuiltInJSTypeName.Function,
    };

    const heldValuesMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Array,
      derivedClassName: BuiltInJSTypeName.Array
    };

    const ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );

    const instance = new target;
    heldValues.push(instance);

    addObjectGraphNode(ExpectedObjectGraph, instance, BuiltInJSTypeName.Object, "Vehicle");
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, instance);

    const Fred = { name: "Fred" };
    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person");
    addPropertyNameEdge(ExpectedObjectGraph, instance, "owner", Fred);

    addConstructorOf(ExpectedObjectGraph, instance, target);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph("simple/classesWithoutExtensions.js", "instance to class");
    expect(actual).toEqual(expected);
  });

  it("classes extending other classes", async () => {
    class Person {
      // empty on purpose
    }

    class Vehicle {
      // empty on purpose
    }

    class Bicycle extends Vehicle {
      // empty on purpose
    }

    const heldValues: object[] = [];

    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Function,
      derivedClassName: BuiltInJSTypeName.Function,
    };

    const heldValuesMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Array,
      derivedClassName: BuiltInJSTypeName.Array
    };

    const ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      Vehicle, targetMetadata, heldValues, heldValuesMetadata
    );

    const hisBike = new Bicycle;
    heldValues.push(hisBike);

    addObjectGraphNode(ExpectedObjectGraph, hisBike, BuiltInJSTypeName.Object, "Bicycle"); // node object:2
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, hisBike); // edge propertyKey:0

    const Fred = { name: "Fred" };
    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person"); // node object:3
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "owner", Fred); // edge propertyKey:1

    const Betty = { name: "Betty" };
    addObjectGraphNode(ExpectedObjectGraph, Betty, BuiltInJSTypeName.Object, "Person"); // node object:4
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "driver", Betty); // edge propertyKey:2

    addObjectGraphNode(ExpectedObjectGraph, Bicycle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // node object:5
    addConstructorOf(ExpectedObjectGraph, hisBike, Bicycle); // edge instanceOf:3

    addObjectGraphNode(ExpectedObjectGraph, Person, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // node object:6
    addConstructorOf(ExpectedObjectGraph, Fred, Person); // edge instanceOf:4

    addConstructorOf(ExpectedObjectGraph, Betty, Person); // edge instanceOf:5

    addObjectGraphNode(ExpectedObjectGraph, Bicycle.prototype, BuiltInJSTypeName.Object, "Bicycle"); // node object:7
    addPropertyNameEdge(ExpectedObjectGraph, Bicycle, "prototype", Bicycle.prototype); // edge propertyKey:6
    addInternalSlotEdge(ExpectedObjectGraph, Bicycle, "[[Prototype]]", Vehicle, true); // edge internalSlot:7

    addObjectGraphNode(ExpectedObjectGraph, Person.prototype, BuiltInJSTypeName.Object, "Person"); // node object:8
    addPropertyNameEdge(ExpectedObjectGraph, Person, "prototype", Person.prototype); // edge propertyKey:8

    addPropertyNameEdge(ExpectedObjectGraph, Bicycle.prototype, "constructor", Bicycle); // edge propertyKey:9

    addPropertyNameEdge(ExpectedObjectGraph, Person.prototype, "constructor", Person); // edge propertyKey:10

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph("simple/classesExtendingOtherClasses.js", "Bicycle extends Vehicle");
    expect(actual).toEqual(expected);
  });

  it("classes extending built-in classes", async () => {
    const actual = await getActualGraph("simple/classesExtendingBuiltins.js", "DefaultWeakMap extends WeakMap");
    expect(actual).toBeNull();
  });

  xit("classes with private fields", async () => {

  });

  xit("classes with static fields", async () => {

  });
});
