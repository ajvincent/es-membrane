import path from "node:path";

import {
  chdir,
  cwd,
} from "node:process";

import type {
  series,
} from "gulp";

import { asyncFork } from "./childProcess.js";

import {
  monorepoRoot,
} from "./constants.js";

import {
  InvokeTSC_excludeDirs,
} from "./InvokeTSC.js";

const pathToGulp: string = path.join(monorepoRoot, "node_modules/gulp/bin/gulp.js");

export function recursiveGulp(
  projectRoot: string,
  localPathToDir: string
): ReturnType<typeof series>
{
  const callback = () => invokeChildGulpFile(projectRoot, localPathToDir);
  callback.displayName = `<dir:${localPathToDir}>`;
  return callback;
}

async function invokeChildGulpFile(
  projectRoot: string,
  localPathToDir: string
): Promise<void>
{
  let targetDir: string = "";

  let previousDir: string;
  function pushd(): Promise<void> {
    console.log(`pushd(${localPathToDir})`);
    previousDir = cwd();
    targetDir = path.normalize(path.join(previousDir, localPathToDir));
    chdir(targetDir);
    return Promise.resolve();
  }

  function popd(): Promise<void> {
    console.log(`popd(${localPathToDir})`);
    chdir(previousDir);
    return Promise.resolve();
  }

  await pushd();
  try {
    await InvokeTSC_excludeDirs(projectRoot);
    await runChildGulpfile();
  }
  finally {
    await popd();
  }
}

async function runChildGulpfile(): Promise<void> {
  try {
    await asyncFork(pathToGulp, [
      "--no-experimental-require-module",
      "--expose-gc",
    ], cwd());
  }
  catch (code) {
    throw new Error(`Failed on "${pathToGulp}" with code ${code}`);
  }
}
