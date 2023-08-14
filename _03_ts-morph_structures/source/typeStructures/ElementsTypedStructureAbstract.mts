import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  TypeStructures
} from "./TypeStructures.mjs";

export interface TypeStructureWithElements {
  elements: TypeStructures[];
}

/** prefix + elements[0] + joinCharacters + elements[1] + ... + elements[n] + postfix */
export default abstract class ElementsTypedStructureAbstract
implements TypeStructureWithElements
{
  elements: TypeStructures[] = [];
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
    contents: string | TypeStructures
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
