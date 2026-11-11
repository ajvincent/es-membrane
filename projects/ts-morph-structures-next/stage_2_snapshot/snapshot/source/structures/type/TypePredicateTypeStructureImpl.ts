import { type CodeBlockWriter } from "ts-morph";

import {
  type AugmentedStructures,
  LiteralTypeStructureImpl,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  STRUCTURE_CHILDREN,
  type CloneableTypeStructure,
  TypeStructuresBase,
  TypeStructureClassesMap,
  WRITER_FUNCTION_KEY,
} from "../../internal-exports.js";

/** @example assert condition is true */
export class TypePredicateTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.TypePredicate> {
  readonly kind: TypeStructureKind.TypePredicate =
    TypeStructureKind.TypePredicate;

  hasAssertsKeyword: boolean;
  parameterName: LiteralTypeStructureImpl;
  isType: TypeStructures | null;

  constructor(
    hasAssertsKeyword: boolean,
    parameterName: LiteralTypeStructureImpl,
    isType?: TypeStructures | null,
  ) {
    super();
    this.hasAssertsKeyword = hasAssertsKeyword;
    this.parameterName = parameterName;
    this.isType = isType ?? null;
  }

  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    if (this.hasAssertsKeyword) {
      writer.write("asserts ");
    }
    this.parameterName.writerFunction(writer);
    if (this.isType) {
      writer.write(" is ");
      this.isType.writerFunction(writer);
    }
  }

  public static clone(
    other: TypePredicateTypeStructureImpl,
  ): TypePredicateTypeStructureImpl {
    let isType: TypeStructures | undefined;
    if (other.isType) {
      isType = TypeStructureClassesMap.clone(other.isType);
    }
    return new TypePredicateTypeStructureImpl(
      other.hasAssertsKeyword,
      other.parameterName,
      isType,
    );
  }

  /** @internal */
  public *[STRUCTURE_CHILDREN](): IterableIterator<AugmentedStructures> {
    yield* super[STRUCTURE_CHILDREN]();
    if (this.isType) yield this.isType;
  }
}
TypePredicateTypeStructureImpl satisfies CloneableTypeStructure<TypePredicateTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.TypePredicate,
  TypePredicateTypeStructureImpl,
);
