import fs from "node:fs/promises";
import path from "node:path";

import {
  projectDir,
} from "../AsyncSpecModules.mjs";

import {
  PromiseAllParallel,
} from "../PromiseTypes.mjs";

import {
  SourceClassReferences
} from "./JSONClasses/SourceClass.js";

import {
  ReviverClassesMap,
} from "./JSONClasses/ReviverClassesMap.js";

import loadReviverClasses from "./JSONClasses/loadReviverClasses.js";

function reviveReferences(
  this: void,
  key: string,
  value: any
): any
{
  if ((typeof value === "object") && (typeof value.jsonType === "string")) {
    const ReviverClass = ReviverClassesMap.get(value.jsonType);
    if (ReviverClass) {
      return new ReviverClass().adoptFromJSON(value);
    }
  }

  return value;
}

const SourceClassMap_Internal = new Map<string, SourceClassReferences>;

export async function loadSourceReferences_inner(
  pathToJSONFile: string
): Promise<void>
{
  pathToJSONFile = path.resolve(projectDir, pathToJSONFile);
  const contents = await fs.readFile(pathToJSONFile, { "encoding": "utf-8" });

  await loadReviverClasses.run();

  const references: Record<string, SourceClassReferences> = JSON.parse(contents, reviveReferences);
  for (const [sourceClassName, sourceClass] of Object.entries(references)) {
    SourceClassMap_Internal.set(sourceClassName, sourceClass);
  }
}

const AwaitedFileMap = new Map<string, Promise<void>>;
function loadSourceReferences(
  pathToJSONFile: string
): Promise<void>
{
  let promise: Promise<void> | undefined = AwaitedFileMap.get(pathToJSONFile);
  if (!promise) {
    promise = loadSourceReferences_inner(pathToJSONFile);
    AwaitedFileMap.set(pathToJSONFile, promise);
  }

  return promise;
}

export async function loadSourceDirReferences(
  sourceDirs: string[]
): Promise<void>
{
  await Promise.all([
    loadSourceReferences("_01_stage_utilities/source/gc-static-analysis/builtin-classes.json"),
    PromiseAllParallel<string, void>(sourceDirs, sourceDir => {
      return loadSourceReferences(path.join(sourceDir, "class-references.json"));
    })
  ]);
}

export const SourceClassMap: ReadonlyMap<string, SourceClassReferences> = SourceClassMap_Internal;
