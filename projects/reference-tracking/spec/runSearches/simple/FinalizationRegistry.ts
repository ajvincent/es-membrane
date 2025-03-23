//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addInternalSlotEdge,
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

  it("keeps strong references to its callback", async () => {
    const ExpectedObjectGraph = createExpectedGraph(
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
});
