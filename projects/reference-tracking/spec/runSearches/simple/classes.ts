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

  xit("classes extending other classes", async () => {

  });

  xit("classes extending built-in classes", async () => {

  });

  xit("classes with private fields", async () => {

  });

  xit("classes with static fields", async () => {

  });
});
