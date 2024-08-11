import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  Deferred,
  SingletonPromise
} from "../PromiseTypes.mjs";

import {
  IdentifierOwners,
  HOLD_TYPE,
} from "./JSONClasses/IdentifierOwners.js";

import {
  SourceClassMethod,
  SourceClassReferences,
} from "./JSONClasses/SourceClass.js";

import defineWeakMap from "./builtins/defineWeakMap.js";
import defineMap from "./builtins/defineMap.js";
import defineWeakRef from "./builtins/defineWeakRef.js";

import { ParameterLocation } from "./types/ParameterLocation.js";

import type {
  ParameterReferenceRecursive
} from "./types/ParameterReferenceRecursive.js";

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

export async function hasStrongParameterReference_builtin(
  sourceClass: ReadonlyDeep<SourceClassReferences>,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  referenceRecursive: ParameterReferenceRecursive,
  {
    className,
    methodName,
    parameterName,
    externalReferences,
  }: ParameterLocation,
): Promise<boolean>
{
  const method: ReadonlyDeep<SourceClassMethod> | undefined = sourceClass.methods[methodName];
  if (!method) {
    throw new Error(`method "${methodName}" not found in source class ${className}`);
  }

  const parameter: ReadonlyDeep<IdentifierOwners> | undefined = method.variables[parameterName];
  if (!parameter)
    throw new Error(`${className}::${method} has no parameter "${parameterName}"`);

  let foundStrong = false;

  const indeterminates: Error[] = [];
  for (const reference of parameter.references) {
    if (reference.identifierSequence.length === 1 && externalReferences.includes(reference.identifierSequence[0])) {
      foundStrong = true;
      continue;
    }

    if (reference.holdType === HOLD_TYPE.Weak)
      continue;
    if (reference.holdType === HOLD_TYPE.Indeterminate) {
      indeterminates.push(new Error(
        `indeterminate reference: ${reference.identifierSequence.join("::")}@${
          reference.statementLocation?.start.line
        }`
      ));
      continue;
    }

    if (reference.identifierSequence.length > 1) {
      indeterminates.push(new Error(
        `unsupported identifier sequence: ${reference.identifierSequence.join("::")}@${
          reference.statementLocation?.start.line
        }`
      ));
      continue;
    }

    assert.notEqual(reference.identifierSequence.length, 0, "we need some identifier to look up");
    const otherIdentifier = reference.identifierSequence[0];
    if (otherIdentifier === "this")
      foundStrong = true;

    else if (otherIdentifier in method.variables) {
      foundStrong ||= await referenceRecursive(
        parameterReferenceMap,
        {
          className,
          methodName,
          parameterName: otherIdentifier,
          externalReferences
        },
      );
    }
  }

  if (indeterminates.length) {
    throw new AggregateError(
      indeterminates,
      `${className}::${method}(${parameterName}), unable to determine if reference is strong or weak`
    );
  }

  return foundStrong;
}
