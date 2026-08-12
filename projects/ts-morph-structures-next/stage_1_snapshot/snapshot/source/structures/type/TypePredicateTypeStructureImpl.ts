import { type CodeBlockWriter, type WriterFunction } from "ts-morph";

import {
  LiteralTypeStructureImpl,
  type StructureImpls,
  TypeStructureKind,
  type TypeStructures,
} from "../../exports.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN,
  type CloneableTypeStructure,
  TypeStructuresBase,
  TypeStructureClassesMap,
} from "../../internal-exports.js";

/** @example assert condition is true */
export default class TypePredicateTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.TypePredicate> {
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

  #writerFunction(writer: CodeBlockWriter): void {
    if (this.hasAssertsKeyword) {
      writer.write("asserts ");
    }
    this.parameterName.writerFunction(writer);
    if (this.isType) {
      writer.write(" is ");
      this.isType.writerFunction(writer);
    }
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

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
  public *[STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<
    StructureImpls | TypeStructures
  > {
    yield* super[STRUCTURE_AND_TYPES_CHILDREN]();
    if (this.isType) yield this.isType;
  }
}
TypePredicateTypeStructureImpl satisfies CloneableTypeStructure<TypePredicateTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.TypePredicate,
  TypePredicateTypeStructureImpl,
);
