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
  await runESLint(path.join(projectDir, "stage_2_snapshot"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    // "fixtures/**/*.ts"
    "snapshot/**/*.ts",
    "spec-snapshot/**/*.ts",
  ]);
}

export default series([
  jasmine,
  eslint,

  // There's actually a spec which relies on the canary files existing.
  removeCanaries,
]);
