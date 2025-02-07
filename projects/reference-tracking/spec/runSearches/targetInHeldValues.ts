import path from "node:path";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

import type {
  ReferenceGraph
} from "../../source/ReferenceGraph.js";

import {
  runSearchesInGuestEngine,
} from "../../source/runSearchesInGuestEngine.js";

export const projectRoot = path.join(monorepoRoot, "projects/reference-tracking");
export const referenceSpecDir = path.join(projectRoot, "dist/reference-spec");

function getSpecPath(leafName: string): string {
  return path.join(referenceSpecDir, leafName);
}

xit("we can find the target when it's among the held values", async () => {
  const pathToSearch = getSpecPath("targetInHeldValuesArray.js");
  const graphs: ReadonlyDeep<Map<string, ReferenceGraph>> = await runSearchesInGuestEngine(pathToSearch);
  expect(graphs).toBeTruthy();
}, 1000 * 60 * 60);
