import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  StringTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

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
