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
  addSymbolGraphNode,
  addSymbolAsObjectKeyEdge,
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

  it("we can find a target object when it's among the held values", async () => {
    {
      const isFirstValue = { isFirstValue: true };
      const isLastValue = Symbol("is last value");

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue, false);

      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, target, false);

      addSymbolGraphNode(ExpectedObjectGraph, isLastValue);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, isLastValue, false);
    }

    const expected: object = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/targetInHeldValuesArray.js", "target object in held values", true
    );
    expect(actual).toEqual(expected);
  });

  it("we can find a target symbol when it's among the held values", async () => {
    ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    const target = Symbol("symbol target");

    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Symbol,
      derivedClassName: BuiltInJSTypeName.Symbol,
    };

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );

    {
      const isFirstValue = { isFirstValue: true };
      const isMiddleValue = { isMiddleValue: true };

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue, false);

      addObjectGraphNode(ExpectedObjectGraph, isMiddleValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, isMiddleValue, false);

      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, target, false);
    }

    const expected: object = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/targetInHeldValuesArray.js", "target symbol in held values", true
    );
    expect(actual).toEqual(expected);
  });

  it("we can find the target when it's inside an array literal among the held values", async () => {
    {
      const isFirstValue = { isFirstValue: true };
      const arrayHoldingTarget = [ target ];
      const isLastValue = { isLastValue: true };

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue, false);

      addObjectGraphNode(ExpectedObjectGraph, arrayHoldingTarget, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, arrayHoldingTarget, false);

      addObjectGraphNode(ExpectedObjectGraph, isLastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, isLastValue, false);

      addArrayIndexEdge(ExpectedObjectGraph, arrayHoldingTarget, 0, target, false);
    }

    const expected: object = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/targetIsElementOfHeldArray.js", "targetIsElementOfHeldArray", true
    );
    expect(actual).toEqual(expected);
  });

  it("we can find the target when it's inside an object literal among the held values", async () => {
    {
      const isFirstValue = { isFirstValue: true };
      const objectHoldingTarget = { target };
      const isLastValue = { isLastValue: true };

      addObjectGraphNode(ExpectedObjectGraph, isFirstValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, isFirstValue, false);

      addObjectGraphNode(ExpectedObjectGraph, objectHoldingTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, objectHoldingTarget, false);

      addObjectGraphNode(ExpectedObjectGraph, isLastValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 2, isLastValue, false);

      addPropertyNameEdge(ExpectedObjectGraph, objectHoldingTarget, "target", target, false);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/targetIsElementOfHeldObject.js", "targetIsElementOfHeldObject", true
    );
    expect(actual).toEqual(expected);
  });

  it("we can find a target symbol as a key of an object", async () => {
    {
      ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

      const target = Symbol("symbol target");
  
      const targetMetadata: GraphObjectMetadata = {
        builtInJSTypeName: BuiltInJSTypeName.Symbol,
        derivedClassName: BuiltInJSTypeName.Symbol,
      };
  
      ExpectedObjectGraph.defineTargetAndHeldValues(
        target, targetMetadata, heldValues, heldValuesMetadata
      );

      const tailValue = { isTail: true };

      const objectHoldingTarget = { [target]: tailValue };
      addObjectGraphNode(ExpectedObjectGraph, objectHoldingTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, objectHoldingTarget, false);

      addObjectGraphNode(ExpectedObjectGraph, tailValue, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addSymbolAsObjectKeyEdge(ExpectedObjectGraph, objectHoldingTarget, target);
      addPropertySymbolEdge(ExpectedObjectGraph, objectHoldingTarget, target, tailValue, false);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/targetIsSymbolKeyOfHeldObject.js",
      "target is symbol key of held object",
      true
    );
    expect(actual).toEqual(expected);
  });

  it("we can find the target via a symbol-keyed property of an object literal", async () => {
    {
      const symbolKey = Symbol("This is a symbol");

      const objectHoldingTarget = { [symbolKey]: target };
      addObjectGraphNode(ExpectedObjectGraph, objectHoldingTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, objectHoldingTarget, false);

      addSymbolGraphNode(ExpectedObjectGraph, symbolKey);
      addSymbolAsObjectKeyEdge(ExpectedObjectGraph, objectHoldingTarget, symbolKey);
      addPropertySymbolEdge(ExpectedObjectGraph, objectHoldingTarget, symbolKey, target, false);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/symbolKeyHoldsTarget.js", "symbolKeyHoldsTarget", true
    );
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
