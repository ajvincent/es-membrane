import fs from "node:fs/promises";
import path from "node:path";
import process from 'node:process';

import {
  fileURLToPath,
} from "node:url";

import {
  InvokeTSC,
} from "@ajvincent/build-utilities";

const projectRoot: string = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

export async function InvokeTSC_excludeDirs(): Promise<void> {
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
