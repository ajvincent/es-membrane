import path from "node:path";

import {
  series,
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";
import runESLint from "#utilities/source/runEslint.js";

import buildStringStringMap from "./build/StringStringMap.js";

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "use-cases"), [
    "Gulpfile.ts",
    "build/**/*.ts",
  ]);
}

export default series([
  buildStringStringMap,
  eslint,
]);
