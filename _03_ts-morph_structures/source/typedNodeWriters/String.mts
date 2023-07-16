import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

export default class StringWriter implements TypedNodeWriter
{
  public contents: string;
  constructor(contents: string)
  {
    this.contents = contents;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.quote(this.contents);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
