import path from "node:path";

import {
  runESLint,
} from "@ajvincent/build-utilities"

import {
  series,
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import structureToSyntax from "./build/structureToSyntax.js";
import doBundles from "./build/rollup/bundle.js";

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_3_integration"), [
    "Gulpfile.ts",
    "build/**/*.ts",
  ]);
}

export default series([
  structureToSyntax,
  doBundles,
  eslint,
]);
