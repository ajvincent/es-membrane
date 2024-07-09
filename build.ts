import { BuildPromiseSet } from "#build-utilities/source/BuildPromise.js";
import recursiveBuild from "#build-utilities/source/recursiveBuild.js";

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
  "build-utilities",
  "_00_ecma_references",
  "_01_stage_utilities",
  "_02a_aspects_mockups",
  "_02b_aspects_stub_builders",
]);

BPSet.markReady();
BPSet.main.addSubtarget("stages");
await BPSet.main.run();
