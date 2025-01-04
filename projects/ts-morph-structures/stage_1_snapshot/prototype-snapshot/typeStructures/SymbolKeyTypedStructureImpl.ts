// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  SymbolKeyTypedStructure,
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
    writer.write("[");
    writer.write(this.stringValue);
    writer.write("]");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
SymbolKeyTypedStructureImpl satisfies CloneableStructure<SymbolKeyTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.SymbolKey, SymbolKeyTypedStructureImpl);
