//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import type {
  HostObjectGraph,
  ObjectGraphImpl,
} from "../../../source/graph-analysis/ObjectGraphImpl.js";

import type {
  GraphObjectMetadata
} from "../../../source/types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../../source/types/GraphRelationshipMetadata.js";


import {
  addArrayIndexEdge,
  addInternalSlotEdge,
  addObjectGraphNode,
  createExpectedGraph,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches: FinalizationRegistry", () => {
  function callback(value: unknown): void {
    void(value);
  }
  const registry = { isRegistry: true };
  const target = { isTarget: true };
  const registryHeld = { isRegistryHeld: true};
  const token = { isToken: true };

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  let heldValues: WeakKey[];

  function addToRegistry(
    ExpectedObjectGraph: HostObjectGraph<GraphObjectMetadata, GraphRelationshipMetadata>
  ): void
  {
    addObjectGraphNode(
      ExpectedObjectGraph, callback,
      BuiltInJSTypeName.Function, BuiltInJSTypeName.Function
    );
    addInternalSlotEdge(
      ExpectedObjectGraph, registry, `[[CleanupCallback]]`, callback, true
    );

    if (ExpectedObjectGraph.hasObject(target) === false) {
      addObjectGraphNode(
        ExpectedObjectGraph, target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      );
    }

    if (ExpectedObjectGraph.hasObject(registryHeld) === false) {
      addObjectGraphNode(
        ExpectedObjectGraph, registryHeld, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      );
    }

    if (ExpectedObjectGraph.hasObject(token) === false) {
      addObjectGraphNode(
        ExpectedObjectGraph, token, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
      );
    }

    ExpectedObjectGraph.defineFinalizationTuple(registry, target, registryHeld, token);
  }

  it("keeps strong references to its callback", async () => {
    [ExpectedObjectGraph, heldValues] = createExpectedGraph(
      callback, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function,
      registry, BuiltInJSTypeName.FinalizationRegistry, BuiltInJSTypeName.FinalizationRegistry
    );

    addInternalSlotEdge(ExpectedObjectGraph, registry, `[[CleanupCallback]]`, callback, true);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());

    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "callback", false
    );
    expect(actual).toEqual(expected);
  });

  it("does not keep strong references to the registry target", async () => {
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "target before unregistration (strong)", false
    );
    expect(actual).toBeNull();
  });

  it("keeps weak references to the target", async () => {
    [ExpectedObjectGraph, heldValues] = createExpectedGraph(
      target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      registry, BuiltInJSTypeName.FinalizationRegistry, BuiltInJSTypeName.FinalizationRegistry
    );

    addToRegistry(ExpectedObjectGraph);
    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "target before unregistration (weak)", false
    );
    expect(actual).toEqual(expected);
  });

  it("does not keep strong references to the registered held value", async () => {
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "heldValue before unregistration (strong)", false
    );
    expect(actual).toBeNull();
  });

  it("keeps weak references to the registered held value", async () => {
    [ExpectedObjectGraph, heldValues] = createExpectedGraph(
      registryHeld, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      registry, BuiltInJSTypeName.FinalizationRegistry, BuiltInJSTypeName.FinalizationRegistry
    );

    addToRegistry(ExpectedObjectGraph);
    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "heldValue before unregistration (weak)", false
    );
    expect(actual).toEqual(expected);
  });

  it("jointly keeps references to the registered held value with the target", async () => {
    [ExpectedObjectGraph, heldValues] = createExpectedGraph(
      registryHeld, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      registry, BuiltInJSTypeName.FinalizationRegistry, BuiltInJSTypeName.FinalizationRegistry
    );

    addObjectGraphNode(
      ExpectedObjectGraph, target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
    );
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, target, false);
    addToRegistry(ExpectedObjectGraph);

    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);

    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "heldValue before unregistration (joint)", false
    );
    expect(actual).toEqual(expected);
  });

  it("does not keep strong references to the unregister token", async () => {
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "unregisterToken before unregistration (strong)", false
    );
    expect(actual).toBeNull();
  });

  it("keeps weak references to the unregister token", async () => {
    [ExpectedObjectGraph, heldValues] = createExpectedGraph(
      token, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      registry, BuiltInJSTypeName.FinalizationRegistry, BuiltInJSTypeName.FinalizationRegistry
    );

    addToRegistry(ExpectedObjectGraph);
    ExpectedObjectGraph.summarizeGraphToTarget(false);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "unregisterToken before unregistration (weak)", false
    );
    expect(actual).toEqual(expected);
  });

  it("jointly (but weakly) keeps references to the unregister token with the target", async () => {
    [ExpectedObjectGraph, heldValues] = createExpectedGraph(
      token, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      registry, BuiltInJSTypeName.FinalizationRegistry, BuiltInJSTypeName.FinalizationRegistry
    );

    addObjectGraphNode(
      ExpectedObjectGraph, target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object
    );
    addArrayIndexEdge(ExpectedObjectGraph, heldValues, 1, target, false);
    addToRegistry(ExpectedObjectGraph);

    //ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(false);

    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "unregisterToken before unregistration (joint)", false
    );
    expect(actual).toEqual(expected);
  });

  it("clears references to the target after unregistration", async () => {
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "target after unregistration", false
    );
    expect(actual).toBeNull();
  });

  it("clears references to the registered held value after unregistration", async () => {
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "heldValue after unregistration", false
    );
    expect(actual).toBeNull();
  });

  it("clears references to the unregister token after unregistration", async () => {
    const actual = await getActualGraph(
      "simple/finalizationRegistry.js", "unregisterToken after unregistration", false
    );
    expect(actual).toBeNull();
  });
});
