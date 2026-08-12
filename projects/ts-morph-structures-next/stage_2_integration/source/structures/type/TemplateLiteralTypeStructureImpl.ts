import {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import {
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresBase,
} from "../../../snapshot/source/internal-exports.js";

/** `one${"A" | "B"}two${"C" | "D"}three` */
export default
class TemplateLiteralTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.TemplateLiteral>
{
  static clone(
    other: TemplateLiteralTypeStructureImpl
  ): TemplateLiteralTypeStructureImpl
  {
    const spans = other.spans.map<[TypeStructures, string]>(
      span => [TypeStructureClassesMap.clone(span[0]), span[1]]
    );
    return new TemplateLiteralTypeStructureImpl(other.head, spans);
  }

  readonly kind = TypeStructureKind.TemplateLiteral;
  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  head: string;
  spans: [TypeStructures, string][];

  constructor(
    head: string,
    spans: [TypeStructures, string][]
  )
  {
    super();
    this.head = head;
    this.spans = spans;
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    TypeStructuresBase.pairedWrite(writer, "`", "`", false, false, () => {
      writer.write(this.head);
      this.spans.forEach(span => {
        TypeStructuresBase.pairedWrite(
          writer, "${", "}", false, false, () => span[0].writerFunction(writer)
        );

        writer.write(span[1]);
      });
    });
  }

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    for (const span of this.spans) {
      const type = span[0];
      if (typeof type === "object")
        yield type;
    }
  }
}
TemplateLiteralTypeStructureImpl satisfies CloneableTypeStructure<TemplateLiteralTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.TemplateLiteral, TemplateLiteralTypeStructureImpl);
