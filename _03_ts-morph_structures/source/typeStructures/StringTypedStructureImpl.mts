// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  StringTypedStructure
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion

/** Strings, encased in double quotes.  Leaf nodes. */
export default class StringTypedStructureImpl implements StringTypedStructure
{
  static clone(
    other: StringTypedStructure
  ): StringTypedStructure
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

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.quote(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
StringTypedStructureImpl satisfies CloneableStructure<StringTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.String, StringTypedStructureImpl);
