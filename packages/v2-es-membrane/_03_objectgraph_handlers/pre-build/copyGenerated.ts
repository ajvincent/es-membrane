import fs from "fs/promises";
import path from "path";

import {
  projectDir,
} from "#stage_utilities/source/AsyncSpecModules.js";

import {
  sourceGeneratedDir,
} from "./constants.js";

import runPrettify from "#build-utilities/source/runPrettify.js";

export async function copyGenerated(): Promise<void> {
  await fs.rm(sourceGeneratedDir, { recursive: true, force: true });
  await fs.mkdir(sourceGeneratedDir, { recursive: true });

  const previousGenerated = path.join(projectDir, "_02_code_generation/generated");
  await fs.cp(previousGenerated, sourceGeneratedDir, { recursive: true });

  await runPrettify(sourceGeneratedDir);
}
