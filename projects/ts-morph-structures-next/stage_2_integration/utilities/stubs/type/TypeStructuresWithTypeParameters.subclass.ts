import {
  type CodeBlockWriter,
  type WriterFunction,
} from "ts-morph";

import {
  TypeStructureKind,
  type StructureImpls,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresWithTypeParameters,
} from "../../../snapshot/source/internal-exports.js";

/** @example `never` */
export class SubclassTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Import> {
  public static clone(other: SubclassTypeStructureImpl): SubclassTypeStructureImpl {
    void other;
    throw new Error("not yet implemented");
  }

  public readonly kind: TypeStructureKind.Import = TypeStructureKind.Import;

  #writerFunction(writer: CodeBlockWriter): void {
    void writer;
    throw new Error("not yet implemented");
  }

  public readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public * [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures> {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    throw new Error("not yet implemented");
  }
}
SubclassTypeStructureImpl satisfies CloneableTypeStructure<SubclassTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Import, SubclassTypeStructureImpl);
