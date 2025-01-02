import path from "node:path";

import {
  type TaskFunction,
} from "gulp";

import {
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import runESLint from "#utilities/source/runEslint.js";

import structureToSyntax from "./build/structureToSyntax.js";
import compileTypeDeclarations from "./build/docs/typeDeclarations.js";
import doBundles from "./build/rollup/bundle.js";
import runAPIExtractor from "./build/docs/runAPIExtractor.js";
import applyDecoratorsForDocModel from "./build/docs/decoratorsInDocModel.js";
import runAPIDocumenter from "./build/docs/runAPIDocumenter.js";

async function eslint(): Promise<void> {
  await runESLint(path.join(projectDir, "stage_2_integration"), [
    "Gulpfile.ts",
    "build/**/*.ts",
    "pre-build/**/*.ts",
  ]);
}

const Tasks: readonly TaskFunction[] = [
  structureToSyntax,
  doBundles,
  compileTypeDeclarations,
  applyDecoratorsForDocModel,
  runAPIExtractor,
  runAPIDocumenter,
  eslint,
];
export default Tasks;
