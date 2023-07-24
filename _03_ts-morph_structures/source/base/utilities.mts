import {
  Class
} from "type-fest";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
import { StatementStructures, StatementedNodeStructure } from "ts-morph";

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
    return value.statements.slice();
  }
  return [value.statements];
}
