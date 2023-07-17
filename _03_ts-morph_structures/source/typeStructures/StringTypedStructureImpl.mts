import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  StringTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

export default class StringTypedStructureImpl implements StringTypedStructure
{
  readonly kind: TypeStructureKind.String = TypeStructureKind.String;

  public stringValue: string;
  constructor(literal: string)
  {
    this.stringValue = literal;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.quote(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
