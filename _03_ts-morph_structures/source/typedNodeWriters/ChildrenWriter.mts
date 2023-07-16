import CodeBlockWriter from "code-block-writer";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";
import { WriterFunction } from "ts-morph";

export default abstract class ChildrenWriter implements TypedNodeWriter
{
  public readonly children: TypedNodeWriter[] = [];
  public readonly abstract prefix: string | ChildrenWriter;
  public readonly abstract postfix: string | ChildrenWriter;
  public readonly abstract joinCharacters: string | ChildrenWriter;

  #writerFunction(writer: CodeBlockWriter): void
  {
    ChildrenWriter.feedWriter(writer, this.prefix);

    const lastChildIndex = this.children.length - 1;
    this.children.forEach((typedNodeWriter, index) => {
      typedNodeWriter.writerFunction(writer);
      if (index < lastChildIndex) {
        ChildrenWriter.feedWriter(writer, this.joinCharacters);
      }
    });

    ChildrenWriter.feedWriter(writer, this.postfix);
  }

  protected static feedWriter(writer: CodeBlockWriter, contents: string | ChildrenWriter): void {
    if (typeof contents === "string") {
      writer.write(contents);
    }
    else {
      contents.writerFunction(writer);
    }
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
