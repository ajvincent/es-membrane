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

import {
  copySnapshot,
  removeSnapshots,
} from "./build/copySnapshot.js";

import {
  compileTypeDefinitions
} from "./build/docs/typeDeclarations.js";

import applyDecoratorsForDocModel from "./build/docs/decoratorsInDocModel.js";
import runAPIExtractor from "./build/docs/runAPIExtractor.js";
import runAPIDocumenter from "./build/docs/runAPIDocumenter.js";

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_3_documentation"), [
    "Gulpfile.ts",
    "build/**/*.ts",
  ]);
}

export default series([
  copySnapshot,
  compileTypeDefinitions,
  applyDecoratorsForDocModel,
  runAPIExtractor,
  runAPIDocumenter,
  eslint,
  removeSnapshots,
]);
