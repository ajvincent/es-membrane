import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  TypeStructureKind,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresBase,
  WRITER_FUNCTION_KEY,
} from "../../../snapshot/source/internal-exports.js";

/** @example `Foo.bar.baz...` */
export class QualifiedNameTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.QualifiedName>
{
  static clone(
    other: QualifiedNameTypeStructureImpl
  ): QualifiedNameTypeStructureImpl
  {
    return new QualifiedNameTypeStructureImpl(
      other.childTypes.slice()
    );
  }

  readonly kind = TypeStructureKind.QualifiedName;
  public childTypes: string[];

  constructor(
    childTypes: string[] = []
  )
  {
    super();
    this.childTypes = childTypes;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void
  {
    writer.write(this.childTypes.join("."));
  }
}
QualifiedNameTypeStructureImpl satisfies CloneableTypeStructure<QualifiedNameTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.QualifiedName, QualifiedNameTypeStructureImpl);
