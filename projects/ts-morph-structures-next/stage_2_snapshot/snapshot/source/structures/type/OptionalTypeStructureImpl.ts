import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import {
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructuresBase,
  TypeStructureClassesMap,
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
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void {
    this.objectType.writerFunction(writer);
    writer.write("?");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield this.objectType;
  }
}
OptionalTypeStructureImpl satisfies CloneableTypeStructure<OptionalTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.Optional,
  OptionalTypeStructureImpl,
);
