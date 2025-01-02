import path from "node:path";

import type {
  TaskFunction
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import runESLint from "#utilities/source/runEslint.js";

import structureToSyntax from "./build/structureToSyntax.js";
import doBundles from "./build/rollup/bundle.js";

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_3_integration"), [
    "Gulpfile.ts",
    "build/**/*.ts",
  ]);
}

const Tasks: readonly TaskFunction[] = [
  structureToSyntax,
  doBundles,
  eslint,
];
export default Tasks;
