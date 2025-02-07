import path from "node:path";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

import {
  runSearchesInGuestEngine,
  type SearchResults,
} from "../../source/runSearchesInGuestEngine.js";

export const projectRoot = path.join(monorepoRoot, "projects/reference-tracking");
export const referenceSpecDir = path.join(projectRoot, "dist/reference-spec");

function getSpecPath(leafName: string): string {
  return path.join(referenceSpecDir, leafName);
}

xit("we can find the target when it's among the held values", async () => {
  const pathToSearch = getSpecPath("targetInHeldValuesArray.js");
  const results: ReadonlyDeep<SearchResults> = await runSearchesInGuestEngine(pathToSearch);
  const { graphs } = results;
  expect(graphs).toBeTruthy();
}, 1000 * 60 * 60);
