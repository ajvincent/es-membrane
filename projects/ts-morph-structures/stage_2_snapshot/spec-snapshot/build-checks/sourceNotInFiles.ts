import fs from "fs/promises";

import {
  ModuleSourceDirectory,
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import { DefaultMap } from "#utilities/source/DefaultMap.js";
import readDirsDeep from "#utilities/source/readDirsDeep.js";
import { PromiseAllParallel } from "#utilities/source/PromiseTypes.js";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../.."
};

const filesMap = new DefaultMap<string, Promise<string>>;

async function needleFoundInFiles(
  relativePathToDir: string,
  firstPart: string,
  secondPart: string
): Promise<string[]>
{
  const needle = firstPart + secondPart;
  const topDir = pathToModule(stageDir, relativePathToDir);

  let { files } = await readDirsDeep(topDir);
  files = files.filter(f => f.endsWith(".ts"));
  const results = await PromiseAllParallel(files, f => sourceInFile(f, needle));
  return results.filter(Boolean);
}

async function sourceInFile(
  pathToFile: string,
  needle: string
): Promise<string> {
  const contents = await filesMap.getDefault(pathToFile, async () => {
    return fs.readFile(pathToFile, { "encoding": "utf-8"});
  });

  if (contents.includes(needle))
    return pathToFile;
  return "";
}

it("stage_one doesn't appear in stage two", async () => {
  await expectAsync(needleFoundInFiles(".", "#stage_", "one")).toBeResolvedTo([]);
});

it("stage_two/snapshot doesn't appear in stage two", async () => {
  await expectAsync(needleFoundInFiles("snapshot", "#stage_", "two")).toBeResolvedTo([]);
});
