// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  StringTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
// #endregion

/** Strings, encased in double quotes.  Leaf nodes. */
export default class StringTypedStructureImpl implements StringTypedStructure
{
  static clone(
    other: StringTypedStructure
  ): StringTypedStructureImpl
  {
    return new StringTypedStructureImpl(other.stringValue);
  }

  readonly kind: TypeStructureKind.String = TypeStructureKind.String;

  public readonly stringValue: string;
  constructor(literal: string)
  {
    this.stringValue = literal;
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

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.quote(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
StringTypedStructureImpl satisfies CloneableStructure<StringTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.String, StringTypedStructureImpl);
