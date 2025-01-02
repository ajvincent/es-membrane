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
  await runJasmine("./spec-snapshot/support/jasmine.json", "stage_three_test");
}

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_3_snapshot"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    "pre-build/**/*.ts",
    "spec-snapshot/**/*.ts",
  ]);
}

const Tasks: readonly TaskFunction[] = [
  // we do this to ensure consistency between snapshots
  removeCanaries,
  jasmine,
  eslint,
];
export default Tasks;
