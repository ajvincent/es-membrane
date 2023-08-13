import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  PrefixOperatorsTypedStructure,
  PrefixUnaryOperator,
  TypeStructures,
} from "./TypeStructures.mjs";

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

export default class PrefixOperatorsTypedStructureImpl
implements PrefixOperatorsTypedStructure
{
  public static clone(
    other: PrefixOperatorsTypedStructure
  ): PrefixOperatorsTypedStructureImpl
  {
    return new PrefixOperatorsTypedStructureImpl(
      other.operators,
      TypeStructureClassesMap.get(other.childType.kind)!.clone(other.childType)
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
      writer.write(this.operators.map(op => op + " ").join(""));
    }
    this.childType.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);
}
PrefixOperatorsTypedStructureImpl satisfies CloneableStructure<PrefixOperatorsTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.PrefixOperators, PrefixOperatorsTypedStructureImpl);
