import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  PrefixOperatorsTypedStructure,
  PrefixUnaryOperator,
  TypeStructure,
} from "./TypeStructure.mjs";

import {
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";

export default class PrefixOperatorsTypedStructureImpl
implements PrefixOperatorsTypedStructure
{
  public static clone(
    other: PrefixOperatorsTypedStructure
  ): PrefixOperatorsTypedStructureImpl
  {
    return new PrefixOperatorsTypedStructureImpl(
      other.operators,
      cloneableClassesMap.get(other.childType.kind)!.clone(other.childType)
    );
  }

  readonly kind: TypeStructureKind.PrefixOperators = TypeStructureKind.PrefixOperators;

  operators: PrefixUnaryOperator[];
  childType: TypeStructure;

  constructor(
    operators: readonly PrefixUnaryOperator[],
    childType: TypeStructure
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

cloneableClassesMap.set(TypeStructureKind.PrefixOperators, PrefixOperatorsTypedStructureImpl);