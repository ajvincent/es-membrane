import fs from "fs/promises";
import path from "path";

import {
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import readDirsDeep from "#utilities/source/readDirsDeep.js";

import {
  PromiseAllParallel,
  PromiseAllSequence
} from "#utilities/source/PromiseTypes.js";

import runPrettify from "#utilities/source/runPrettify.js";

import {
  stageDir,
  snapshotDir,
} from "./constants.js";

const previousDist = pathToModule(stageDir, "../stage_2_generation/dist");

export default async function copySnapshot(): Promise<void> {
  await fs.rm(snapshotDir, { recursive: true, force: true });
  await fs.mkdir(snapshotDir, { recursive: true });
  await fs.cp(previousDist, snapshotDir, { recursive: true });

  const sourceDir = pathToModule(stageDir, "source");
  const { dirs, files } = await readDirsDeep(sourceDir);

  const targetDir = path.join(snapshotDir, "source");
  await PromiseAllSequence(dirs, async d => {
    const targetSubDir = d.replace(sourceDir, targetDir);
    await fs.mkdir(targetSubDir, { recursive: true });
  });

  await PromiseAllParallel(files, async f => {
    let contents = await fs.readFile(f, { encoding: "utf-8" });
    contents = contents.replace(/..\/..\/snapshot\/source\//g, "../");

    const targetPath = f.replace(sourceDir, targetDir);
    await fs.writeFile(targetPath, contents, { encoding: "utf-8" });
  });

  await runPrettify(targetDir);
}
