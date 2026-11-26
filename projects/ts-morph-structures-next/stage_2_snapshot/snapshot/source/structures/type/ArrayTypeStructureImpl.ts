import type { CodeBlockWriter } from "ts-morph";

import type { AugmentedStructures } from "../../exports.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import { STRUCTURE_CHILDREN } from "../../base/symbolKeys.js";

import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import type { TypeStructures } from "./TypeStructures.js";

import TypeStructuresBase from "./TypeStructuresBase.js";
/**
 * `boolean[]`
 *
 * @see `IndexedAccessTypeStructureImpl` for `Foo["index"]`
 * @see `TupleTypeStructureImpl` for `[number, boolean]`
 */
export class ArrayTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Array> {
  public static clone(other: ArrayTypeStructureImpl): ArrayTypeStructureImpl {
    return new ArrayTypeStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
    );
  }

  readonly kind = TypeStructureKind.Array;
  public objectType: TypeStructures;

  constructor(objectType: TypeStructures) {
    super();
    this.objectType = objectType;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    this.objectType.writerFunction(writer);
    writer.write("[]");
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
    yield this.objectType;
  }
}
ArrayTypeStructureImpl satisfies CloneableTypeStructure<ArrayTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Array, ArrayTypeStructureImpl);
