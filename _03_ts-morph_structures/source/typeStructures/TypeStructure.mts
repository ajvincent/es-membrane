import type {
  Simplify
} from "type-fest";

import type {
  KindedTypeStructure,
  TypeStructureKind,
} from "../base/TypeStructureKind.mjs";
import TypeParameterDeclarationImpl from "../structures/TypeParameterDeclarationImpl.mjs";

export type WriterTypedStructure = Simplify<KindedTypeStructure<TypeStructureKind.Writer>>;

interface TypedStructureWithPrimitive<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  stringValue: string;
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

/**
 * @remarks
 *
 * I have explicitly excluded object literal typed structures (`{ foo(): void; }`, etc.),
 * They're basically `Partial<InterfaceDeclarationStructure>` objects, but serializing them
 * will be painful.
 *
 * The best idea I have is to create an in-memory source file containing exactly one interface,
 * strip out the opening and closing lines, and feed the other lines to the requesting
 * `CodeBlockWriter` object.  That's a lot of work for ts-morph, especially when a savvy
 * developer would just create an interface declaration or type alias in the same file.
 *
 * Inline object literals may convey meaning quickly (`Class<Base> & { staticMethod(): void }`),
 * but they're really not worth it when we could just as easily write
 * `Simplify<Class<Base> & StaticMethods>`.
 *
 * If this ever moves upstream into ts-morph, it would be a lot easier to implement
 * `ObjectLiteralTypedStructure` there.
 */
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
  TypeArgumentedTypedStructure |
  FunctionTypedStructure
);
