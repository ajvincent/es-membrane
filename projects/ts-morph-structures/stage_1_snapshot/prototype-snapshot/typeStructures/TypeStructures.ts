import type {
  Simplify
} from "type-fest";

import type {
  TypeElementMemberedNodeStructure
} from "ts-morph";

import type {
  KindedTypeStructure,
  TypeStructureKind,
} from "../base/TypeStructureKind.js";

import {
  STRUCTURE_AND_TYPES_CHILDREN
} from "../base/symbolKeys.js";

import type {
  AppendableStructure
} from "../types/AppendableStructure.js";

import type {
  StructureImpls
} from "../types/StructureImplUnions.js";

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

interface TypedChildrenIteration {
  [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

export type WriterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Writer> &
  TypedChildrenIteration &
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
  TypedChildrenIteration &
  ReplaceableDescendants
>;

export type StringTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.String> &
  TypedChildrenIteration &
  ReplaceableDescendants
>;

export type SymbolKeyTypedStructure = Simplify<
  TypedStructureWithPrimitive<TypeStructureKind.SymbolKey> &
  TypedChildrenIteration &
  ReplaceableDescendants
>;

export type ParenthesesTypedStructure = Simplify<
  TypeStructureWithOneChild<TypeStructureKind.Parentheses> &
  TypedChildrenIteration &
  TypePrinterSettings &
  ReplaceableDescendants
>;

export type PrefixOperatorsTypedStructure = Simplify<
  TypeStructureWithOneChild<TypeStructureKind.PrefixOperators> &
  TypedChildrenIteration &
  PrefixUnaryOperatorOwner &
  ReplaceableDescendants
>;

export type UnionTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Union> &
  TypedChildrenIteration &
  TypePrinterSettings &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;

export type IntersectionTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Intersection> &
  TypedChildrenIteration &
  TypePrinterSettings &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;

export type TupleTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.Tuple> &
  TypedChildrenIteration &
  TypePrinterSettings &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;

export type QualifiedNameTypedStructure = Simplify<
  TypedStructureWithChildren<TypeStructureKind.QualifiedName> &
  TypedChildrenIteration &
  ReplaceableDescendants &
  AppendableStructure<TypeStructures[]>
>;

export type ArrayTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Array> &
  TypedChildrenIteration &
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
  TypedChildrenIteration &
  ConditionalTypeStructureParts &
  ReplaceableDescendants
>;

interface IndexedAccessType {
  indexType: TypeStructures;
}

export type IndexedAccessTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.IndexedAccess> &
  TypedChildrenIteration &
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
  TypedChildrenIteration &
  MappedType &
  ReplaceableDescendants
>;

export type TypeArgumentedTypedStructure = Simplify<
  TypedStructureWithObjectType &
  TypedStructureWithChildren<TypeStructureKind.TypeArgumented> &
  TypedChildrenIteration &
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
  TypedChildrenIteration &
  FunctionTypeContext &
  ReplaceableDescendants
>;

interface ParameterTypeStructureFields {
  name: LiteralTypedStructure;
  typeStructure: TypeStructures | undefined
}

export type ParameterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Parameter> &
  TypedChildrenIteration &
  ParameterTypeStructureFields &
  ReplaceableDescendants
>;

interface TemplateLiteralTypedStructureFields {
  childTypes: (string | TypeStructures)[];
}

export type TemplateLiteralTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.TemplateLiteral> &
  TypedChildrenIteration &
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
  TypedChildrenIteration &
  TypeElementMemberedNodeStructure &
  ReplaceableDescendants &
  AppendableStructure<ObjectLiteralAppendables>
>;

export interface InferTypedStructureFields {
  typeParameter: TypeParameterDeclarationImpl;
}

export type InferTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Infer> &
  TypedChildrenIteration &
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
  TypedChildrenIteration &
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
