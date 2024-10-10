//#region preamble
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import { readDirsDeep } from "@ajvincent/build-utilities";

import {
  type TSESTree,
} from '@typescript-eslint/typescript-estree';

import {
  projectDir
} from "../AsyncSpecModules.js";

import {
  PromiseAllParallel,
} from "../PromiseTypes.js";

import {
  DefaultMap
} from "../collections/DefaultMap.js";

import {
  addNodesToMap,
} from "./ast-tools/NodeToParentMap.js";

import extractClassesForProgram from "./ast-tools/extractClassesForProgram.js";

import parseSourceFile from "./ast-tools/parseSourceFile.js";
//#endregion preamble

export interface SourcesAndClasses {
  classToFile: Record<string, string>;
  programs: Record<string, TSESTree.Program>;
}

export const AllSourcesAndClasses: SourcesAndClasses = {
  classToFile: {},
  programs: {}
};

export const PathToSourcesAndClassesMap = new DefaultMap<string, Promise<SourcesAndClasses>>;

export default
async function createSourcesAndClasses(
  pathToDirectory: string,
  saveFile: boolean,
  isBuiltIns?: true
): Promise<SourcesAndClasses>
{
  const sourcesAndClasses = await PathToSourcesAndClassesMap.getDefault(
    pathToDirectory,
    () => createSourcesAndClassesInternal(pathToDirectory, isBuiltIns)
  );

  if (saveFile) {
    await fs.writeFile(
      path.join(projectDir, pathToDirectory, "class-tsestree.json"),
      JSON.stringify(sourcesAndClasses, null, 2) + "\n",
      { "encoding": "utf-8" }
    );
  }

  return sourcesAndClasses;
}

async function createSourcesAndClassesInternal(
  pathToDirectory: string,
  isBuiltIns?: true,
): Promise<SourcesAndClasses>
{
  const sourcesAndClasses: SourcesAndClasses = {
    classToFile: {},
    programs: {},
  }

  let { files } = await readDirsDeep(path.join(projectDir, pathToDirectory));
  files = files.filter(f => path.extname(f) === ".ts" || path.extname(f) === ".mts");

  await PromiseAllParallel(files, f => defineClassesForFile(f, sourcesAndClasses, isBuiltIns));

  {
    const entries = Object.entries(sourcesAndClasses.classToFile);
    entries.sort(([aClassName, aFilePath], [bClassName, bFilePath]) => aClassName.localeCompare(bClassName));
    sourcesAndClasses.classToFile = Object.fromEntries(entries);

    for (const [name, filePath] of entries) {
      AllSourcesAndClasses.classToFile[name] = filePath;
    }
  }
  for (const [name, program] of Object.entries(sourcesAndClasses.programs)) {
    AllSourcesAndClasses.programs[name] = program;
  }

  return sourcesAndClasses;
}

async function defineClassesForFile(
  pathToTypeScriptFile: string,
  sourcesAndClasses: SourcesAndClasses,
  isBuiltIns?: true
): Promise<void>
{
  const { classToFile, programs } = sourcesAndClasses;
  const localFilePath = path.relative(projectDir, pathToTypeScriptFile);
  const program: TSESTree.Program = await parseSourceFile(pathToTypeScriptFile);
  programs[localFilePath] = program;

  addNodesToMap(program);
  const classList: TSESTree.ClassDeclarationWithName[] = extractClassesForProgram(program, isBuiltIns);

  for (const tsESTree_Class of classList) {
    assert(tsESTree_Class.id, "no id?");
    classToFile[tsESTree_Class.id.name] = localFilePath;
  }
}
