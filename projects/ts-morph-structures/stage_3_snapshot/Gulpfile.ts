import path from "node:path";

import {
  runESLint,
  runJasmine,
} from "@ajvincent/build-utilities";

import {
  series
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import removeCanaries from "./build/removeCanaries.js";

async function jasmine(): Promise<void> {
  await runJasmine("./spec-snapshot/support/jasmine.json");
}

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_3_snapshot"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    "pre-build/**/*.ts",
    "spec-snapshot/**/*.ts",
  ]);
}

export default series([
  // we do this to ensure consistency between snapshots
  removeCanaries,
  jasmine,
  eslint,
]);
