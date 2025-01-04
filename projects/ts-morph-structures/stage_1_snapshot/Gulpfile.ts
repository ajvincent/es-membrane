import path from "node:path";

import {
  series
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import runJasmine from "#utilities/source/runJasmine.js";
import runESLint from "#utilities/source/runEslint.js";

async function test(): Promise<void> {
  await runJasmine("./spec-snapshot/support/jasmine.json", "stage_one_test");
}

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_1_snapshot"), [
    "Gulpfile.ts",
    "fixtures/**/*.ts",
    "prototype-snapshot/**/*.ts",
    "spec-snapshot/**/*.ts",
  ]);
}

export default series([
  test,
  eslint,
]);
