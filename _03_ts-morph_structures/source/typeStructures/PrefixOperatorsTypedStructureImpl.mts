// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  PrefixOperatorsTypedStructure,
  PrefixUnaryOperator,
  TypeStructures,
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

/** (`keyof` | `typeof` | `readonly` | `unique`)[] (child type) */
export default class PrefixOperatorsTypedStructureImpl
implements PrefixOperatorsTypedStructure
{
  public static clone(
    other: PrefixOperatorsTypedStructure
  ): PrefixOperatorsTypedStructureImpl
  {
    return new PrefixOperatorsTypedStructureImpl(
      other.operators,
      TypeStructureClassesMap.clone(other.childType)
    );
  }

  readonly kind: TypeStructureKind.PrefixOperators = TypeStructureKind.PrefixOperators;

  operators: PrefixUnaryOperator[];
  childType: TypeStructures;

  constructor(
    operators: readonly PrefixUnaryOperator[],
    childType: TypeStructures
  )
  {
    this.operators = operators.slice();
    this.childType = childType;

    registerCallbackForTypeStructure(this);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.operators.length) {
      writer.write(this.operators.map(op => op === "..." ? op : op + " ").join(""));
    }
    this.childType.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
PrefixOperatorsTypedStructureImpl satisfies CloneableStructure<PrefixOperatorsTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.PrefixOperators, PrefixOperatorsTypedStructureImpl);
