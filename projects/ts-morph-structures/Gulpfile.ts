import path from "node:path";

import {
  fileURLToPath,
} from "node:url";

import {
  series
} from "gulp";

import {
  recursiveGulp,
} from "@ajvincent/build-utilities";

const projectRoot: string = path.normalize(path.dirname(
  fileURLToPath(import.meta.url)
));

function buildStage(
  dirs: readonly string[]
): ReturnType<typeof series>
{
  return series(dirs.map(d => recursiveGulp(projectRoot, d)));
}

export const stage_one = buildStage([
  "utilities",
  "stage_0_references",
  "stage_1_snapshot"
]);

export const stage_two = buildStage([
  "stage_2_generation",
  "stage_2_integration/pre-build",
  "stage_2_integration",
  "stage_2_snapshot/pre-build",
  "stage_2_snapshot",
]);

export const stage_three = buildStage([
  "stage_3_generation",
  "stage_3_integration/pre-build",
  "stage_3_integration",
  "stage_3_snapshot/pre-build",
  "stage_3_snapshot",
]);

export const use_cases = buildStage([
  "use-cases"
]);

export default series([
  stage_one,
  stage_two,
  stage_three,
  use_cases
]);
