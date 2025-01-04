// #region preamble
import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import {
  TypePrinter,
  TypePrinterSettingsBase,
} from "../base/TypePrinter.js";

import type {
  IndexedAccessTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

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

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    replaceDescendantTypeStructures(this, "objectType", filter, replacement);
    replaceDescendantTypeStructures(this, "indexType", filter, replacement);
  }

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
