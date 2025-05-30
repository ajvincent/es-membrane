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
  addInternalSlotEdge,
  addMapKeyAndValue,
  addPrivateName,
  addPrivateFieldEdge,
  createExpectedGraph,
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

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  //#endregion common test fixtures

  it("class instances refer to their constructors", async () => {
    const hisBike = new Vehicle;
    [ExpectedObjectGraph] = createExpectedGraph(
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function,
      hisBike, BuiltInJSTypeName.Object, "Vehicle"
    );

    // object:2
    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person"); // object:3
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "owner", Fred, false);

    const bikeCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, bikeCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:4
    addInternalSlotEdge(ExpectedObjectGraph, hisBike, "[[ConstructedBy]]", bikeCtorList, true);
    // end object:2

    // object:3
    const FredCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, FredCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:5
    addInternalSlotEdge(ExpectedObjectGraph, Fred, "[[ConstructedBy]]", FredCtorList, true);
    // end object:3

    // object:4
    addArrayIndexEdge(ExpectedObjectGraph, bikeCtorList, 0, Vehicle, false);
    // end object:4

    // the rest of this doesn't go to the target, so it's probably okay to skip

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
    [ExpectedObjectGraph] = createExpectedGraph(
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function,
      hisBike, BuiltInJSTypeName.Object, "Bicycle"
    );

    addObjectGraphNode(ExpectedObjectGraph, Fred, BuiltInJSTypeName.Object, "Person"); // node object:3
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "owner", Fred, false); // edge propertyKey:1

    addObjectGraphNode(ExpectedObjectGraph, Betty, BuiltInJSTypeName.Object, "Person"); // node object:4
    addPropertyNameEdge(ExpectedObjectGraph, hisBike, "driver", Betty, false); // edge propertyKey:2

    const BikeCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, BikeCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // node object:5
    addInternalSlotEdge(ExpectedObjectGraph, hisBike, "[[ConstructedBy]]", BikeCtorList, true); // edge internalSlot:3

    // object:3
    const FredCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, FredCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // node object:6
    addInternalSlotEdge(ExpectedObjectGraph, Fred, "[[ConstructedBy]]", FredCtorList, true); // edge internalSlot:4
    // end object:3

    // object:4
    const BettyCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, BettyCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // node object:7
    addInternalSlotEdge(ExpectedObjectGraph, Betty, "[[ConstructedBy]]", BettyCtorList, true); // edge internalSlot:5
    // end object:4

    // object:5
    addArrayIndexEdge(ExpectedObjectGraph, BikeCtorList, 0, Vehicle, false); // propertyKey:6 to target

    addObjectGraphNode(ExpectedObjectGraph, Bicycle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // node object:8
    addArrayIndexEdge(ExpectedObjectGraph, BikeCtorList, 1, Bicycle, false); // propertyKey:7
    // end object:5

    // object:6
    addObjectGraphNode(ExpectedObjectGraph, Person, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // node object:9
    addArrayIndexEdge(ExpectedObjectGraph, FredCtorList, 0, Person, false);
    // end object:6

    // object:7
    addArrayIndexEdge(ExpectedObjectGraph, BettyCtorList, 0, Person, false);
    // end object:7

    // object:8
    addObjectGraphNode(ExpectedObjectGraph, Bicycle.prototype, BuiltInJSTypeName.Object, "Bicycle"); // node object:10
    addPropertyNameEdge(ExpectedObjectGraph, Bicycle, "prototype", Bicycle.prototype, false); // edge propertyKey:10
    addInternalSlotEdge(ExpectedObjectGraph, Bicycle, "[[Prototype]]", Vehicle, true); // edge internalSlot:11
    // end object:8

    // object:9
    addObjectGraphNode(ExpectedObjectGraph, Person.prototype, BuiltInJSTypeName.Object, "Person"); // node object:11
    addPropertyNameEdge(ExpectedObjectGraph, Person, "prototype", Person.prototype, false); // edge propertyKey:12
    // end object:9

    // object:10
    addPropertyNameEdge(ExpectedObjectGraph, Bicycle.prototype, "constructor", Bicycle, false); // edge propertyKey:13
    // end object:10

    // object:11
    addPropertyNameEdge(ExpectedObjectGraph, Person.prototype, "constructor", Person, false); // edge propertyKey:14
    // end object:11

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
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisCar, BuiltInJSTypeName.Object, "Vehicle"
    );

    // object:2
    const carCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, carCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:3
    addInternalSlotEdge(ExpectedObjectGraph, hisCar, "[[ConstructedBy]]", carCtorList, true);
    // end object:2

    // object:3
    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:3
    addArrayIndexEdge(ExpectedObjectGraph, carCtorList, 0, Vehicle, false);
    // end object:3

    // object:4
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);
    // end object:4

    // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);
    addPropertyNameEdge(ExpectedObjectGraph, hisCar, "owner", Fred, true); // here's your getter!
    // end object:5

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
    [ExpectedObjectGraph] = createExpectedGraph(
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
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisBike, BuiltInJSTypeName.Object, "Vehicle"
    );

    // object:2
    const privateName = addPrivateName(ExpectedObjectGraph, "#owner"); // privateName:3
    addPrivateFieldEdge(ExpectedObjectGraph, hisBike, privateName, "#owner", Fred, true); // defines privateFieldTuple:4

    const carCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, carCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:5
    addInternalSlotEdge(ExpectedObjectGraph, hisBike, "[[ConstructedBy]]", carCtorList, true);
    // end object:2

    // object:5
    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:6
    addArrayIndexEdge(ExpectedObjectGraph, carCtorList, 0, Vehicle, false);
    // end object:5

    // object:6
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:7
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);
    // end object:6

    // object:7
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);
    // end object:7

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
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisCar, BuiltInJSTypeName.Object, "Vehicle"
    );

    // object:2
    const carCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, carCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:3
    addInternalSlotEdge(ExpectedObjectGraph, hisCar, "[[ConstructedBy]]", carCtorList, true);
    // end object:2

    // object:3
    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:4
    addArrayIndexEdge(ExpectedObjectGraph, carCtorList, 0, Vehicle, false);
    // end object:3

    // object:4
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const ownersArray: Person[] = [Fred];
    addObjectGraphNode(ExpectedObjectGraph, ownersArray, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:6
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "owners", ownersArray, false);
    // end object:4

    // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);
    // end object:5

    // object:6
    addArrayIndexEdge(ExpectedObjectGraph, ownersArray, 0, Fred, false);
    // end object:6

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
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );

    // object:2
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:3
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;
    vehicleToOwnerMap.set(hisCar, Fred);
    addObjectGraphNode(ExpectedObjectGraph, vehicleToOwnerMap, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map); // object:4
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "owners", vehicleToOwnerMap, true);
    // end object:2

    // object:3
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);
    // end object:3

    // object:4
    addObjectGraphNode(ExpectedObjectGraph, hisCar, BuiltInJSTypeName.Object, "Vehicle"); // object:5
    addMapKeyAndValue(ExpectedObjectGraph, vehicleToOwnerMap, hisCar, Fred, true); // defines keyValueTuple:6
    // end object:4

    // object:5
    const carCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, carCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:7
    addInternalSlotEdge(ExpectedObjectGraph, hisCar, "[[ConstructedBy]]", carCtorList, true);
    // end object:5

    // object:7
    addArrayIndexEdge(ExpectedObjectGraph, carCtorList, 0, Vehicle, false);
    // end object:7

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
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      hisCar, BuiltInJSTypeName.Object, "Vehicle"
    );

    // object:2
    const carCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, carCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:3
    addInternalSlotEdge(ExpectedObjectGraph, hisCar, "[[ConstructedBy]]", carCtorList, true);
    // end object:2

    // object:3
    addObjectGraphNode(ExpectedObjectGraph, Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function); // object:4
    addArrayIndexEdge(ExpectedObjectGraph, carCtorList, 0, Vehicle, false);
    // end object:3

    // object:4
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const ownersPrivateName = addPrivateName(ExpectedObjectGraph, "#owners"); // privateName:6
    const ownersArray: Person[] = [Fred];
    addObjectGraphNode(ExpectedObjectGraph, ownersArray, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:7
    addPrivateFieldEdge(ExpectedObjectGraph, Vehicle, ownersPrivateName, "#owners", ownersArray, false); // defines privateFieldTuple:8
    // end object:4

    // object:5
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);
    // end object:5

    // object:7
    addArrayIndexEdge(ExpectedObjectGraph, ownersArray, 0, Fred, false);
    // end object:7

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
    [ExpectedObjectGraph] = createExpectedGraph(
      Fred, BuiltInJSTypeName.Object, "Person",
      Vehicle, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );

    // object:2
    addObjectGraphNode(ExpectedObjectGraph, Vehicle.prototype, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object); // object:3
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle, "prototype", Vehicle.prototype, false);

    const ownersName = addPrivateName(ExpectedObjectGraph, `#owners`); // privateName:4
    const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;

    // Vehicle.#owners leads to the map as object:5
    addObjectGraphNode(ExpectedObjectGraph, vehicleToOwnerMap, BuiltInJSTypeName.Map, BuiltInJSTypeName.Map); // object:5
    addPrivateFieldEdge(ExpectedObjectGraph, Vehicle, ownersName, "#owners", vehicleToOwnerMap, true); // defines privateTuple:6
    // end object:2

    // object:3
    addPropertyNameEdge(ExpectedObjectGraph, Vehicle.prototype, "constructor", Vehicle, false);
    // end object:3

    // object:5
    vehicleToOwnerMap.set(hisCar, Fred);
    addObjectGraphNode(ExpectedObjectGraph, hisCar, BuiltInJSTypeName.Object, "Vehicle"); // object:7
    addMapKeyAndValue(ExpectedObjectGraph, vehicleToOwnerMap, hisCar, Fred, true); // defines keyValueTuple:8
    // end object:5

    // object:7
    const carCtorList: never[] = [];
    addObjectGraphNode(ExpectedObjectGraph, carCtorList, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array); // object:9
    addInternalSlotEdge(ExpectedObjectGraph, hisCar, "[[ConstructedBy]]", carCtorList, true);
    // end object:9

    // object:9
    addArrayIndexEdge(ExpectedObjectGraph, carCtorList, 0, Vehicle, false);
    // end object:9

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "classes/classStaticPrivateAccessors.js", "class static getters", true
    );
    expect(actual).toEqual(expected);
  });
});
