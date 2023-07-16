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
  public useQuote: boolean;
  constructor(contents: string, useQuote: boolean)
  {
    this.contents = contents;
    this.useQuote = useQuote;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.useQuote)
      writer.quote(this.contents);
    else
      writer.write(this.contents);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
