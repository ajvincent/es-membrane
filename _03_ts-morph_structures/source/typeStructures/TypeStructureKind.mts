import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

export enum TypeStructureKind {
  Writer = 1000000,
  Literal,
  String,
  SymbolKey,
  Union,
  Intersection,
  Tuple,
  Array,
  IndexedAccess,
  TypeArgumented,
  KeyOfTypeof,
  Function,
  ObjectLiteral, /* reserved, but probably never used */
}

export interface KindedTypeStructure<
  TKind extends TypeStructureKind
> extends TypedNodeWriter
{
  kind: TKind;
}
