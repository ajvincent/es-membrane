import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructuresBase,
  TypeStructureClassesMap,
} from "../../../snapshot/source/internal-exports.js";

/**
 * `boolean[]`
 *
 * @see `IndexedAccessTypeStructureImpl` for `Foo["index"]`
 * @see `TupleTypeStructureImpl` for `[number, boolean]`
 */
export default class ArrayTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.Array>
{
  public static clone(
    other: ArrayTypeStructureImpl
  ): ArrayTypeStructureImpl
  {
    return new ArrayTypeStructureImpl(
      TypeStructureClassesMap.clone(other.objectType)
    );
  }

  readonly kind = TypeStructureKind.Array;
  public objectType: TypeStructures;

  constructor(
    objectType: TypeStructures
  )
  {
    super();
    this.objectType = objectType;
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    this.objectType.writerFunction(writer);
    writer.write("[]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.objectType === "object")
      yield this.objectType;
  }
}
ArrayTypeStructureImpl satisfies CloneableTypeStructure<ArrayTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Array, ArrayTypeStructureImpl);
