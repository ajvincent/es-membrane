import path from "node:path";

import {
  runESLint,
} from "@ajvincent/build-utilities";

import {
  series,
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import structureToSyntax from "./build/structureToSyntax.js";

import doBundles from "./build/rollup/bundle.js";

import {
  fixExportTypes
} from "./build/fixExportTypes.js";

import exportDist from "./build/exportDist.js";

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_2_integration"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    "pre-build/**/*.ts",
    "utilities/newTypeStructure.ts",
  ]);
}

export default series([
  structureToSyntax,
  doBundles,
  fixExportTypes,
  eslint,
  exportDist,
]);
