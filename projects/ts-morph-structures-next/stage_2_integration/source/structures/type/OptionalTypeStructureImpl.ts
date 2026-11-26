import type {
  CodeBlockWriter,
} from "ts-morph";

import type {
  AugmentedStructures,
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

/** @example `[boolean?]` */
export class OptionalTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Optional> {
  public static clone(other: OptionalTypeStructureImpl): OptionalTypeStructureImpl {
    return new OptionalTypeStructureImpl(TypeStructureClassesMap.clone(other.objectType));
  }

  public readonly kind: TypeStructureKind.Optional = TypeStructureKind.Optional;
  public objectType: TypeStructures;

  constructor(
    objectType: TypeStructures
  )
  {
    super();
    this.objectType = objectType;
  }

  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void
  {
    this.objectType.writerFunction(writer);
    writer.write("?");
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures>
  {
    yield* super[STRUCTURE_CHILDREN]();
    yield this.objectType;
  }
}
OptionalTypeStructureImpl satisfies CloneableTypeStructure<OptionalTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Optional, OptionalTypeStructureImpl);
