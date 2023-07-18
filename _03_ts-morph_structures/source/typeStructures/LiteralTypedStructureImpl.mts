import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  LiteralTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

export default class LiteralTypedStructureImpl implements LiteralTypedStructure
{
  readonly kind: TypeStructureKind.Literal = TypeStructureKind.Literal;

  public stringValue: string;
  constructor(literal: string)
  {
    this.stringValue = literal;
    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
