import path from "node:path";
import fs from "node:fs/promises";

import {
  projectDir,
} from "../AsyncSpecModules.mjs";

import {
  SourceClassReferences
} from "./SourceClass.js";

import {
  ReviverClassesMap,
} from "./ReviverClassesMap.js";

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

const SourceClassMap = new Map<string, SourceClassReferences>;

export async function loadSourceReferences(
  pathToJSONFile: string
): Promise<ReadonlyMap<string, SourceClassReferences>>
{
  pathToJSONFile = path.resolve(projectDir, pathToJSONFile);
  const contents = await fs.readFile(pathToJSONFile, { "encoding": "utf-8"});
  const references: Record<string, SourceClassReferences> = JSON.parse(contents, reviveReferences);
  for (const [sourceClassName, sourceClass] of Object.entries(references)) {
    SourceClassMap.set(sourceClassName, sourceClass);
  }

  return SourceClassMap;
}

export default
async function loadSourceDirReferences(
  sourceDir: string
): Promise<ReadonlyMap<string, SourceClassReferences>>
{
  return loadSourceReferences(path.join(sourceDir, "class-references.json"));
}
