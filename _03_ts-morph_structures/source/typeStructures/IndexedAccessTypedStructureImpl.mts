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

export default class IndexedAccessTypedStructureImpl
implements IndexedAccessTypedStructure
{
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
