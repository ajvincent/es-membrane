import type {
  Simplify
} from "type-fest";

import type {
  TypeElementMemberedNodeStructure
} from "ts-morph"

import type {
  KindedTypeStructure,
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import type {
  AppendableStructure
} from "../types/AppendableStructure.js";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  type TypePrinterSettings,
  type TypePrinterSettingsBase,
  TypeParameterDeclarationImpl,
} from "../exports.js";

export type WriterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Writer> &
  ReplaceableDescendants
>;

interface TypedStructureWithPrimitive<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  readonly stringValue: string;
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

interface TypeStructureWithOneChild<
  Kind extends TypeStructureKind
> extends TypedStructureWithChildren<Kind>
{
  childTypes: [TypeStructures];
}

interface PrefixUnaryOperatorOwner {
  operators: PrefixUnaryOperator[];
}

interface ReplaceableDescendants {
  replaceDescendantTypes(
    filter: (typeStructure: TypeStructures) => boolean,
    replacement: TypeStructures
  ): void;
}

export type LiteralTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.Literal> &
  ReplaceableDescendants
>;
export type StringTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.String> &
  ReplaceableDescendants
>;
export type SymbolKeyTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.SymbolKey> &
  ReplaceableDescendants
>;

export type ParenthesesTypedStructure = Simplify<
  TypeStructureWithOneChild<TypeStructureKind.Parentheses> &
  TypePrinterSettings &
  ReplaceableDescendants
>;

export type PrefixOperatorsTypedStructure = Simplify<
  TypeStructureWithOneChild<TypeStructureKind.PrefixOperators> &
  PrefixUnaryOperatorOwner &
  ReplaceableDescendants
>;

export type UnionTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Union> &
  TypePrinterSettings &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;
export type IntersectionTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Intersection> &
  TypePrinterSettings &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;
export type TupleTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Tuple> &
  TypePrinterSettings &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;

export type QualifiedNameTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.QualifiedName> &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;

export type ArrayTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Array> &
  TypedStructureWithObjectType &
  ReplaceableDescendants
>;

export interface ConditionalTypeStructureParts {
  checkType: TypeStructures;
  extendsType: TypeStructures;
  trueType: TypeStructures;
  falseType: TypeStructures;
}

export type ConditionalTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Conditional> &
  ConditionalTypeStructureParts &
  ReplaceableDescendants
>;

interface IndexedAccessType {
  indexType: TypeStructures;
}

export type IndexedAccessTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.IndexedAccess> &
  TypedStructureWithObjectType &
  TypePrinterSettings &
  IndexedAccessType &
  ReplaceableDescendants
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
  MappedType &
  ReplaceableDescendants
>;

export type TypeArgumentedTypedStructure = Simplify<
  TypedStructureWithObjectType &
  TypedStructureWithChildren<TypeStructureKind.TypeArgumented> &
  TypePrinterSettings &
  ReplaceableDescendants &
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
  FunctionTypeContext &
  ReplaceableDescendants
>;

interface ParameterTypeStructureFields {
  name: LiteralTypedStructure;
  typeStructure: TypeStructures | undefined
}

export type ParameterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Parameter> &
  ParameterTypeStructureFields &
  ReplaceableDescendants
>;

interface TemplateLiteralTypedStructureFields {
  childTypes: (string | TypeStructures)[];
}

export type TemplateLiteralTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.TemplateLiteral> &
  TypePrinterSettings &
  TemplateLiteralTypedStructureFields &
  ReplaceableDescendants
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

export type MemberedObjectTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.MemberedObject> &
  TypeElementMemberedNodeStructure &
  ReplaceableDescendants &
  AppendableStructure<ObjectLiteralAppendables>
>;

export interface InferTypedStructureFields {
  typeParameter: TypeParameterDeclarationImpl;
}

export type InferTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Infer> &
  InferTypedStructureFields &
  ReplaceableDescendants
>;

export interface ImportTypedStructureFields {
  argument: StringTypedStructure;
  qualifier: LiteralTypedStructure | QualifiedNameTypedStructure | null;
  /*
  readonly attributes: ImportAttributeDecl[]
  */
}

export type ImportTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Import> &
  ImportTypedStructureFields &
  ReplaceableDescendants
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
  MemberedObjectTypedStructure |
  InferTypedStructure |
  QualifiedNameTypedStructure |
  ImportTypedStructure
);
