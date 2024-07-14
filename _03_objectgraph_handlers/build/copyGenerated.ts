import fs from "fs/promises";
import path from "path";

import {
  projectDir,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  sourceGeneratedDir,
} from "./constants.js";
import runPrettify from "#build-utilities/source/runPrettify.js";

export default async function copySnapshot(): Promise<void> {
  await fs.rm(sourceGeneratedDir, { recursive: true, force: true });
  await fs.mkdir(sourceGeneratedDir, { recursive: true });

  const previousGenerated = path.join(projectDir, "_02_code_generation/generated");
  await fs.cp(previousGenerated, sourceGeneratedDir, { recursive: true });

  await runPrettify(sourceGeneratedDir);
}
