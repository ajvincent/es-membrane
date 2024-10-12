import fs from "node:fs/promises";
import path from "node:path";

import process from 'node:process';

import {
  InvokeTSC,
} from "@ajvincent/build-utilities";

export async function InvokeTSC_main(): Promise<void> {
  return InvokeTSC("../tsconfig.json", [
    "./Gulpfile.ts",
    "./pre-build/**",
    "./generated/**",
  ]);
}

export async function InvokeTSC_prebuild(): Promise<void> {
  const curDir: string = process.cwd();
  const buildDir: string = path.join(curDir, "pre-build");
  try {
    const dirStat = await fs.stat(buildDir);
    if (dirStat.isDirectory() === false)
      return;
  } catch (ex) {
    return;
  }

  await process.chdir(buildDir);
  await InvokeTSC("../../tsconfig.json", [
    "./Gulpfile.ts",
  ]);
  await process.chdir(curDir);
}
