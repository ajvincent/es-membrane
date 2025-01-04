import {
  Class,
  Jsonifiable,
} from "type-fest";

import {
  CodeBlockWriter,
  type CodeBlockWriterOptions,
  StatementStructures,
  StatementedNodeStructure,
  type WriterFunction,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import StatementClassesMap from "./StatementClassesMap.js";

/**
 * A class with a static clone method, for creating new instances of a target class.
 */
export type StructureCloner<
  SourceType extends object,
  TargetClass extends Class<SourceType>
> = TargetClass & {
  /**
   * Create a new instance derived from an existing value.
   * @param other - the value to clone.
   */
  clone(other: SourceType): InstanceType<TargetClass>;
};

/**
 * Coerce the value to an array of strings and writers.
 */
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

/**
 * Clone an array of objects, or return an empty array if the original value is undefined.
 * @param elements - the values to clone.
 * @param cloner - the class which will provide the new instances.
 * @returns the cloned objects.
 */
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

export function replaceWriterWithString<
  T extends Jsonifiable
>
(
  value: T | WriterFunction,
): T | string
{
  if (typeof value === "function") {
    const writer = new CodeBlockWriter();
    value(writer);
    return writer.toString();
  }

  return value;
}

/**
 * Write a start token, invoke a block, and write the end token, in that order.
 * @param writer - the code block writer.
 * @param startToken - the start token.
 * @param endToken - the end token.
 * @param newLine - true if we should call `.newLine()` after the start and before the end.
 * @param indent - true if we should indent the block statements.
 * @param block - the callback to execute for the block statements.
 *
 * @see {@link https://github.com/dsherret/code-block-writer/issues/44}
 */
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
