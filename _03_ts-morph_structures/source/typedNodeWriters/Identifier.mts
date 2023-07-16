import CodeBlockWriter from "code-block-writer";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import { WriterFunction } from "ts-morph";

export default class IdentifierWriter implements TypedNodeWriter
{
  public identifier: string;
  constructor(id: string) {
    this.identifier = id;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write(this.identifier);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
