import path from "node:path";

import {
  asyncFork,
  monorepoRoot
} from "@ajvincent/build-utilities";

import {
  projectDir,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import {
  stageDir,
} from "../../pre-build/constants.js";

export default
async function runAPIDocumenter(): Promise<void>
{
  await asyncFork(
    path.join(monorepoRoot, "node_modules/@microsoft/api-documenter/bin/api-documenter"),
    [
      "markdown",

      "--input-folder",
      pathToModule(stageDir, "typings-snapshot/extracted"),

      "--output-folder",
      path.join(monorepoRoot, "docs/ts-morph-structures/api")
    ],
    projectDir
  );
}
