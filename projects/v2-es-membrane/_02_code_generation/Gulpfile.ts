import fs from "node:fs/promises";
import path from "node:path";

import {
  parallel,
  type TaskFunction,
} from "gulp";

import type {
  InterfaceDeclarationImpl
} from "ts-morph-structures";

import {
  stageDir,
  generatedDirs,
} from "./source/constants.js";
import forwardToReflect from "./source/forwardToReflect.js";
import createObjectGraphHandlerIfc from "./source/ObjectGraphHandlerIfc.js";
import createObjectGraphTailHandler from "./source/ObjectGraphTailHandler.js";
import createConvertingHeadProxyHandler from "./source/ConvertingHead.js";
import createRevokedInFlight from "./source/mirroring/revokedInFlight.js";
import createWrapReturnValues from "./source/mirroring/wrapReturnValues.js";

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

const Tasks: readonly TaskFunction[] = [
  removeGeneratedFiles,
  createGeneratedDirs,
  parallel([
    forwardToReflect,
    defineObjectGraphHandlerIfc,
  ]),
  defineObjectGraphTailHandler,
  parallel([
    createConvertingHeadProxyHandler,
    define_WrapReturnValues_Decorator,
    define_RevokedInFlight_Decorator,
  ]),
  copyAndPrettifyGenerated,
];

export default Tasks;
