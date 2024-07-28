import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  SourceClassReferences,
} from "./SourceClass.js";

import defineWeakMap from "./builtins/defineWeakMap.js";
import defineMap from "./builtins/defineMap.js";
import defineWeakRef from "./builtins/defineWeakRef.js";

export default
async function saveBuiltinClassReferences(): Promise<void>
{
  const sourceClassMap = new Map<string, SourceClassReferences>;
  defineWeakMap(sourceClassMap);
  defineMap(sourceClassMap);
  defineWeakRef(sourceClassMap);

  const sourceClassRecords: Record<string, SourceClassReferences> = Object.fromEntries(sourceClassMap);

  let saveLocation = path.normalize(path.resolve(fileURLToPath(import.meta.url), "../builtin-classes.json"));
  await fs.writeFile(
    saveLocation,
    JSON.stringify(sourceClassRecords, null, 2),
    {
      encoding: "utf-8"
    }
  );
}

export const builtinLocation = "(built-in)";
