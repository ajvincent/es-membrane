import path from "node:path";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

import {
  BuiltInCollectionName,
  PRESUMED_HELD_NODE_KEY,
  type ReferenceGraph,
  TARGET_NODE_KEY,
} from "../../source/ReferenceGraph.js";

import {
  runSearchesInGuestEngine,
} from "../../source/runSearchesInGuestEngine.js";

import {
  ReferenceGraphImpl,
} from "../../source/engine262-tools/search/ReferenceGraphImpl.js";

import {
  addObjectToGraphs,
  addArrayIndexEdge,
} from "../support/fillReferenceGraph.js";

import {
  reparse
} from "../support/reparse.js";

export const projectRoot = path.join(monorepoRoot, "projects/reference-tracking");
export const referenceSpecDir = path.join(projectRoot, "dist/reference-spec");

function getSpecPath(leafName: string): string {
  return path.join(referenceSpecDir, leafName);
}

it("we can find the target when it's among the held values", async () => {
  const pathToSearch = getSpecPath("targetInHeldValuesArray.js");
  const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
  expect(graphs.size).toBe(1);
  const heldValuesGraph = graphs.get("targetHeldValuesArray");
  expect(heldValuesGraph).toBeDefined();
  if (!heldValuesGraph)
    return;

  const ExpectedGraph = new ReferenceGraphImpl;
  ExpectedGraph.foundTargetValue = true;
  ExpectedGraph.succeeded = true;

  addObjectToGraphs(
    ExpectedGraph,
    TARGET_NODE_KEY,
    BuiltInCollectionName.Object,
  );
  addObjectToGraphs(
    ExpectedGraph,
    PRESUMED_HELD_NODE_KEY,
    BuiltInCollectionName.Array,
    "Array"
  );

  addArrayIndexEdge(
    ExpectedGraph,
    PRESUMED_HELD_NODE_KEY,
    1,
    TARGET_NODE_KEY,
    1
  );

  expect(reparse(heldValuesGraph)).toEqual(reparse(ExpectedGraph));
});
