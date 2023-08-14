// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  ParenthesesTypedStructure,
  TypeStructures,
} from "./TypeStructures.mjs";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/** Wrap the child type in parentheses. */
export default class ParenthesesTypedStructureImpl
implements ParenthesesTypedStructure
{
  public static clone(
    other: ParenthesesTypedStructure
  ): ParenthesesTypedStructureImpl
  {
    return new ParenthesesTypedStructureImpl(
      TypeStructureClassesMap.clone(other.childType)
    );
  }

  readonly kind: TypeStructureKind.Parentheses = TypeStructureKind.Parentheses;
  childType: TypeStructures;

  constructor(childType: TypeStructures)
  {
    this.childType = childType;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.write("(");
    this.childType.writerFunction(writer);
    writer.write(")");
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
ParenthesesTypedStructureImpl satisfies CloneableStructure<ParenthesesTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Parentheses, ParenthesesTypedStructureImpl);
