import fs, { ReadStream, WriteStream } from "node:fs";
import path from "node:path";

import {
  fixMarkdownTables
} from "#utilities/source/fixMarkdownTables.js";

import {
  asyncFork,
  monorepoRoot,
  tempDirWithCleanup
} from "@ajvincent/build-utilities";

import {
  projectDir,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import {
  PromiseAllParallel
} from "#utilities/source/PromiseTypes.js";

import {
  stageDir,
} from "../../pre-build/constants.js";

import {
  targetDir
} from "./targetDir.js";

export default
async function runAPIDocumenter(): Promise<void>
{
  const Temp = await tempDirWithCleanup();
  try {
    await asyncFork(
      path.join(monorepoRoot, "node_modules/@microsoft/api-documenter/bin/api-documenter"),
      [
        "markdown",

        "--input-folder",
        pathToModule(stageDir, "typings-snapshot/extracted"),

        "--output-folder",
        Temp.tempDir
      ],
      projectDir
    );

    let allMarkdownFiles: string[] = await fs.promises.readdir(Temp.tempDir, { recursive: true, encoding: "utf-8" });
    allMarkdownFiles = allMarkdownFiles.filter(f => f.endsWith(".md"));

    await PromiseAllParallel(
      allMarkdownFiles,
      f => fixMarkdown(Temp.tempDir, targetDir, f)
    );
    void PromiseAllParallel;
  }
  finally {
    Temp.resolve();
    await Temp.promise;
  }
}

async function fixMarkdown(
  this: void,
  sourceDir: string,
  targetDir: string,
  pathToFile: string,
): Promise<void>
{
  const pathToSource: string = path.join(sourceDir, pathToFile);
  const pathToTarget: string = path.join(targetDir, pathToFile);

  const readable: ReadStream  = fs.createReadStream( pathToSource, { encoding: "utf-8" });
  const writable: WriteStream = fs.createWriteStream(pathToTarget, { encoding: "utf-8" });
  try {
    await fixMarkdownTables(readable, writable);
  }
  catch (ex) {
    throw new Error("failed on " + pathToFile, { cause: ex });
  }
}
