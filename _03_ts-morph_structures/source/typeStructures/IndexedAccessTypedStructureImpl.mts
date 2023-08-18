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
import { TypePrinter, TypePrinterSettingsBase } from "../base/TypePrinter.mjs";
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
  readonly printSettings = new TypePrinterSettingsBase;

  #writerFunction(writer: CodeBlockWriter): void
  {
    TypePrinter(writer, {
      ...this.printSettings,
      objectType: this.objectType,
      startToken: "[",
      joinChildrenToken: "",
      childTypes: [this.indexType],
      endToken: "]",
    });
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
IndexedAccessTypedStructureImpl satisfies CloneableStructure<IndexedAccessTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.IndexedAccess, IndexedAccessTypedStructureImpl);
