import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";

import {
  monorepoRoot
} from "@ajvincent/build-utilities";


import {
  Deferred
} from "#utilities/source/PromiseTypes.js";

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
  const d = new Deferred<void>;
  const rollupLocation = path.join(monorepoRoot, "node_modules/rollup/dist/bin/rollup");
  const pathToConfig = pathToModule(stageDir, "build/rollup/rollup.config.js");
  const child = spawn(
    "node",
    [
      rollupLocation,
      "--config",
      pathToConfig,
    ],
    {
      cwd: snapshotDir,
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    }
  );
  child.on('exit', code => code ? d.reject(code) : d.resolve());
  await d.promise;
}
