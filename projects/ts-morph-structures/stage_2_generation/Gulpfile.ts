import path from "node:path";

import {
  runJasmine,
} from "@ajvincent/build-utilities";

import {
  series,
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";


import runESLint from "#utilities/source/runEslint.js";

async function build_test(): Promise<void> {
  await runJasmine("./build/spec/support/jasmine.json");
}

async function build(): Promise<void> {
  const support = (await import("./build/support.js")).default;
  await support();
}

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_2_generation"), [
    "Gulpfile.ts",
    "build/**/*.ts",
  ]);
}

export default series([
  build_test,
  build,
  eslint,
]);
