import fs from "fs/promises";
import path from "path";

import {
  BuildPromiseSet
} from "#build-utilities/source/BuildPromise.js";

import { stageDir } from "./source/constants.js";
import forwardToReflect from "./source/forwardToReflect.js";

const BPSet = new BuildPromiseSet;

BPSet.get("clean").addTask(async () => {
  console.log("cleaning generated code");
  await fs.rm(path.join(stageDir, "generated"), { force: true, recursive: true });
});

BPSet.get("forwardToReflect").addTask(async () => {
  console.log("Building ForwardToReflect class");
  await forwardToReflect();
});

BPSet.markReady();
BPSet.main.addSubtarget("clean");
BPSet.main.addSubtarget("forwardToReflect");
/*
BPSet.main.addSubtarget("eslint");
*/

await BPSet.main.run();
