import type {
  WriterFunction,
  CodeBlockWriter
} from "ts-morph";

import ChildrenWriter from "./ChildrenWriter.mjs";
import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

export default abstract class ObjectPrefixedWriter
extends ChildrenWriter
implements TypedNodeWriter
{
  public abstract objectType: TypedNodeWriter;

  #writerFunction(writer: CodeBlockWriter): void
  {
    this.objectType.writerFunction(writer);
    this.writeChildren(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
