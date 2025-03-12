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
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, instance, false);

    const Fred = { name: "Fred" };
    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person");
    addPropertyNameEdge(ExpectedObjectGraph, instance, "owner", Fred, false);

    addConstructorOf(ExpectedObjectGraph, instance, target);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph("classes/classesWithoutExtensions.js", "instance to class");
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
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, hisBike, false); // edge propertyKey:0

    const Fred = { name: "Fred" };
    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person"); // node object:3
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "owner", Fred, false); // edge propertyKey:1

    const Betty = { name: "Betty" };
    addObjectGraphNode(ExpectedObjectGraph, Betty, BuiltInJSTypeName.Object, "Person"); // node object:4
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "driver", Betty, false); // edge propertyKey:2

    addObjectGraphNode(ExpectedObjectGraph, Bicycle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // node object:5
    addConstructorOf(ExpectedObjectGraph, hisBike, Bicycle); // edge instanceOf:3

    addObjectGraphNode(ExpectedObjectGraph, Person, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // node object:6
    addConstructorOf(ExpectedObjectGraph, Fred, Person); // edge instanceOf:4

    addConstructorOf(ExpectedObjectGraph, Betty, Person); // edge instanceOf:5

    addObjectGraphNode(ExpectedObjectGraph, Bicycle.prototype, BuiltInJSTypeName.Object, "Bicycle"); // node object:7
    addPropertyNameEdge(ExpectedObjectGraph, Bicycle, "prototype", Bicycle.prototype, false); // edge propertyKey:6
    addInternalSlotEdge(ExpectedObjectGraph, Bicycle, "[[Prototype]]", Vehicle, true); // edge internalSlot:7

    addObjectGraphNode(ExpectedObjectGraph, Person.prototype, BuiltInJSTypeName.Object, "Person"); // node object:8
    addPropertyNameEdge(ExpectedObjectGraph, Person, "prototype", Person.prototype, false); // edge propertyKey:8

    addPropertyNameEdge(ExpectedObjectGraph, Bicycle.prototype, "constructor", Bicycle, false); // edge propertyKey:9

    addPropertyNameEdge(ExpectedObjectGraph, Person.prototype, "constructor", Person, false); // edge propertyKey:10

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph("classes/classesExtendingOtherClasses.js", "Bicycle extends Vehicle");
    expect(actual).toEqual(expected);
  });

  it("classes extending built-in classes", async () => {
    const actual = await getActualGraph("classes/classesExtendingBuiltins.js", "DefaultWeakMap extends WeakMap");
    expect(actual).toBeNull();
  });

  it("classes with getters to the target value", async () => {
    class Person {
      // empty on purpose
    }
    const Fred = new Person;

    class Vehicle {
      // empty on purpose
      get owner(): string {
        throw new Error("not implemented");
      }
    }

    const heldValues: object[] = [];

    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Object,
      derivedClassName: "Person",
    };

    const heldValuesMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Array,
      derivedClassName: BuiltInJSTypeName.Array
    };

    const ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      Fred, targetMetadata, heldValues, heldValuesMetadata
    );

    const hisCar = new Vehicle;
    heldValues.push(hisCar);

    addObjectGraphNode(ExpectedObjectGraph, hisCar, BuiltInJSTypeName.Object, "Vehicle"); // object:2
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, hisCar, false);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addConstructorOf(ExpectedObjectGraph, hisCar, Vehicle);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    addPropertyNameEdge(ExpectedObjectGraph, hisCar, "owner", Fred, true); // here's your getter!

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph("classes/classAccessors.js", "reaching a value via a getter");
    expect(actual).toEqual(expected);
  });

  it("classes with setters but no getters to the target value", async () => {
    const actual = await getActualGraph("classes/classAccessors.js", "unreachable values with only a setter route");
    expect(actual).toBeNull();
  });

  xit("classes with private fields", async () => {
  });

  // model on "classes with getters"
  xit("classes with private getters to the target value", async () => {

  });

  xit("classes with private setters but no getters to the target value", async () => {

  });

  it("classes with static fields", async () => {
    class Person {
      // empty on purpose
    }
    const Fred = new Person;

    class Vehicle {
      // empty on purpose
    }

    const heldValues: object[] = [];

    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Object,
      derivedClassName: "Person",
    };

    const heldValuesMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Array,
      derivedClassName: BuiltInJSTypeName.Array
    };

    const ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      Fred, targetMetadata, heldValues, heldValuesMetadata
    );

    const hisCar = new Vehicle;
    heldValues.push(hisCar);

    addObjectGraphNode(ExpectedObjectGraph, hisCar, BuiltInJSTypeName.Object, "Vehicle"); // object:2
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, hisCar, false);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addConstructorOf(ExpectedObjectGraph, hisCar, Vehicle);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const ownersArray: Person[] = [Fred];
    addObjectGraphNode(ExpectedObjectGraph, ownersArray, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "owners", ownersArray, false);

    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    addArrayIndexEdge(ExpectedObjectGraph, ownersArray, 0, Fred, false);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph("classes/classStaticFields.js", "class static fields");
    expect(actual).toEqual(expected);
  });

  xit("classes with static private fields", async () => {

  });
});
