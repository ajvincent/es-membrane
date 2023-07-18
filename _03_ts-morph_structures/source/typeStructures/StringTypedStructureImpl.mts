import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  StringTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";

export default class StringTypedStructureImpl implements StringTypedStructure
{
  static clone(
    other: StringTypedStructure
  ): StringTypedStructure
  {
    return new StringTypedStructureImpl(other.stringValue);
  }

  readonly kind: TypeStructureKind.String = TypeStructureKind.String;

  public stringValue: string;
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
