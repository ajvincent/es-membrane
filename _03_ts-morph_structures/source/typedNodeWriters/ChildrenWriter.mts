import type {
  WriterFunction,
  CodeBlockWriter,
} from "ts-morph";
import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

export default abstract class ChildrenWriter implements TypedNodeWriter
{
  public readonly children: TypedNodeWriter[] = [];
  public readonly abstract prefix: string | TypedNodeWriter;
  public readonly abstract postfix: string | TypedNodeWriter;
  public readonly abstract joinCharacters: string | TypedNodeWriter;

  protected writeChildren(writer: CodeBlockWriter): void {
    ChildrenWriter.#feedWriter(writer, this.prefix);

    const lastChildIndex = this.children.length - 1;
    this.children.forEach((typedNodeWriter, index) => {
      typedNodeWriter.writerFunction(writer);
      if (index < lastChildIndex) {
        ChildrenWriter.#feedWriter(writer, this.joinCharacters);
      }
    });

    ChildrenWriter.#feedWriter(writer, this.postfix);
  }

  static #feedWriter(
    writer: CodeBlockWriter,
    contents: string | TypedNodeWriter
  ): void
  {
    if (typeof contents === "string") {
      writer.write(contents);
    }
    else {
      contents.writerFunction(writer);
    }
  }

  readonly writerFunction: WriterFunction = this.writeChildren.bind(this);
}
