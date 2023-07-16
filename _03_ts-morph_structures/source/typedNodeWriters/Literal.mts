import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

export default class LiteralWriter implements TypedNodeWriter
{
  public literal: string;
  constructor(literal: string)
  {
    this.literal = literal;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write(this.literal);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
