import type {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import {
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresBase,
} from "../../../snapshot/source/internal-exports.js";


export type PrefixUnaryOperator = (
  | "..."
  | "keyof"
  | "typeof"
  | "readonly"
  | "unique"
);

/** `("..." | "keyof" | "typeof" | "readonly" | "unique")[]` (object type) */
export default
class PrefixOperatorsTypeStructureImpl
extends TypeStructuresBase<TypeStructureKind.PrefixOperators>
{
  public static clone(
    other: PrefixOperatorsTypeStructureImpl
  ): PrefixOperatorsTypeStructureImpl
  {
    return new PrefixOperatorsTypeStructureImpl(
      other.operators,
      TypeStructureClassesMap.clone(other.objectType)
    );
  }

  readonly kind = TypeStructureKind.PrefixOperators;
  public operators: PrefixUnaryOperator[];
  public objectType: TypeStructures;

  constructor(
    operators: readonly PrefixUnaryOperator[],
    objectType: TypeStructures
  )
  {
    super();
    this.operators = operators.slice();
    this.objectType = objectType;
    this.registerCallbackForTypeStructure();
  }

  #writerFunction(writer: CodeBlockWriter): void
  {
    if (this.operators.length) {
      writer.write(this.operators.map(op => op === "..." ? op : op + " ").join(""));
    }

    this.objectType.writerFunction(writer);
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  /** @internal */
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>
  {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (typeof this.objectType === "object")
      yield this.objectType;
  }
}
PrefixOperatorsTypeStructureImpl satisfies CloneableTypeStructure<PrefixOperatorsTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.PrefixOperators, PrefixOperatorsTypeStructureImpl);
