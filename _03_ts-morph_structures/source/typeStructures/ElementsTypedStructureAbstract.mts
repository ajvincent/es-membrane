import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import { TypeStructure } from "./TypeStructure.mjs";

export interface TypeStructureWithElements {
  elements: TypeStructure[];
}

export default abstract class ElementsTypedStructureAbstract
implements TypeStructureWithElements
{
  elements: TypeStructure[] = [];
  public readonly abstract prefix: string;
  public readonly abstract postfix: string;
  public readonly abstract joinCharacters: string;

  protected writeTypeStructures(
    writer: CodeBlockWriter
  ): void
  {
    ElementsTypedStructureAbstract.feedWriter(writer, this.prefix);

    const lastChildIndex = this.elements.length - 1;
    this.elements.forEach((typedStructure, index) => {
      typedStructure.writerFunction(writer);
      if (index < lastChildIndex) {
        ElementsTypedStructureAbstract.feedWriter(writer, this.joinCharacters);
      }
    });

    ElementsTypedStructureAbstract.feedWriter(writer, this.postfix);
  }

  static feedWriter(
    writer: CodeBlockWriter,
    contents: string | TypeStructure
  ): void
  {
    if (typeof contents === "string") {
      writer.write(contents);
    }
    else {
      contents.writerFunction(writer);
    }
  }

  readonly writerFunction: WriterFunction = this.writeTypeStructures.bind(this);
}
