import fs from "node:fs/promises";
import path from "node:path";

import {
  asyncFork,
  monorepoRoot
} from "@ajvincent/build-utilities";

import {
  pathToModule,
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import {
  snapshotDir,
  stageDir
} from "../../pre-build/constants.js";

export default async function doBundles(): Promise<void>
{
  await doRollup();

  await fs.cp(pathToModule(stageDir, "snapshot/dist"), path.join(projectDir, "dist"), { recursive: true });
}

async function doRollup(): Promise<void>
{
  const rollupLocation = path.join(monorepoRoot, "node_modules/rollup/dist/bin/rollup");
  const pathToConfig = pathToModule(stageDir, "build/rollup/rollup.config.js");
  await asyncFork(rollupLocation, [
      "--config",
      pathToConfig,
    ],
    snapshotDir
  );
}
