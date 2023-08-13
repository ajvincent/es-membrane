import type {
  Simplify
} from "type-fest";

import type {
  TypeElementMemberedNodeStructure
} from "ts-morph"

import type {
  KindedTypeStructure,
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";

import {
  TypeParameterDeclarationImpl,
} from "../../exports.mjs";

export type WriterTypedStructure = Simplify<KindedTypeStructure<TypeStructureKind.Writer>>;

interface TypedStructureWithPrimitive<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  readonly stringValue: string;
}

interface TypeStructureWithOneChild {
  childType: TypeStructure;
}

export type PrefixUnaryOperator = (
  "readonly" |
  "unique" |
  "keyof" |
  "typeof"
);

interface TypedStructureWithObjectType {
  objectType: TypeStructure;
}

interface TypedStructureWithElements<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  elements: TypeStructure[];
}

interface PrefixUnaryOperatorOwner {
  operators: PrefixUnaryOperator[];
}

export type LiteralTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.Literal>
>;
export type StringTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.String>
>;
export type SymbolKeyTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.SymbolKey>
>;

export type ParenthesesTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Parentheses> &
  TypeStructureWithOneChild
>;

export type PrefixOperatorsTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.PrefixOperators> &
  TypeStructureWithOneChild &
  PrefixUnaryOperatorOwner
>;

export type UnionTypedStructure = Simplify<
  TypedStructureWithElements<TypeStructureKind.Union>
>;
export type IntersectionTypedStructure = Simplify<
  TypedStructureWithElements<TypeStructureKind.Intersection>
>;
export type TupleTypedStructure = Simplify<
  TypedStructureWithElements<TypeStructureKind.Tuple>
>;

export type ArrayTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Array> &
  TypedStructureWithObjectType
>;

export interface ConditionalTypeStructureParts {
  checkType: TypeStructure;
  extendsType: TypeStructure;
  trueType: TypeStructure;
  falseType: TypeStructure;
}

export type ConditionalTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Conditional> &
  ConditionalTypeStructureParts
>;

interface IndexedAccessType {
  indexType: TypeStructure;
}

export type IndexedAccessTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.IndexedAccess> &
  TypedStructureWithObjectType &
  IndexedAccessType
>;

interface MappedType {
  readonlyToken: "+readonly" | "-readonly" | "readonly" | undefined;
  parameter: TypeParameterDeclarationImpl;
  asName: TypeStructure | undefined;
  questionToken: "+?" | "-?" | "?" | undefined;
  type: TypeStructure | undefined;
}

export type MappedTypeTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Mapped> &
  MappedType
>;

export type TypeArgumentedTypedStructure = Simplify<
  TypedStructureWithObjectType &
  TypedStructureWithElements<TypeStructureKind.TypeArgumented>
>;

export enum FunctionWriterStyle {
  Arrow = "Arrow",
  Method = "Method",
  GetAccessor = "GetAccessor",
  SetAccessor = "SetAccessor",
}

export interface FunctionTypeContext {
  name: string | undefined;
  isConstructor: boolean,
  typeParameters: TypeParameterDeclarationImpl[];
  parameters: ParameterTypedStructure[];
  restParameter: ParameterTypedStructure | undefined;
  returnType: TypeStructure | undefined;
  writerStyle: FunctionWriterStyle
}

export type FunctionTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Function> &
  FunctionTypeContext
>;

interface ParameterTypeStructureFields {
  name: LiteralTypedStructure;
  typeStructure: TypeStructure | undefined
}

export type ParameterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Parameter> &
  ParameterTypeStructureFields
>;

interface TemplateLiteralTypedStructureFields {
  elements: (string | TypeStructure)[];
}

export type TemplateLiteralTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.TemplateLiteral> &
  TemplateLiteralTypedStructureFields
>;

export type ObjectLiteralTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.ObjectLiteral> &
  TypeElementMemberedNodeStructure
>;

export type TypeStructure = (
  WriterTypedStructure |
  LiteralTypedStructure |
  StringTypedStructure |
  SymbolKeyTypedStructure |
  ParenthesesTypedStructure |
  PrefixOperatorsTypedStructure |
  UnionTypedStructure |
  IntersectionTypedStructure |
  TupleTypedStructure |
  ArrayTypedStructure |
  ConditionalTypedStructure |
  IndexedAccessTypedStructure |
  MappedTypeTypedStructure |
  TypeArgumentedTypedStructure |
  FunctionTypedStructure |
  TemplateLiteralTypedStructure |
  ObjectLiteralTypedStructure
);
