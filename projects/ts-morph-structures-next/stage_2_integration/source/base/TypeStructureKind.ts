import type {
  NodeWriter
} from "../types/ts-morph-nodewriter.js";

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
  NamedTupleMember,
  Optional
}

export interface KindedTypeStructure<
  TKind extends TypeStructureKind
> extends NodeWriter
{
  readonly kind: TKind;
}
