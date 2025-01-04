import path from "node:path";

import {
  series
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import runJasmine from "#utilities/source/runJasmine.js";
import runESLint from "#utilities/source/runEslint.js";

async function build_tests(): Promise<void> {
  await runJasmine("./build/spec/support/jasmine.json", "stage_three_generation_test");
}

async function build(): Promise<void> {
  const support: () => Promise<void> = (await import("./build/support.js")).default;
  await support();
}

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_3_generation"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    "moduleClasses/**/*.ts",
    "pseudoStatements/**/*.ts",
    "vanilla/**/*.ts",
  ]);
}

export default series([
  build_tests,
  build,
  eslint,
]);
