import CodeBlockWriter from "code-block-writer";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import { WriterFunction } from "ts-morph";

export default class SymbolKeyWriter implements TypedNodeWriter
{
  public literal: string;
  constructor(literal: string)
  {
    this.literal = literal;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write("[");
    writer.write(this.literal);
    writer.write("]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
