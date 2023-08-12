import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  IndexedAccessTypedStructure,
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";


export default class IndexedAccessTypedStructureImpl
implements IndexedAccessTypedStructure
{
  static clone(
    other: IndexedAccessTypedStructure
  ): IndexedAccessTypedStructureImpl
  {
    return new IndexedAccessTypedStructureImpl(
      TypeStructureClassesMap.get(other.objectType.kind)!.clone(other.objectType),
      TypeStructureClassesMap.get(other.indexType.kind)!.clone(other.indexType)
    )
  }

  readonly kind: TypeStructureKind.IndexedAccess = TypeStructureKind.IndexedAccess;
  objectType: TypeStructure;
  indexType: TypeStructure;

  constructor(objectType: TypeStructure, indexType: TypeStructure)
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
