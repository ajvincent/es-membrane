import type {
  CodeBlockWriter,
} from "ts-morph";

import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../../base/TypeStructureKind.js";

import type {
  CloneableTypeStructure,
} from "../../types/CloneableStructure.js";

import {
  WRITER_FUNCTION_KEY
} from "../WriterStructuresBase.js";
import TypeStructuresBase from "./TypeStructuresBase.js";

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
