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
  addMapKeyAndValue,
  addPrivateName,
  addPrivateFieldEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches, class support:", () => {
  //#region common test fixtures
  class Person {
    readonly name: string;
    constructor(name: string) {
      this.name = name;
    }
  }
  const Fred = new Person("Fred");
  const Betty = new Person("Betty");

  class Vehicle {
    get owner(): string {
      throw new Error("not implemented");
    }
  }

  class Bicycle extends Vehicle {
    // empty on purpose
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

  it("class instances refer to their constructors", async () => {
    const hisBike = new Vehicle;
    setExpectedGraph(
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function,
      hisBike, BuiltInJSTypeName.Object, "Vehicle"
    );

    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person");
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "owner", Fred, false);

    addConstructorOf(ExpectedObjectGraph, hisBike, Vehicle);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classesWithoutExtensions.js", "instance to class", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes extending other classes", async () => {
    const hisBike = new Bicycle;
    setExpectedGraph(
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function,
      hisBike, BuiltInJSTypeName.Object, "Bicycle"
    );

    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person"); // node object:3
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "owner", Fred, false); // edge propertyKey:1

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

    const actual = await getActualGraph(
      "classes/classesExtendingOtherClasses.js", "Bicycle extends Vehicle", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes extending built-in classes", async () => {
    const actual = await getActualGraph(
      "classes/classesExtendingBuiltins.js", "DefaultWeakMap extends WeakMap", true
    );
    expect(actual).toBeNull();
  });

  it("classes with getters to the target value", async () => {
    const hisCar = new Vehicle;
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisCar, BuiltInJSTypeName.Object, "Vehicle"
    );

    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addConstructorOf(ExpectedObjectGraph, hisCar, Vehicle);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    addPropertyNameEdge(ExpectedObjectGraph, hisCar, "owner", Fred, true); // here's your getter!

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classAccessors.js", "reaching a value via a getter", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes with setters but no getters to the target value", async () => {
    const actual = await getActualGraph(
      "classes/classAccessors.js", "unreachable values with only a setter route", true
    );
    expect(actual).toBeNull();
  });

  it("classes with private fields", async () => {
    const hisBike = new Vehicle;
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisBike, BuiltInJSTypeName.Object, "Vehicle"
    );

    const privateName = addPrivateName(ExpectedObjectGraph, "#owner");
    addPrivateFieldEdge(ExpectedObjectGraph, hisBike, privateName, "#owner", Fred, false);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classPrivateFields.js", "class private fields", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes with private getters to the target value", async () => {
    const hisBike = new Vehicle;
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisBike, BuiltInJSTypeName.Object, "Vehicle"
    );

    const privateName = addPrivateName(ExpectedObjectGraph, "#owner");
    addPrivateFieldEdge(ExpectedObjectGraph, hisBike, privateName, "#owner", Fred, true);
    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addConstructorOf(ExpectedObjectGraph, hisBike, Vehicle);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classPrivateAccessors.js", "class private getter", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes with private setters but no getters to the target value", async () => {
    const actual = await getActualGraph(
      "classes/classPrivateAccessors.js", "unreachable values with only a setter route", true
    );
    expect(actual).toBeNull();
  });

  it("classes with static fields", async () => {
    const hisCar = new Vehicle;
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisCar, BuiltInJSTypeName.Object, "Vehicle"
    );

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

    const actual = await getActualGraph(
      "classes/classStaticFields.js", "class static fields", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes with static getters", async () => {
    const hisCar = new Vehicle();
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );

    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:3
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;
    vehicleToOwnerMap.set(hisCar, Fred);
    addObjectGraphNode(ExpectedObjectGraph, vehicleToOwnerMap, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "owners", vehicleToOwnerMap, true);

    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    addObjectGraphNode(ExpectedObjectGraph, hisCar, BuiltInJSTypeName.Object, "Vehicle"); // object:5
    addMapKeyAndValue(ExpectedObjectGraph, vehicleToOwnerMap, hisCar, Fred, true);
    addConstructorOf(ExpectedObjectGraph, hisCar, Vehicle); // need to define the edge, even if we found the target

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classStaticAccessors.js", "class static getters", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes with private static fields", async () => {
    const hisCar = new Vehicle;
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisCar, BuiltInJSTypeName.Object, "Vehicle"
    );

    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addConstructorOf(ExpectedObjectGraph, hisCar, Vehicle);

    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const ownersPrivateName = addPrivateName(ExpectedObjectGraph, "#owners");
    const ownersArray: Person[] = [Fred];
    addObjectGraphNode(ExpectedObjectGraph, ownersArray, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:5
    addPrivateFieldEdge(ExpectedObjectGraph, Vehicle, ownersPrivateName, "#owners", ownersArray, false);

    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    addArrayIndexEdge(ExpectedObjectGraph, ownersArray, 0, Fred, false);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classStaticPrivateFields.js", "class private static fields", true
    );
    expect(actual).toEqual(expected);
  });

  it("classes with static private getters", async () => {
    const hisCar = new Vehicle();
    setExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );

    // Vehicle = object:2
    // Vehicle.prototype = object:3
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:3
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const ownersName = addPrivateName(ExpectedObjectGraph, `#owners`); // privateName:4
    const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;

    // Vehicle.#owners leads to the map as object:5
    addObjectGraphNode(ExpectedObjectGraph, vehicleToOwnerMap, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map); // object:5
    addPrivateFieldEdge(ExpectedObjectGraph, Vehicle, ownersName, "#owners", vehicleToOwnerMap, true);

    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);

    vehicleToOwnerMap.set(hisCar, Fred);
    addObjectGraphNode(ExpectedObjectGraph, hisCar, BuiltInJSTypeName.Object, "Vehicle"); // object:6
    addMapKeyAndValue(ExpectedObjectGraph, vehicleToOwnerMap, hisCar, Fred, true);
    addConstructorOf(ExpectedObjectGraph, hisCar, Vehicle); // need to define the edge, even if we found the target

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classStaticPrivateAccessors.js", "class static getters", true
    );
    expect(actual).toEqual(expected);
  });
});
