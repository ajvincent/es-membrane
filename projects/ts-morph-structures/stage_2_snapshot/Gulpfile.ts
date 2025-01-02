import path from "node:path";

import type {
  TaskFunction
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import removeCanaries from "./build/removeCanaries.js";
import runJasmine from "#utilities/source/runJasmine.js";
import runESLint from "#utilities/source/runEslint.js";

async function jasmine(): Promise<void> {
  await runJasmine("./spec-snapshot/support/jasmine.json", "stage_two_test");
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

const Tasks: readonly TaskFunction[] = [
  jasmine,
  eslint,

  // There's actually a spec which relies on the canary files existing.
  removeCanaries,
];
export default Tasks;
