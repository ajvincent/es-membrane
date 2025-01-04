// #region preamble
import fs from "fs/promises";

import {
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import runPrettify from "#utilities/source/runPrettify.js";

import {
  stageDir,
} from "./constants.js";

import BuildClassesDriver from "./BuildClassesDriver.js";

const distDir = pathToModule(stageDir, "dist");

// #endregion preamble

async function cleanDist(): Promise<void>
{
  let found = false;
  try {
    await fs.access(distDir);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(distDir, { recursive: true });
}

export default async function buildDist(): Promise<void>
{
  await cleanDist();

  await BuildClassesDriver(distDir);
  await runPrettify(distDir);
}
