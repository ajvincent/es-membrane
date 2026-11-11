import type { CodeBlockWriter } from "ts-morph";

import {
  type AugmentedStructures,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_CHILDREN,
  TypeStructuresBase,
  TypeStructureClassesMap,
  WRITER_FUNCTION_KEY,
} from "../../internal-exports.js";

/** @example `[boolean?]` */
export class OptionalTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Optional> {
  public static clone(
    other: OptionalTypeStructureImpl,
  ): OptionalTypeStructureImpl {
    return new OptionalTypeStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
    );
  }

  public readonly kind: TypeStructureKind.Optional = TypeStructureKind.Optional;
  public objectType: TypeStructures;

  constructor(objectType: TypeStructures) {
    super();
    this.objectType = objectType;
  }

  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    this.objectType.writerFunction(writer);
    writer.write("?");
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
    yield this.objectType;
  }
}
OptionalTypeStructureImpl satisfies CloneableTypeStructure<OptionalTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.Optional,
  OptionalTypeStructureImpl,
);
