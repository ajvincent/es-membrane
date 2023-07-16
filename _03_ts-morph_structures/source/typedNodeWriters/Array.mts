import { CodeBlockWriter, WriterFunction } from "ts-morph";
import { TypedNodeWriter } from "../types/ts-morph-typednodewriter.mjs";

export default class ArrayWriter implements TypedNodeWriter
{
  public isReadonly: boolean;
  public objectType: TypedNodeWriter;
  public length: number;

  constructor(isReadonly: boolean, objectType: TypedNodeWriter, length: number)
  {
    this.isReadonly = isReadonly;
    this.objectType = objectType;
    this.length = length;
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.isReadonly)
      writer.write("readonly ");
    this.objectType.writerFunction(writer);
    writer.write(`[${this.length > 0 ? this.length : ""}]`);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
