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
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";
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
      cloneableClassesMap.get(other.objectType.kind)!.clone(other.objectType),
      cloneableClassesMap.get(other.indexType.kind)!.clone(other.indexType)
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

cloneableClassesMap.set(TypeStructureKind.IndexedAccess, IndexedAccessTypedStructureImpl);
