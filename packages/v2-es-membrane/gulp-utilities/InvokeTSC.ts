import {
  fork
} from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

import process from 'node:process';

import {
  monorepoRoot,
} from "./constants.js";

import {
  overwriteFileIfDifferent
} from "@ajvincent/build-utilities";

const dirConfig = `{
  "extends": "../tsconfig.json",
  "exclude": [
    "./pre-build/**",
    "./generated/**"
  ]
}
`;

const buildDirConfig = `{
  "extends": "../../tsconfig.json",
}
`;

const TSC = path.resolve(monorepoRoot, "node_modules/typescript/bin/tsc");

export default
async function InvokeTSC(): Promise<void> {

  await overwriteFileIfDifferent(
    true, dirConfig, path.join(process.cwd(), "tsconfig.json"), new Date()
  );
  return InvokeTSC_Internal(process.cwd());
}

export async function InvokeTSC_prebuild(): Promise<void> {
  const buildDir = path.join(process.cwd(), "pre-build");
  try {
    const dirStat = await fs.stat(buildDir);
    if (dirStat.isDirectory() === false)
      return;
  } catch (ex) {
    return;
  }

  await overwriteFileIfDifferent(
    true, buildDirConfig, path.join(buildDir, "tsconfig.json"), new Date()
  );
  return InvokeTSC_Internal(buildDir);
}

async function InvokeTSC_Internal(
  cwd: string
): Promise<void>
{
  const child = fork(TSC, [], {
    cwd,
    stdio: ["ignore", "inherit", "inherit", "ipc"]
  });
  let p = new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      code ? reject(code) : resolve(code);
    });
  });
  try {
    await p;
  }
  catch (code) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    //console.warn(await fs.readFile(pathToStdOut, { encoding: "utf-8" }));
    throw new Error(`Failed on "${TSC}" with code ${code}`);
  }
}
