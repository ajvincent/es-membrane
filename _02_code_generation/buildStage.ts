import fs from "fs/promises";
import path from "path";

import type {
  InterfaceDeclarationImpl
} from "ts-morph-structures";

import {
  BuildPromiseSet
} from "#build-utilities/source/BuildPromise.js";

import {
  stageDir
} from "./source/constants.js";
import forwardToReflect from "./source/forwardToReflect.js";
import createObjectGraphHandlerIfc from "./source/ObjectGraphHandlerIfc.js";
import createObjectGraphTailHandler from "./source/ObjectGraphTailHandler.js";
import createConvertingHeadProxyHandler from "./source/ConvertingHead.js";
import createRevokedInFlight from "./source/mirroring/revokedInFlight.js";
import createWrapReturnValues from "./source/mirroring/wrapReturnValues.js";

const BPSet = new BuildPromiseSet;

let ObjectGraphHandlerIfc: InterfaceDeclarationImpl;

BPSet.get("clean").addTask(async () => {
  console.log("starting _02_code_generation:clean");
  await fs.rm(path.join(stageDir, "generated"), { force: true, recursive: true });
  console.log("completed _02_code_generation:clean");
});

BPSet.get("forwardToReflect").addTask(async () => {
  console.log("starting _02_code_generation:ForwardToReflect");
  await forwardToReflect();
  console.log("completed _02_code_generation:ForwardToReflect");
});

BPSet.get("ObjectGraphHandlerIfc").addTask(async () => {
  console.log("starting _02_code_generation:ObjectGraphHandlerIfc");
  ObjectGraphHandlerIfc = await createObjectGraphHandlerIfc();
  console.log("completed _02_code_generation:ObjectGraphHandlerIfc");
});

BPSet.get("ObjectGraphTailHandler").addSubtarget("ObjectGraphHandlerIfc");
BPSet.get("ObjectGraphTailHandler").addTask(async () => {
  console.log("starting _02_code_generation:ObjectGraphTailHandler");
  await createObjectGraphTailHandler(ObjectGraphHandlerIfc);
  console.log("completed _02_code_generation:ObjectGraphTailHandler");
});

BPSet.get("ConvertingHeadProxyHandler").addSubtarget("ObjectGraphHandlerIfc");
BPSet.get("ConvertingHeadProxyHandler").addTask(async () => {
  console.log("starting _02_code_generation:ConvertingHeadProxyHandler");
  await createConvertingHeadProxyHandler();
  console.log("completed _02_code_generation:ConvertingHeadProxyHandler");
});

BPSet.get("WrapReturnValues").addSubtarget("ObjectGraphHandlerIfc");
BPSet.get("WrapReturnValues").addSubtarget("ObjectGraphTailHandler");
BPSet.get("WrapReturnValues").addTask(async () => {
  console.log("starting _02_code_generation:WrapReturnValues");
  await createWrapReturnValues(ObjectGraphHandlerIfc);
  console.log("completed _02_code_generation:WrapReturnValues");
});

BPSet.get("RevokedInFlight").addSubtarget("ObjectGraphHandlerIfc");
BPSet.get("RevokedInFlight").addSubtarget("ObjectGraphTailHandler");
BPSet.get("RevokedInFlight").addTask(async () => {
  console.log("starting _02_code_generation:RevokedInFlight");
  await createRevokedInFlight(ObjectGraphHandlerIfc);
  console.log("completed _02_code_generation:RevokedInFlight");
});

BPSet.get("build files").addSubtarget("forwardToReflect");
BPSet.get("build files").addSubtarget("ObjectGraphHandlerIfc");
BPSet.get("build files").addSubtarget("ObjectGraphTailHandler");
BPSet.get("build files").addSubtarget("ConvertingHeadProxyHandler");
BPSet.get("build files").addSubtarget("WrapReturnValues");
BPSet.get("build files").addSubtarget("RevokedInFlight");

BPSet.markReady();
BPSet.main.addSubtarget("clean");
BPSet.main.addSubtarget("build files");
/*
BPSet.main.addSubtarget("eslint");
*/

await BPSet.main.run();
