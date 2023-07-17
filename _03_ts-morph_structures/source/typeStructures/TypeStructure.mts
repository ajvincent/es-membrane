import type {
  KindedTypeStructure,
  TypeStructureKind,
} from "./TypeStructureKind.mjs";

export type WriterTypedStructure = KindedTypeStructure<TypeStructureKind.Writer>;

interface TypedStructureWithPrimitive<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  stringValue: string;
}

export type LiteralTypedStructure = TypedStructureWithPrimitive<TypeStructureKind.Literal>;
export type StringTypedStructure = TypedStructureWithPrimitive<TypeStructureKind.String>;
export type SymbolKeyTypedStructure = TypedStructureWithPrimitive<TypeStructureKind.SymbolKey>;

interface TypedStructureWithElements<
  Kind extends TypeStructureKind
> extends KindedTypeStructure<Kind>
{
  elements: TypeStructure[];
}

export type UnionTypedStructure = TypedStructureWithElements<TypeStructureKind.Union>;
export type IntersectionTypedStructure = TypedStructureWithElements<TypeStructureKind.Intersection>;
export type TupleTypedStructure = TypedStructureWithElements<TypeStructureKind.Tuple>;
export type ArrayTypedStructure = TypedStructureWithElements<TypeStructureKind.Array>;

interface TypedStructureWithObjectType<
  Kind extends TypeStructureKind
> extends TypedStructureWithElements<Kind>
{
  objectType: TypeStructure;
}

export type IndexedAccessTypedStructure = TypedStructureWithObjectType<TypeStructureKind.IndexedAccess>;
export type TypeArgumentedTypedStructure = TypedStructureWithObjectType<TypeStructureKind.TypeArgumented>;

type KeyofTypeofTuple = [true, false] | [false, true] | [true, true];

export interface KeyOfTypeofTypedStructure extends KindedTypeStructure<TypeStructureKind.KeyOfTypeof> {
  keyOfAndTypeOf: KeyofTypeofTuple;
  ofTypeStructure: TypeStructure;
}

export interface FunctionTypedStructure extends KindedTypeStructure<TypeStructureKind.Function> {
  isConstructor: boolean;
  //typeArguments: TypeArgumentedTypedStructure[];
  parameters: [LiteralTypedStructure, TypeStructure][];
  restParameter: [LiteralTypedStructure, TypeStructure] | undefined;
  returnType: TypeStructure;
}

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
