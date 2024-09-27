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
  stageDir
} from "./source/constants.js";
import forwardToReflect from "./source/forwardToReflect.js";
import createObjectGraphHandlerIfc from "./source/ObjectGraphHandlerIfc.js";
import createObjectGraphTailHandler from "./source/ObjectGraphTailHandler.js";
import createConvertingHeadProxyHandler from "./source/ConvertingHead.js";
import createRevokedInFlight from "./source/mirroring/revokedInFlight.js";
import createWrapReturnValues from "./source/mirroring/wrapReturnValues.js";

let ObjectGraphHandlerIfc: InterfaceDeclarationImpl;

async function removeGeneratedFiles(): Promise<void> {
  await fs.rm(
    path.join(stageDir, "generated"),
    { force: true, recursive: true }
  );
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

const Tasks: readonly TaskFunction[] = [
  removeGeneratedFiles,
  parallel([
    forwardToReflect,
    defineObjectGraphHandlerIfc,
  ]),
  defineObjectGraphTailHandler,
  parallel([
    createConvertingHeadProxyHandler,
    define_WrapReturnValues_Decorator,
    define_RevokedInFlight_Decorator,
  ])
];

export default Tasks;
