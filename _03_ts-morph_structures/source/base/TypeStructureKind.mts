import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

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
  ObjectLiteral,
}

export interface KindedTypeStructure<
  TKind extends TypeStructureKind
> extends TypedNodeWriter
{
  readonly kind: TKind;
}
