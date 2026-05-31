import fs from "node:fs/promises";
import path from "node:path";

import {
  parallel,
  series,
} from "gulp";

import type {
  InterfaceDeclarationImpl
} from "ts-morph-structures";

import {
  runESLint,
} from "@ajvincent/build-utilities";

import {
  stageDir,
  generatedDirs,
} from "./source/object-graphs/constants.js";

import createObjectGraphHandlerIfc from "./source/object-graphs/ObjectGraphHandlerIfc.js";
import createObjectGraphTailHandler from "./source/object-graphs/ObjectGraphTailHandler.js";
import createConvertingHeadProxyHandler from "./source/object-graphs/ConvertingHead.js";
import createRevokedInFlight from "./source/object-graphs/mirroring/revokedInFlight.js";
import createWrapReturnValues from "./source/object-graphs/mirroring/wrapReturnValues.js";

import { runPrettify } from "@ajvincent/build-utilities";

let ObjectGraphHandlerIfc: InterfaceDeclarationImpl;

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

async function defineObjectGraphHandlerIfc(): Promise<void> {
  ObjectGraphHandlerIfc = await createObjectGraphHandlerIfc();
}

async function defineObjectGraphTailHandler(): Promise<void> {
  await createObjectGraphTailHandler(ObjectGraphHandlerIfc);
}

async function define_WrapReturnValues_Decorator(): Promise<void> {
  await createWrapReturnValues(ObjectGraphHandlerIfc);
}

async function define_RevokedInFlight_Decorator(): Promise<void> {
  await createRevokedInFlight(ObjectGraphHandlerIfc);
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

const objectGraphTasks = series([
  defineObjectGraphHandlerIfc,
  defineObjectGraphTailHandler,
  parallel([
    createConvertingHeadProxyHandler,
    define_WrapReturnValues_Decorator,
    define_RevokedInFlight_Decorator,
  ]),
]);

export default series([
  removeGeneratedFiles,
  createGeneratedDirs,
  parallel([
    objectGraphTasks,
  ]),
  copyAndPrettifyGenerated,
  eslint,
]);
