import {
  Class
} from "type-fest";

import {
  StatementStructures,
  StatementedNodeStructure
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import cloneableStatementsMap from "./cloneableStatements.mjs";

export type StructureCloner<
  SourceType extends object,
  TargetClass extends Class<SourceType, [string]>
> = TargetClass & {
  clone(other: SourceType): InstanceType<TargetClass>;
};

export function stringOrWriterFunctionArray(
  value: stringOrWriterFunction | stringOrWriterFunction[] | undefined
): stringOrWriterFunction[]
{
  if (value === undefined)
    return [];
  if (Array.isArray(value))
    return value.slice();
  return [value];
}

export function cloneArrayOrUndefined<
  SourceType extends object,
  TargetClass extends Class<SourceType, [string]>
>
(
  elements: SourceType[] | undefined,
  cloner: StructureCloner<SourceType, TargetClass>,
): InstanceType<TargetClass>[]
{
  return elements ? elements.map(element => cloner.clone(element)) : [];
}

export function statementsArray(
  value: StatementedNodeStructure
): (stringOrWriterFunction | StatementStructures)[]
{
  if (!value.statements)
    return [];

  if (Array.isArray(value.statements)) {
    return value.statements.map(cloneStatement);
  }
  return [cloneStatement(value.statements)];
}

function cloneStatement(
  value: stringOrWriterFunction | StatementStructures
): stringOrWriterFunction | StatementStructures
{
  if (typeof value === "object") {
    const cloneableClass = cloneableStatementsMap.get(value.kind);
    if (cloneableClass)
      return cloneableClass.clone(value);
  }

  return value;
}