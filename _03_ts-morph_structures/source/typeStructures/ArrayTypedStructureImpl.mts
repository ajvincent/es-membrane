// #region preamble
import {
  CodeBlockWriter,
} from "ts-morph";

import type {
  ArrayTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
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
      TypeStructureClassesMap.clone(other),
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
