import CodeBlockWriter from "code-block-writer";

import type {
  TypedNodeWriter
} from "../../types/ts-morph-typednodewriter.mjs";
import { WriterFunction } from "ts-morph";

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
