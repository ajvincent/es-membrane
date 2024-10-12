import fs from "fs/promises";
import path from "path";

import {
  projectDir,
} from "#stage_utilities/source/AsyncSpecModules.js";

import {
  sourceGeneratedDir,
} from "./constants.js";

import {
  type TaskFunction,
} from "gulp";

export async function copyGenerated(): Promise<void> {
  await fs.rm(sourceGeneratedDir, { recursive: true, force: true });
  await fs.mkdir(sourceGeneratedDir, { recursive: true });

  const previousGenerated = path.join(projectDir, "_02_code_generation/generated/final");
  await fs.cp(previousGenerated, sourceGeneratedDir, { recursive: true });
}

const Tasks: readonly TaskFunction[] = [
  copyGenerated,
];
export default Tasks;
