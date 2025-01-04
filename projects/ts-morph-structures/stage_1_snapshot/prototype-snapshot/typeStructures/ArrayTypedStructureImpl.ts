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

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
// #endregion preamble

/**
 * `boolean[]`
 *
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 * @see `TupleTypedStructureImpl` for `[number, boolean]`
 */
export default class ArrayTypedStructureImpl
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
}
ArrayTypedStructureImpl satisfies CloneableStructure<ArrayTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Array, ArrayTypedStructureImpl);
