import fs from "node:fs/promises";
import path from "node:path";

import {
  pathToModule,
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import {
  stageDir
} from "../pre-build/constants.js";

export default async function exportDist(): Promise<void>
{
  await fs.cp(
    pathToModule(stageDir, "snapshot/dist"),
    path.join(projectDir, "dist"),
    { recursive: true }
  );
}
