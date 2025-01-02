import fs from "node:fs/promises";
import path from "node:path";
import process from 'node:process';

import {
  fileURLToPath,
} from "node:url";

import {
  fork
} from "node:child_process";

const projectRoot: string = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

const monorepoRoot: string = path.dirname(path.dirname(projectRoot));

//#region remove me
async function overwriteFileIfDifferent(
  isContents: boolean,
  sourceOrContents: string,
  destination: string,
): Promise<boolean>
{
  if (isContents === false) {
    sourceOrContents = await fs.readFile(sourceOrContents, { encoding: "utf-8" });
  }

  let destStats: Awaited<ReturnType<typeof fs.stat>>;
  let destContents: string | undefined, destFileFound = true;
  try {
    destStats = await fs.stat(destination);
    destContents = await fs.readFile(destination, { encoding: "utf-8" });
  }
  catch (ex) {
    void(ex);
    destFileFound = false;
  }

  const contentsMatch = sourceOrContents === destContents;
  if (destFileFound && contentsMatch) {
    await fs.utimes(destination, destStats!.atime, destStats!.mtime)
    return false;
  }

  await fs.writeFile(destination, sourceOrContents, { encoding: "utf-8" });
  return true;
}

const TSC = path.resolve(monorepoRoot, "node_modules/typescript/bin/tsc");

async function InvokeTSC(
  pathToBaseTSConfig: string,
  excludesGlobs: string[],
): Promise<void>
{
  const configContents = {
    extends: pathToBaseTSConfig,
    exclude: excludesGlobs,
  }
  if (excludesGlobs.length === 0) {
    Reflect.deleteProperty(excludesGlobs, "excludes");
  }

  await overwriteFileIfDifferent(
    true,
    JSON.stringify(configContents, null, 2) + "\n",
    path.join(process.cwd(), "tsconfig.json"),
  );

  const child = fork(TSC, [], {
    cwd: process.cwd(),
    stdio: ["ignore", "inherit", "inherit", "ipc"]
  });

  const p = new Promise<number | null>((resolve, reject) => {
    child.on("exit", (code) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      code ? reject(code) : resolve(code);
    });
  });
  try {
    await p;
  }
  catch (code) {
    throw new Error(`Failed on "${TSC}" with code ${code}`);
  }
}

//#endregion remove me

export async function InvokeTSC_main(): Promise<void> {
  const filesToExclude: string[] = [];
  try {
    const excludesJSON = await fs.readFile(path.join(process.cwd(), "tsc-excludes.json"), { encoding: "utf-8" });
    filesToExclude.push(...JSON.parse(excludesJSON) as string[]);
  }
  catch (ex) {
    void(ex);
  }

  return InvokeTSC(path.join(path.relative(process.cwd(), projectRoot), "tsconfig.json"), [
    "./Gulpfile.ts",
    "./pre-build/**",
    "./generated/**",
    ...filesToExclude,
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
    void(ex);
    return;
  }

  await process.chdir(buildDir);
  await InvokeTSC("../../tsconfig.json", [
    "./Gulpfile.ts",
  ]);
  await process.chdir(curDir);
}
