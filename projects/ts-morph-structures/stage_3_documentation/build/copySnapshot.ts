import fs from "node:fs/promises";
import path from "node:path";

import {
  snapshotDir,
  typingsSnapshotDir
} from "./constants.js";

import {
  projectDir
} from "#utilities/source/AsyncSpecModules.js";

export async function copySnapshot(): Promise<void> {
  await fs.rm(snapshotDir, { force: true, recursive: true });
  await fs.cp(
    path.join(projectDir, "stage_2_snapshot/snapshot"),
    snapshotDir,
    { recursive: true }
  );
}

export async function removeSnapshots(): Promise<void> {
  await fs.rm(typingsSnapshotDir, { force: true, recursive: true });
  await fs.rm(snapshotDir, { force: true, recursive: true });
}
