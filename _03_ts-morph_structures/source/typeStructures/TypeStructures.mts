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

import type {
  AppendableStructure
} from "../types/AppendableStructure.mjs";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  type TypePrinterSettings,
  type TypePrinterSettingsBase,
  TypeParameterDeclarationImpl,
} from "../../exports.mjs";

export type WriterTypedStructure = Simplify<KindedTypeStructure<TypeStructureKind.Writer>>;

interface TypedStructureWithPrimitive<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  readonly stringValue: string;
}

interface TypeStructureWithOneChild<
  Kind extends TypeStructureKind
> extends TypedStructureWithChildren<Kind>
{
  childTypes: [TypeStructures]
}

export type PrefixUnaryOperator = (
  "..." |
  "readonly" |
  "unique" |
  "keyof" |
  "typeof"
);

interface TypedStructureWithObjectType {
  objectType: TypeStructures;
}

export interface TypedStructureWithChildren<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  childTypes: TypeStructures[];
}

interface TypeStructureWithOneChild<
  Kind extends TypeStructureKind
> extends TypedStructureWithChildren<Kind>
{
  childTypes: [TypeStructures];
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
  TypeStructureWithOneChild<TypeStructureKind.Parentheses> &
  TypePrinterSettings
>;

export type PrefixOperatorsTypedStructure = Simplify<
  TypeStructureWithOneChild<TypeStructureKind.PrefixOperators> &
  PrefixUnaryOperatorOwner
>;

export type UnionTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Union> &
  TypePrinterSettings &
  AppendableStructure<TypeStructures[]>
>;
export type IntersectionTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Intersection> &
  TypePrinterSettings &
  AppendableStructure<TypeStructures[]>
>;
export type TupleTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Tuple> &
  TypePrinterSettings &
  AppendableStructure<TypeStructures[]>
>;

export type ArrayTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Array> &
  TypedStructureWithObjectType
>;

export interface ConditionalTypeStructureParts {
  checkType: TypeStructures;
  extendsType: TypeStructures;
  trueType: TypeStructures;
  falseType: TypeStructures;
}

export type ConditionalTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Conditional> &
  ConditionalTypeStructureParts
>;

interface IndexedAccessType {
  indexType: TypeStructures;
}

export type IndexedAccessTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.IndexedAccess> &
  TypedStructureWithObjectType &
  TypePrinterSettings &
  IndexedAccessType
>;

interface MappedType {
  readonlyToken: "+readonly" | "-readonly" | "readonly" | undefined;
  parameter: TypeParameterDeclarationImpl;
  asName: TypeStructures | undefined;
  questionToken: "+?" | "-?" | "?" | undefined;
  type: TypeStructures | undefined;
}

export type MappedTypeTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Mapped> &
  MappedType
>;

export type TypeArgumentedTypedStructure = Simplify<
  TypedStructureWithObjectType &
  TypedStructureWithChildren<TypeStructureKind.TypeArgumented> &
  TypePrinterSettings &
  AppendableStructure<TypeStructures[]>
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
  // useful for constraintStructure, defaultStructure
  typeParameters: TypeParameterDeclarationImpl[];
  parameters: ParameterTypedStructure[];
  restParameter: ParameterTypedStructure | undefined;
  returnType: TypeStructures | undefined;
  writerStyle: FunctionWriterStyle,

  typeParameterPrinterSettings: TypePrinterSettingsBase,
  parameterPrinterSettings: TypePrinterSettingsBase,
}

export type FunctionTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Function> &
  FunctionTypeContext
>;

interface ParameterTypeStructureFields {
  name: LiteralTypedStructure;
  typeStructure: TypeStructures | undefined
}

export type ParameterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Parameter> &
  ParameterTypeStructureFields
>;

interface TemplateLiteralTypedStructureFields {
  childTypes: (string | TypeStructures)[];
}

export type TemplateLiteralTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.TemplateLiteral> &
  TypePrinterSettings &
  TemplateLiteralTypedStructureFields
>;

export type ObjectLiteralAppendables = (
  (
    CallSignatureDeclarationImpl |
    ConstructSignatureDeclarationImpl |
    IndexSignatureDeclarationImpl |
    MethodSignatureImpl |
    PropertySignatureImpl
  )[] |
  {
    callSignatures?: CallSignatureDeclarationImpl[],
    constructSignatures?: ConstructSignatureDeclarationImpl[],
    indexSignatures?: IndexSignatureDeclarationImpl[],
    methods?: MethodSignatureImpl[],
    properties?: PropertySignatureImpl[],
  }
);

export type ObjectLiteralTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.ObjectLiteral> &
  TypeElementMemberedNodeStructure &
  AppendableStructure<ObjectLiteralAppendables>
>;

export interface InferTypedStructureFields {
  typeParameter: TypeParameterDeclarationImpl;
}

export type InferTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Infer> &
  InferTypedStructureFields
>;

export type TypeStructures = (
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
  ParameterTypedStructure |
  TemplateLiteralTypedStructure |
  ObjectLiteralTypedStructure |
  InferTypedStructure
);
