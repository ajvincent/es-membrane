import type {
  WriterFunction,
  CodeBlockWriter
} from "ts-morph";

import ChildrenWriter from "./ChildrenWriter.mjs";
import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

export default abstract class ObjectTypedWriter extends ChildrenWriter
{
  public abstract objectType: TypedNodeWriter;

  #writerFunction(writer: CodeBlockWriter): void
  {
    this.objectType.writerFunction(writer);
    super.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
