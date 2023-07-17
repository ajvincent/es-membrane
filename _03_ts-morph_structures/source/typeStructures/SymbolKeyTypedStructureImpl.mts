import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  SymbolKeyTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

export default class SymbolKeyTypedStructureImpl implements SymbolKeyTypedStructure
{
  readonly kind: TypeStructureKind.SymbolKey = TypeStructureKind.SymbolKey;

  public stringValue: string;
  constructor(literal: string)
  {
    this.stringValue = literal;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write("[");
    writer.write(this.stringValue);
    writer.write("]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
