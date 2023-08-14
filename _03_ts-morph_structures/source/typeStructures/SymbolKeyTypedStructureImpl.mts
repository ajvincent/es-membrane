// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  SymbolKeyTypedStructure
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
// #endregion preamble

/** Symbol keys (`[MySymbol]`), enclosed in square brackets. Leaf nodes.*/
export default class SymbolKeyTypedStructureImpl implements SymbolKeyTypedStructure
{
  static clone(
    other: SymbolKeyTypedStructure
  ): SymbolKeyTypedStructureImpl
  {
    return new SymbolKeyTypedStructureImpl(other.stringValue);
  }

  readonly kind: TypeStructureKind.SymbolKey = TypeStructureKind.SymbolKey;

  public readonly stringValue: string;
  constructor(literal: string)
  {
    this.stringValue = literal;
    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write("[");
    writer.write(this.stringValue);
    writer.write("]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
SymbolKeyTypedStructureImpl satisfies CloneableStructure<SymbolKeyTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.SymbolKey, SymbolKeyTypedStructureImpl);
