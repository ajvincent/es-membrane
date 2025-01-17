import {
  fork
} from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  monorepoRoot,
} from "./constants.js";

import {
  overwriteFileIfDifferent,
} from "./overwriteFileIfDifferent.js";

const TSC = path.resolve(monorepoRoot, "node_modules/typescript/bin/tsc");

export async function InvokeTSC(
  pathToTSConfig: string,
  excludesGlobs: string[],
): Promise<void>
{
  const configContents = {
    extends: pathToTSConfig,
    exclude: excludesGlobs,
  }
  if (excludesGlobs.length === 0) {
    Reflect.deleteProperty(excludesGlobs, "excludes");
  }

  const pathToBaseTSConfig = path.join(process.cwd(), "tsconfig.json");
  if (pathToTSConfig !== pathToBaseTSConfig) {
    await overwriteFileIfDifferent(
      true,
      JSON.stringify(configContents, null, 2) + "\n",
      path.join(process.cwd(), "tsconfig.json"),
    );
  }

  const child = fork(TSC, [], {
    cwd: process.cwd(),
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

export async function InvokeTSC_excludeDirs(
  projectRoot: string
): Promise<void>
{
  const filesToExclude: string[] = [];
  try {
    const excludesJSON = await fs.readFile(path.join(process.cwd(), "tsc-excludes.json"), { encoding: "utf-8" });
    filesToExclude.push(...JSON.parse(excludesJSON) as string[]);
  }
  catch (ex) {
    void(ex);
  }

  return InvokeTSC(path.join(path.relative(process.cwd(), projectRoot), "tsconfig.json"), filesToExclude);
}
