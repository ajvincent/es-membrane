import type {
  WriterFunction,
} from "ts-morph";

import type {
  WriterTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";

export default class WriterTypedStructureImpl
implements WriterTypedStructure
{
  static clone(
    other: WriterTypedStructure
  ): WriterTypedStructureImpl
  {
    return new WriterTypedStructureImpl(other.writerFunction);
  }

  readonly kind: TypeStructureKind.Writer = TypeStructureKind.Writer;
  readonly writerFunction: WriterFunction;

  constructor(writer: WriterFunction) {
    this.writerFunction = writer;
    registerCallbackForTypeStructure(this);
  }
}

cloneableClassesMap.set(TypeStructureKind.Writer, WriterTypedStructureImpl);
