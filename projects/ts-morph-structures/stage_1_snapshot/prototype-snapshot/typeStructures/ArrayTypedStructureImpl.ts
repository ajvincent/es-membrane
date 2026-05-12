// #region preamble
import {
  CodeBlockWriter,
} from "ts-morph";

import type {
  ArrayTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.js";

import TypeStructuresBase from "../base/TypeStructuresBase.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";

// #endregion preamble

/**
 * `boolean[]`
 *
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 * @see `TupleTypedStructureImpl` for `[number, boolean]`
 */
export default class ArrayTypedStructureImpl
extends TypeStructuresBase
implements ArrayTypedStructure
{
  static clone(
    other: ArrayTypedStructure
  ): ArrayTypedStructureImpl
  {
    return new ArrayTypedStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
    );
  }

  objectType: TypeStructures;
  readonly kind: TypeStructureKind.Array = TypeStructureKind.Array;

  constructor(
    objectType: TypeStructures,
  )
  {
    super();
    this.objectType = objectType;

    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    replaceDescendantTypeStructures(this, "objectType", filter, replacement);
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    this.objectType.writerFunction(writer);
    writer.write(`[]`);
  }

  writerFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.objectType === "object")
      yield this.objectType;
  }
}
ArrayTypedStructureImpl satisfies CloneableStructure<ArrayTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Array, ArrayTypedStructureImpl);
