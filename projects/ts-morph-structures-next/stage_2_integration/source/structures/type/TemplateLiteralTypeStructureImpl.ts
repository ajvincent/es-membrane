import {
  CodeBlockWriter,
} from "ts-morph";

import {
  type AugmentedStructures,
} from "../../../snapshot/source/exports.js";

import {
  TypeStructureKind
} from "../../base/TypeStructureKind.js";

import {
  TypeStructureClassesMap
} from "../../base/TypeStructureClassesMap.js";

import {
  STRUCTURE_CHILDREN
} from "../../base/symbolKeys.js";

import type {
  CloneableTypeStructure,
} from "../../types/CloneableStructure.js";

import {
  WRITER_FUNCTION_KEY
} from "../WriterStructuresBase.js";

import type {
  TypeStructures
} from "./TypeStructures.js";

import TypeStructuresBase from "./TypeStructuresBase.js";

/** @example `one${"A" | "B"}two${"C" | "D"}three` */
export class TemplateLiteralTypeStructureImpl
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
  }

  protected [WRITER_FUNCTION_KEY](
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
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures>
  {
    yield* super[STRUCTURE_CHILDREN]();
    for (const span of this.spans) {
      const type = span[0];
      if (typeof type === "object")
        yield type;
    }
  }
}
TemplateLiteralTypeStructureImpl satisfies CloneableTypeStructure<TemplateLiteralTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.TemplateLiteral, TemplateLiteralTypeStructureImpl);
