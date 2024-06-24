/*
import { env } from "process";
*/

import { BuildPromiseSet } from "#utilities/source/BuildPromise.js";
import recursiveBuild from "#utilities/source/recursiveBuild.js";

const BPSet = new BuildPromiseSet;

function addStageDirs(dirs: string[]): void {
  for (const dir of dirs) {
    const stageTarget = BPSet.get("stages");
    stageTarget.addSubtarget("stage:" + dir);

    const target = BPSet.get("stage:" + dir);
    target.addTask(buildDirectory(dir));
  }
}

function buildDirectory(dir: string): () => Promise<void> {
  return async function() {
    await recursiveBuild(dir, "buildStage.ts");
  }
}

addStageDirs([
  "utilities",
  "_00_ecma_references",
]);

BPSet.markReady();
BPSet.main.addSubtarget("stages");
await BPSet.main.run();
