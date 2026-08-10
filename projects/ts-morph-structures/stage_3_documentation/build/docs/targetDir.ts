import path from "node:path";
import {
  monorepoRoot,
} from "@ajvincent/build-utilities";

import {
  pathToModule,
  projectDir
} from "#utilities/source/AsyncSpecModules.js";

import {
  stageDir
} from "../constants.js";

let targetDir: string;
if (path.basename(projectDir) === "ts-morph-structures")
  targetDir = path.join(monorepoRoot, "docs/ts-morph-structures/api");
else
  targetDir = pathToModule(stageDir, "docs-staging");

export {
  targetDir
};
