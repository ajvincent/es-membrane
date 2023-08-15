// #region preamble
import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  IndexedAccessTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/**
 * `Foo["index"]`
 *
 * @see `ArrayTypedStructureImpl` for `boolean[]`
 * @see `MappedTypeTypedStructureImpl` for `{ [key in keyof Foo]: boolean}`
 * @see `ObjectLiteralTypedStructureImpl` for `{ [key: string]: boolean }`
 */
export default class IndexedAccessTypedStructureImpl
implements IndexedAccessTypedStructure
{
  static clone(
    other: IndexedAccessTypedStructure
  ): IndexedAccessTypedStructureImpl
  {
    return new IndexedAccessTypedStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
      TypeStructureClassesMap.clone(other.indexType)
    )
  }

  readonly kind: TypeStructureKind.IndexedAccess = TypeStructureKind.IndexedAccess;
  objectType: TypeStructures;
  indexType: TypeStructures;

  constructor(objectType: TypeStructures, indexType: TypeStructures)
  {
    this.objectType = objectType;
    this.indexType = indexType;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    this.objectType.writerFunction(writer);
    writer.write("[");
    this.indexType.writerFunction(writer);
    writer.write("]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
IndexedAccessTypedStructureImpl satisfies CloneableStructure<IndexedAccessTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.IndexedAccess, IndexedAccessTypedStructureImpl);
