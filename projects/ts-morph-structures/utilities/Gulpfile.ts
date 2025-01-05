import path from "node:path";

import {
  series,
} from "gulp";

import {
  runESLint,
  runJasmine,
} from "@ajvincent/build-utilities";

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
