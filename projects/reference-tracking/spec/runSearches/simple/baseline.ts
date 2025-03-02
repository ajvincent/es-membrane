//#region preamble
import graphlib from "@dagrejs/graphlib";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  ObjectGraphImpl
} from "../../../source/graph-analysis/ObjectGraphImpl.js";

import {
  runSearchesInGuestEngine,
} from "../../../source/runSearchesInGuestEngine.js";

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
  addPropertySymbolEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";

import {
  getReferenceSpecPath,
} from "../../support/projectRoot.js";
//#endregion preamble

describe("Simple graph searches:", () => {
  const target = { isTarget: true, }, heldValues = { isHeldValues: true };

  const targetMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Object,
    derivedClassName: BuiltInJSTypeName.Object,
  };

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array
  };

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  beforeEach(() => {
    ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );
  });

  function getExpectedGraph(): object {
    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);

    return graphlib.json.write(ExpectedObjectGraph.cloneGraph());
  }

  it("we can find the target when it's among the held values", async () => {
    {
      const isFirstValue = { isFirstValue: true };
      const isLastValue = { isLastValue: true };

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue);

      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, target);

      addObjectGraphNode(ExpectedObjectGraph, isLastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, isLastValue);
    }

    const expected: object = getExpectedGraph();
    const actual = await getActualGraph("simple/targetInHeldValuesArray.js", "targetHeldValuesArray");
    expect(actual).toEqual(expected);
  });

  it("we can find the target when it's inside an array literal among the held values", async () => {
    {
      const isFirstValue = { isFirstValue: true };
      const arrayHoldingTarget = [ target ];
      const isLastValue = { isLastValue: true };

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue);

      addObjectGraphNode(ExpectedObjectGraph, arrayHoldingTarget, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, arrayHoldingTarget);

      addObjectGraphNode(ExpectedObjectGraph, isLastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, isLastValue);

      addArrayIndexEdge(ExpectedObjectGraph, arrayHoldingTarget, 0, target);
    }

    const expected: object = getExpectedGraph();
    const actual = await getActualGraph("simple/targetIsElementOfHeldArray.js", "targetIsElementOfHeldArray");
    expect(actual).toEqual(expected);
  });

  it("we can find the target when it's inside an object literal among the held values", async () => {
    {
      const isFirstValue = { isFirstValue: true };
      const objectHoldingTarget = { target };
      const isLastValue = { isLastValue: true };

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue);

      addObjectGraphNode(ExpectedObjectGraph, objectHoldingTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, objectHoldingTarget);

      addObjectGraphNode(ExpectedObjectGraph, isLastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, isLastValue);

      addPropertyNameEdge(ExpectedObjectGraph, objectHoldingTarget, "target", target);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph("simple/targetIsElementOfHeldObject.js", "targetIsElementOfHeldObject");
    expect(actual).toEqual(expected);
  });

  it("we can find the target via a symbol-keyed property of an object literal", async () => {
    {
      const symbolKey = Symbol("This is a symbol");
      const objectHoldingTarget = { [symbolKey]: target };

      addObjectGraphNode(ExpectedObjectGraph, objectHoldingTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, objectHoldingTarget);

      addPropertySymbolEdge(ExpectedObjectGraph, objectHoldingTarget, symbolKey, target);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph("simple/symbolKeyHoldsTarget.js", "symbolKeyHoldsTarget");
    expect(actual).toEqual(expected);
  });

  it("when the target is not reachable, we report so", async () => {
    const pathToSearch = getReferenceSpecPath("simple/targetUnreachable.js");

    const graphs: ReadonlyDeep<Map<string, graphlib.Graph | null>> = await runSearchesInGuestEngine(pathToSearch);
    expect(graphs.size).toBe(1);

    const targetUnreachableGraph = graphs.get("targetUnreachable");
    expect(targetUnreachableGraph).toBeNull();
  });
});
