import fs from "node:fs/promises";
import path from "node:path";

import {
  runESLint,
  runPrettify
} from "@ajvincent/build-utilities";

import {
  series,
} from "gulp";

import {
  buildFlatGraphHandler
} from "./source/buildFlatGraphHandler.js";

import {
  stageDir,
  generatedDirs,
} from "./source/utilities/constants.js";


async function removeGeneratedFiles(): Promise<void> {
  await fs.rm(
    path.join(stageDir, "generated"),
    { force: true, recursive: true }
  );
}

async function createGeneratedDirs(): Promise<void> {
  await Promise.all([
    fs.mkdir(generatedDirs.raw, { recursive: true }),
    fs.mkdir(generatedDirs.prettified, { recursive: true }),
    fs.mkdir(generatedDirs.final, { recursive: true }),
  ]);
}

//TODO: replace with gulp-prettify plugin... delayed because there aren't type definitions available
async function copyAndPrettifyGenerated(): Promise<void> {
  await fs.cp(generatedDirs.raw, generatedDirs.prettified, { recursive: true });
  await runPrettify(generatedDirs.prettified);
  await fs.cp(generatedDirs.prettified, generatedDirs.final, { recursive: true });
}

async function eslint(): Promise<void> {
  await runESLint(stageDir, [
    "source/**/*.ts",
    "Gulpfile.ts",
  ]);
}

/*
async function reportClassDecl(): Promise<void> {
  const decoratedGraphHandler: SourceFileImpl = getSourceStructure(
    "membranes_decorated/source/ObjectGraphHandler.ts"
  );
  const classDecl = decoratedGraphHandler.statements.at(-1);
  assert(typeof classDecl === "object");
  assert(classDecl.kind === StructureKind.Class);
  await Promise.resolve();
}
*/

export default series([
  removeGeneratedFiles,
  createGeneratedDirs,
  buildFlatGraphHandler,
  copyAndPrettifyGenerated,
  eslint,
]);
