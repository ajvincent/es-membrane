import {
  fork
} from "node:child_process";

import path from "node:path";

import {
  chdir,
  cwd,
} from "node:process";

import type {
  series,
} from "gulp";

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
  const child = fork(pathToGulp, [
    "--no-experimental-require-module",
  ], {
    cwd: cwd(),
    stdio: ["ignore", "inherit", "inherit", "ipc"]
  });

  const p = new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (code)
        reject(code);
      else
        resolve();
    });
  });

  try {
    await p;
  }
  catch (code) {
    throw new Error(`Failed on "${pathToGulp}" with code ${code}`);
  }
}
