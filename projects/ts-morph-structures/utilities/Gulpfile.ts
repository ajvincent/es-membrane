import path from "node:path";

import type {
  TaskFunction,
} from "gulp";

import runJasmine from "#utilities/source/runJasmine.js";
import runESLint from "#utilities/source/runEslint.js";

import {
  projectDir,
} from "./source/AsyncSpecModules.js";

export const
  jasmine = () => runJasmine("./spec/support/jasmine.json", "build"),
  eslint = () => runESLint(path.join(projectDir, "utilities"), [
    "**/*.ts",
  ]);

const Tasks: readonly TaskFunction[] = [
  jasmine, eslint
];
export default Tasks;
