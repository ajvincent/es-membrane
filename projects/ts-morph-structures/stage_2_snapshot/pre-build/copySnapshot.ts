import fs from "fs/promises";

import {
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import {
  stageDir,
  snapshotDir,
} from "./constants.js";

export default async function copySnapshot(): Promise<void> {
  await fs.rm(snapshotDir, { recursive: true, force: true });

  const previousDist = pathToModule(stageDir, "../stage_2_integration/snapshot");

  await fs.mkdir(snapshotDir, { recursive: true });
  await fs.cp(previousDist, snapshotDir, { recursive: true });
}
