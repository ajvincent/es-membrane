import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.js";

export enum TypeStructureKind {
  Writer = 1000000,
  Literal,
  String,
  SymbolKey,
  Parentheses,
  PrefixOperators,
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
  Infer,
  QualifiedName,
  Import,
}

export interface KindedTypeStructure<
  TKind extends TypeStructureKind
> extends TypedNodeWriter
{
  readonly kind: TKind;
}
