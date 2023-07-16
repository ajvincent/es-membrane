import {
  Class
} from "type-fest";

import type {
  NamedNodeStructure
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

export type StructureCloner<
  SourceType extends NamedNodeStructure,
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
  SourceType extends NamedNodeStructure,
  TargetClass extends Class<SourceType, [string]>
>
(
  elements: SourceType[] | undefined,
  cloner: StructureCloner<SourceType, TargetClass>,
): InstanceType<TargetClass>[]
{
  return elements ? elements.map(element => cloner.clone(element)) : [];
}
