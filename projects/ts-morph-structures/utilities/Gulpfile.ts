import path from "node:path";

import {
  series,
} from "gulp";

import {
  runJasmine,
} from "@ajvincent/build-utilities";
import runESLint from "#utilities/source/runEslint.js";

import {
  projectDir,
} from "./source/AsyncSpecModules.js";

export const
  jasmine = () => runJasmine("./spec/support/jasmine.json"),
  eslint = () => runESLint(path.join(projectDir, "utilities"), [
    "**/*.ts",
  ]);

export default series([
  jasmine, eslint
]);
