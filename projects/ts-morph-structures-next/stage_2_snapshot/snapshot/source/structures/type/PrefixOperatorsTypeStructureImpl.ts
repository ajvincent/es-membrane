import type { CodeBlockWriter } from "ts-morph";

import type { AugmentedStructures } from "../../exports.js";

import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import { STRUCTURE_CHILDREN } from "../../base/symbolKeys.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import type { TypeStructures } from "./TypeStructures.js";

import TypeStructuresBase from "./TypeStructuresBase.js";

export type PrefixUnaryOperator =
  | "..."
  | "keyof"
  | "typeof"
  | "readonly"
  | "unique";

/** `("..." | "keyof" | "typeof" | "readonly" | "unique")[]` (object type) */
export class PrefixOperatorsTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.PrefixOperators> {
  public static clone(
    other: PrefixOperatorsTypeStructureImpl,
  ): PrefixOperatorsTypeStructureImpl {
    return new PrefixOperatorsTypeStructureImpl(
      other.operators,
      TypeStructureClassesMap.clone(other.objectType),
    );
  }

  readonly kind = TypeStructureKind.PrefixOperators;
  public operators: PrefixUnaryOperator[];
  public objectType: TypeStructures;

  constructor(
    operators: readonly PrefixUnaryOperator[],
    objectType: TypeStructures,
  ) {
    super();
    this.operators = operators.slice();
    this.objectType = objectType;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    if (this.operators.length) {
      writer.write(
        this.operators.map((op) => (op === "..." ? op : op + " ")).join(""),
      );
    }

    this.objectType.writerFunction(writer);
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
    if (typeof this.objectType === "object") yield this.objectType;
  }
}
PrefixOperatorsTypeStructureImpl satisfies CloneableTypeStructure<PrefixOperatorsTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.PrefixOperators,
  PrefixOperatorsTypeStructureImpl,
);
