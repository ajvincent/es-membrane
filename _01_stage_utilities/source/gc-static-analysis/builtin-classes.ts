import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  SingletonPromise
} from "../PromiseTypes.mjs";

import {
  SourceClassReferences,
} from "./JSONClasses/SourceClass.js";

import defineWeakMap from "./builtins/defineWeakMap.js";
import defineMap from "./builtins/defineMap.js";
import defineWeakRef from "./builtins/defineWeakRef.js";

const mapPromise = new SingletonPromise(
  (): Promise<ReadonlyMap<string, SourceClassReferences>> => {
    const sourceClassMap = new Map<string, SourceClassReferences>;
    defineWeakMap(sourceClassMap);
    defineMap(sourceClassMap);
    defineWeakRef(sourceClassMap);
    return Promise.resolve(sourceClassMap);
  }
);

export default
async function getBuiltinClassReferences(
  writeFile: boolean
): Promise<ReadonlyDeep<Record<string, SourceClassReferences>>>
{
  const sourceClassMap: ReadonlyMap<string, SourceClassReferences> = await mapPromise.run();
  const sourceClassRecords: Record<string, SourceClassReferences> = Object.fromEntries(sourceClassMap);

  if (writeFile) {
    let saveLocation: string = path.normalize(path.resolve(
      fileURLToPath(import.meta.url), "../builtin-classes.json"
    ));

    await fs.writeFile(
      saveLocation,
      JSON.stringify(sourceClassRecords, null, 2) + "\n",
      {
        encoding: "utf-8"
      }
    );
  }

  return sourceClassRecords;
}
