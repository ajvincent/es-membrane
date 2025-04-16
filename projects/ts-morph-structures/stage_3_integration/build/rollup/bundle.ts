import path from "node:path";

import {
  asyncFork,
  monorepoRoot
} from "@ajvincent/build-utilities";

import {
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import {
  snapshotDir,
  stageDir
} from "../../pre-build/constants.js";

export default async function doBundles(): Promise<void>
{
  const rollupLocation = path.join(monorepoRoot, "node_modules/rollup/dist/bin/rollup");
  const pathToConfig = pathToModule(stageDir, "build/rollup/rollup.config.js");
  await asyncFork(
    rollupLocation,
    [
      "--config",
      pathToConfig,
    ],
    snapshotDir
  );
}
