import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import LiteralWriter from "./Literal.mjs";

export default class IndexSignatureWriter implements TypedNodeWriter
{
  public parameterKey: LiteralWriter;
  public parameterValue: TypedNodeWriter;

  constructor(key: string, value: TypedNodeWriter)
  {
    this.parameterKey = new LiteralWriter(key);
    this.parameterValue = value;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write('[');
    this.parameterKey.writerFunction(writer);
    writer.write(": ");
    this.parameterValue.writerFunction(writer);
    writer.write("]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
