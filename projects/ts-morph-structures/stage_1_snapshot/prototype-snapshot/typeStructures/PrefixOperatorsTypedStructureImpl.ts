// #region preamble
import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  PrefixOperatorsTypedStructure,
  PrefixUnaryOperator,
  TypeStructures,
} from "./TypeStructures.js";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import TypeStructuresBase from "../base/TypeStructuresBase.js";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.js";

import replaceDescendantTypeStructures from "../base/replaceDescendantTypeStructures.js";

import type {
  CloneableStructure
} from "../types/CloneableStructure.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";
// #endregion preamble

/** (`keyof` | `typeof` | `readonly` | `unique`)[] (child type) */
export default class PrefixOperatorsTypedStructureImpl
extends TypeStructuresBase
implements PrefixOperatorsTypedStructure
{
  public static clone(
    other: PrefixOperatorsTypedStructure
  ): PrefixOperatorsTypedStructureImpl
  {
    return new PrefixOperatorsTypedStructureImpl(
      other.operators,
      TypeStructureClassesMap.clone(other.childTypes[0])
    );
  }

  readonly kind: TypeStructureKind.PrefixOperators = TypeStructureKind.PrefixOperators;

  operators: PrefixUnaryOperator[];
  childTypes: [TypeStructures];

  constructor(
    operators: readonly PrefixUnaryOperator[],
    childType: TypeStructures
  )
  {
    super();
    this.operators = operators.slice();
    this.childTypes = [childType];

    registerCallbackForTypeStructure(this);
  }

  public replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void
  {
    replaceDescendantTypeStructures(this.childTypes, 0, filter, replacement);
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.operators.length) {
      writer.write(this.operators.map(op => op === "..." ? op : op + " ").join(""));
    }
    this.childTypes[0].writerFunction(writer);
  }

  writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    yield this.childTypes[0];
  }
}
PrefixOperatorsTypedStructureImpl satisfies CloneableStructure<PrefixOperatorsTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.PrefixOperators, PrefixOperatorsTypedStructureImpl);
