import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  LiteralTypedStructure
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

export default class LiteralTypedStructureImpl implements LiteralTypedStructure
{
  static clone(
    other: LiteralTypedStructure
  ): LiteralTypedStructureImpl
  {
    return new LiteralTypedStructureImpl(other.stringValue);
  }

  readonly kind: TypeStructureKind.Literal = TypeStructureKind.Literal;

  public readonly stringValue: string;
  constructor(literal: string)
  {
    this.stringValue = literal;
    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
LiteralTypedStructureImpl satisfies CloneableStructure<LiteralTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Literal, LiteralTypedStructureImpl);
