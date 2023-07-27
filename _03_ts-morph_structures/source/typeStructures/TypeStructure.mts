import type {
  Simplify
} from "type-fest";

import type {
  KindedTypeStructure,
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

export type WriterTypedStructure = Simplify<KindedTypeStructure<TypeStructureKind.Writer>>;

interface TypedStructureWithPrimitive<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  stringValue: string;
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

export interface TypedStructureWithElements<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  elements: TypeStructure[];
}

interface TypedStructureReadonly {
  isReadonly: boolean;
}

interface TypedStructureWithObjectType {
  objectType: TypeStructure;
}

export type UnionTypedStructure = Simplify<
  TypedStructureWithElements<TypeStructureKind.Union>
>;
export type IntersectionTypedStructure = Simplify<
  TypedStructureWithElements<TypeStructureKind.Intersection>
>;
export type TupleTypedStructure = Simplify<
  TypedStructureReadonly &
  TypedStructureWithElements<TypeStructureKind.Tuple>
>;

export type ArrayTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Array> &
  TypedStructureReadonly &
  TypedStructureWithObjectType &
  {
    length: number;
  }
>;

export type IndexedAccessTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.IndexedAccess> &
  TypedStructureWithObjectType &
  {
    indexType: TypeStructure;
  }
>;

export type TypeArgumentedTypedStructure = Simplify<
  TypedStructureWithObjectType &
  TypedStructureWithElements<TypeStructureKind.TypeArgumented>
>;

type KeyofTypeofTuple = [true, false] | [false, true] | [true, true];

export type KeyOfTypeofTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.KeyOfTypeof> &
  {
    keyOfAndTypeOf: KeyofTypeofTuple;
    ofTypeStructure: TypeStructure;
  }
>;

export enum FunctionWriterStyle {
  Arrow = "Arrow",
  Method = "Method",
  GetAccessor = "GetAccessor",
  SetAccessor = "SetAccessor",
}

export interface FunctionTypeContext {
  //typeArguments: TypeParameterDeclarationImpl[]
  name?: string;
  isConstructor: boolean,
  parameters: ParameterTypedStructure[];
  restParameter: ParameterTypedStructure | undefined;
  returnType: TypeStructure;
  writerStyle: FunctionWriterStyle
}

export type FunctionTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Function> & FunctionTypeContext
>;

export type ParameterTypedStructure = Simplify<
  KindedTypeStructure<TypeStructureKind.Parameter> &
  {
    name: LiteralTypedStructure;
    typeStructure: TypeStructure;
  }
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
  UnionTypedStructure |
  IntersectionTypedStructure |
  TupleTypedStructure |
  ArrayTypedStructure |
  IndexedAccessTypedStructure |
  TypeArgumentedTypedStructure |
  KeyOfTypeofTypedStructure |
  FunctionTypedStructure
);
