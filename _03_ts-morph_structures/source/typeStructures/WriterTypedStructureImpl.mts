// #region preamble
import type {
  WriterFunction,
} from "ts-morph";

import type {
  WriterTypedStructure
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";
// #endregion preamble

/** Wrappers for writer functions from external sources.  Leaf nodes. */
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

TypeStructureClassesMap.set(TypeStructureKind.Writer, WriterTypedStructureImpl);
