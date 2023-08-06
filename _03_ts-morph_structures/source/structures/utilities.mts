import {
  Class
} from "type-fest";

import {
  StatementStructures,
  StatementedNodeStructure,
  CodeBlockWriter,
  type CodeBlockWriterOptions
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import StatementClassesMap from "./StatementClassesMap.mjs";

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
  TargetClass extends Class<SourceType>
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
    const cloneableClass = StatementClassesMap.get(value.kind);
    if (cloneableClass)
      return cloneableClass.clone(value);
  }

  return value;
}

const writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
  indentNumberOfSpaces: 2
});

export function createCodeBlockWriter(): CodeBlockWriter
{
  return new CodeBlockWriter(writerOptions);
}

export function pairedWrite(
  this: void,
  writer: CodeBlockWriter,
  startToken: string,
  endToken: string,
  newLine: boolean,
  indent: boolean,
  block: () => void
) : void
{
  writer.write(startToken);
  if (newLine)
    writer.newLine();
  if (indent)
    writer.indent(block);
  else
    block();
  if (newLine)
    writer.newLine();
  writer.write(endToken);
}
