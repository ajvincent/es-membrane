// #region preamble
import type {
  WriterFunction,
} from "ts-morph";

import type {
  TypeStructures,
  WriterTypedStructure
} from "./TypeStructures.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";
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

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    void(filter);
    void(replacement);
  }
}

TypeStructureClassesMap.set(TypeStructureKind.Writer, WriterTypedStructureImpl);
