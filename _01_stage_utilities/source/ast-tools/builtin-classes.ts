import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  HOLD_TYPE,
  IdentifierOwners,
  IdentifierReference,
} from "./IdentifierOwners.js";

import {
  SourceClassMethod,
  SourceClassProperty,
  SourceClassReferences,
} from "./SourceClass.js";

export default
async function saveBuiltinClassReferences(): Promise<void>
{
  const sourceClassMap = new Map<string, SourceClassReferences>;
  defineWeakMap(sourceClassMap);

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

const builtinLocation = "(built-in)";

function defineWeakMap(
  map: Map<string, SourceClassReferences>
): void
{
  const sourceClass = new SourceClassReferences;
  sourceClass.fileLocation = builtinLocation;
  map.set("WeakMap", sourceClass);

  // delete
  {
    const deleteOwners = new SourceClassMethod;
    sourceClass.methods["delete"] = deleteOwners;

    const keyParam = new IdentifierOwners;
    deleteOwners.parameters.push(keyParam);

    keyParam.identifier = "key";
    keyParam.argIndex = 0;
  }

  // get
  {
    const getOwners = new SourceClassMethod;
    sourceClass.methods["get"] = getOwners;

    const keyParam = new IdentifierOwners;
    getOwners.parameters.push(keyParam);

    keyParam.identifier = "key";
    keyParam.argIndex = 0;
  }

  // has
  {
    const hasOwners = new SourceClassMethod;
    sourceClass.methods["has"] = hasOwners;

    const keyParam = new IdentifierOwners;
    hasOwners.parameters.push(keyParam);

    keyParam.identifier = "key";
    keyParam.argIndex = 0;
  }

  // set
  {
    const setOwners = new SourceClassMethod;
    sourceClass.methods["set"] = setOwners;

    const keyParam = new IdentifierOwners;
    setOwners.parameters.push(keyParam);
    keyParam.identifier = "key";
    keyParam.argIndex = 0;

    const valueParam = new IdentifierOwners;
    setOwners.parameters.push(valueParam);
    valueParam.identifier = "value";
    valueParam.argIndex = 1;

    // this holds key weakly
    {
      const ref = new IdentifierReference;
      ref.holdType = HOLD_TYPE.Weak;
      ref.identifierSequence.push(IdentifierOwners.ThisIdentifier);
      keyParam.references.push(ref);
    }

    // key holds value strongly
    {
      const ref = new IdentifierReference;
      ref.holdType = HOLD_TYPE.Strong;
      ref.identifierSequence.push(keyParam.identifier);
      valueParam.references.push(ref);
    }
  }
}
