import type { TypedNodeWriter } from "../internal-exports.js";

export enum TypeStructureKind {
  Literal = 1000000000,
  String,
  Number,
  Writer,
  QualifiedName,
  Parentheses,
  PrefixOperators,
  Infer,
  Union,
  Intersection,
  Tuple,
  Array,
  Conditional,
  IndexedAccess,
  Mapped,
  TypeArgumented,
  Function,
  Parameter,
  TemplateLiteral,
  MemberedObject,
  Import,
  TypePredicate,
}

export interface KindedTypeStructure<TKind extends TypeStructureKind>
  extends TypedNodeWriter {
  readonly kind: TKind;
}
