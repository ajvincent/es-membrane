// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import type {
  LiteralTypedStructure,
  TypeStructures,
} from "./TypeStructures.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";
// #region preamble

/** Literals (boolean, number, string, void, etc.), without quotes, brackets, or anything else around them.  Leaf nodes. */
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
    writer.write(this.stringValue);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
LiteralTypedStructureImpl satisfies CloneableStructure<LiteralTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Literal, LiteralTypedStructureImpl);
