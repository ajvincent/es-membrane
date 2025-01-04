import * as ts_morph from 'ts-morph';
import { OptionalKind, Structures, WriterFunction, CodeBlockWriter, TypeNode, Node, StructureKind, KindedStructure, JsxNamespacedNameStructure, ModuleDeclarationKind, Scope, TypeParameterVariance, VariableDeclarationKind, TypeParameterDeclarationStructure, DecoratorStructure, ParameterDeclarationStructure, JSDocStructure, CallSignatureDeclarationStructure, ClassDeclarationStructure, ClassStaticBlockDeclarationStructure, ConstructorDeclarationStructure, ConstructorDeclarationOverloadStructure, ConstructSignatureDeclarationStructure, EnumDeclarationStructure, EnumMemberStructure, ExportAssignmentStructure, ExportDeclarationStructure, ExportSpecifierStructure, FunctionDeclarationStructure, FunctionDeclarationOverloadStructure, GetAccessorDeclarationStructure, ImportAttributeStructure, ImportDeclarationStructure, ImportSpecifierStructure, IndexSignatureDeclarationStructure, InterfaceDeclarationStructure, JSDocTagStructure, JsxAttributeStructure, JsxElementStructure, JsxSelfClosingElementStructure, JsxSpreadAttributeStructure, MethodDeclarationStructure, MethodDeclarationOverloadStructure, MethodSignatureStructure, ModuleDeclarationStructure, PropertyAssignmentStructure, PropertyDeclarationStructure, PropertySignatureStructure, SetAccessorDeclarationStructure, ShorthandPropertyAssignmentStructure, SourceFileStructure, SpreadAssignmentStructure, TypeAliasDeclarationStructure, VariableDeclarationStructure, VariableStatementStructure } from 'ts-morph';
import * as mixin_decorators from 'mixin-decorators';
import { Writable, Simplify } from 'type-fest';

declare const COPY_FIELDS: unique symbol;
declare const REPLACE_WRITER_WITH_STRING: unique symbol;
declare const STRUCTURE_AND_TYPES_CHILDREN: unique symbol;

declare class StructureBase {
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<Structures>, target: Structures): void;
    /** @internal */
    static [REPLACE_WRITER_WITH_STRING](value: string | WriterFunction): string;
    toJSON(): object;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/** @public */
interface TypeStructureSet extends Set<TypeStructures> {
    /**
     * Replace all the types this set manages with those from another array.
     * @param array - the types to add.
     */
    replaceFromTypeArray(array: (string | WriterFunction)[]): void;
    /**
     * Replace all the type structures this set managers with those from another set.
     * @param other - the type structure set to copy
     */
    cloneFromTypeStructureSet(other: TypeStructureSet): void;
}

declare abstract class TypeStructuresBase<Kind extends TypeStructureKind> implements KindedTypeStructure<Kind> {
    #private;
    protected registerCallbackForTypeStructure(): void;
    static getTypeStructureForCallback(callback: WriterFunction): TypeStructures | undefined;
    static deregisterCallbackForTypeStructure(structure: TypeStructures): void;
    /**
     * Write a start token, invoke a block, and write the end token, in that order.
     * @param writer - the code block writer.
     * @param startToken - the start token.
     * @param endToken - the end token.
     * @param newLine - true if we should call `.newLine()` after the start and before the end.
     * @param indent - true if we should indent the block statements.
     * @param block - the callback to execute for the block statements.
     *
     * @see {@link https://github.com/dsherret/code-block-writer/issues/44}
     */
    protected static pairedWrite(writer: CodeBlockWriter, startToken: string, endToken: string, newLine: boolean, indent: boolean, block: () => void): void;
    abstract readonly kind: Kind;
    abstract readonly writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

declare class TypePrinterSettings {
    indentChildren: boolean;
    newLinesAroundChildren: boolean;
    oneLinePerChild: boolean;
}
declare abstract class TypeStructuresWithChildren<Kind extends TypeStructureKind, Children extends readonly TypeStructures[]> extends TypeStructuresBase<Kind> {
    #private;
    abstract readonly kind: Kind;
    /** This lives outside the start and end tokens.  Think of this as a parent type for the children, ie. `Partial`. */
    protected abstract objectType: TypeStructuresOrNull;
    /** The child types we join together, and wrap in the start and end tokens. */
    abstract readonly childTypes: Children;
    /** A very short string, one or two characters, before all child types. */
    protected abstract readonly startToken: string;
    /** A very short string, between all child types. */
    protected abstract readonly joinChildrenToken: string;
    /** A very short string, one or two characters, after all child types. */
    protected abstract readonly endToken: string;
    /** The maximum number of children to support. */
    protected abstract readonly maxChildCount: number;
    /** For customizing printing of the child types. */
    readonly printerSettings: TypePrinterSettings;
    readonly writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

declare abstract class TypeStructuresWithTypeParameters<Kind extends TypeStructureKind> extends TypeStructuresBase<Kind> {
    #private;
    protected static writeTypeParameter(typeParam: TypeParameterDeclarationImpl, writer: CodeBlockWriter, constraintMode: "extends" | "in"): void;
}

type OmitWriter<T> = T extends (infer A)[]
  ? OmitWriter<A>[]
  : Exclude<T, WriterFunction>;

type OmitWriterFromFields<T extends object> = {
  [key in keyof T]: OmitWriter<T[key]>;
};

type StructureClassToJSON<T extends object> = Writable<
  Omit<
    OmitWriterFromFields<T>,
    "toJSON" | `${string}Structure` | `${string}Set`
  >
>;

interface TypedNodeWriter {
  writerFunction: WriterFunction;
}

declare enum TypeStructureKind {
    Literal = 1000000000,
    String = 1000000001,
    Number = 1000000002,
    Writer = 1000000003,
    QualifiedName = 1000000004,
    Parentheses = 1000000005,
    PrefixOperators = 1000000006,
    Infer = 1000000007,
    Union = 1000000008,
    Intersection = 1000000009,
    Tuple = 1000000010,
    Array = 1000000011,
    Conditional = 1000000012,
    IndexedAccess = 1000000013,
    Mapped = 1000000014,
    TypeArgumented = 1000000015,
    Function = 1000000016,
    Parameter = 1000000017,
    TemplateLiteral = 1000000018,
    MemberedObject = 1000000019,
    Import = 1000000020,
    TypePredicate = 1000000021
}
interface KindedTypeStructure<TKind extends TypeStructureKind> extends TypedNodeWriter {
    readonly kind: TKind;
}

interface NodeWithStructures extends Node {
  getStructure(): Structures;
}

/** A string message and a type node. */
interface BuildTypesForStructureFailures {
  message: string;
  failingTypeNode: TypeNode;
}

/**
 * @param message - The failure message.
 * @param failingTypeNode - the type node we failed to resolve.
 */
type TypeNodeToTypeStructureConsole = (
  message: string,
  failingTypeNode: TypeNode,
) => void;

interface RootStructureWithConvertFailures<
  TKind extends StructureKind = StructureKind,
> {
  rootStructure: Extract<StructureImpls, KindedStructure<TKind>>;
  failures: readonly BuildTypesForStructureFailures[];
}

/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @param assertNoFailures - if true, assert there are no conversion failures.
 * @returns the root structure, the root node, and any failures during recursion.
 */
declare function getTypeAugmentedStructure(rootNode: NodeWithStructures, userConsole: TypeNodeToTypeStructureConsole, assertNoFailures: boolean): RootStructureWithConvertFailures;
/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @param assertNoFailures - if true, assert there are no conversion failures.
 * @param kind - the expected structure kind to retrieve.
 * @returns the root structure, the root node, and any failures during recursion.
 */
declare function getTypeAugmentedStructure<TKind extends StructureKind>(rootNode: NodeWithStructures, userConsole: TypeNodeToTypeStructureConsole, assertNoFailures: boolean, kind: TKind): RootStructureWithConvertFailures<TKind>;

declare function parseLiteralType(source: string): TypeStructures;

declare function VoidTypeNodeToTypeStructureConsole(message: string, failingTypeNode: TypeNode): void;

interface AbstractableNodeStructureClassIfc {
  isAbstract: boolean;
}

interface AmbientableNodeStructureClassIfc {
  hasDeclareKeyword: boolean;
}

interface AsyncableNodeStructureClassIfc {
  isAsync: boolean;
}

interface CallSignatureDeclarationStructureClassIfc {
  readonly kind: StructureKind.CallSignature;
}

interface ClassDeclarationStructureClassIfc {
  readonly kind: StructureKind.Class;
  readonly ctors: ConstructorDeclarationImpl[];
  extends?: stringOrWriterFunction;
  extendsStructure: TypeStructures | undefined;
  readonly getAccessors: GetAccessorDeclarationImpl[];
  /** Treat this as a read-only array.  Use `.implementsSet` to modify this. */
  readonly implements: stringOrWriterFunction[];
  readonly implementsSet: TypeStructureSet;
  readonly methods: MethodDeclarationImpl[];
  readonly properties: PropertyDeclarationImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
  readonly staticBlocks: ClassStaticBlockDeclarationImpl[];
}

interface ClassStaticBlockDeclarationStructureClassIfc {
  readonly kind: StructureKind.ClassStaticBlock;
}

interface ConstructorDeclarationOverloadStructureClassIfc {
  readonly kind: StructureKind.ConstructorOverload;
}

interface ConstructorDeclarationStructureClassIfc {
  readonly kind: StructureKind.Constructor;
  readonly overloads: ConstructorDeclarationOverloadImpl[];
}

interface ConstructSignatureDeclarationStructureClassIfc {
  readonly kind: StructureKind.ConstructSignature;
}

interface DecoratableNodeStructureClassIfc {
  readonly decorators: DecoratorImpl[];
}

interface DecoratorStructureClassIfc {
  readonly kind: StructureKind.Decorator;
  /**
   * Arguments for a decorator factory.
   * @remarks Provide an empty array to make the structure a decorator factory.
   */
  readonly arguments: stringOrWriterFunction[];
  readonly typeArguments: string[];
}

interface EnumDeclarationStructureClassIfc {
  readonly kind: StructureKind.Enum;
  isConst: boolean;
  readonly members: EnumMemberImpl[];
}

interface EnumMemberStructureClassIfc {
  readonly kind: StructureKind.EnumMember;
  /** Convenience property for setting the initializer. */
  value?: number | string;
}

interface ExclamationTokenableNodeStructureClassIfc {
  hasExclamationToken: boolean;
}

interface ExportableNodeStructureClassIfc {
  isDefaultExport: boolean;
  isExported: boolean;
}

interface ExportAssignmentStructureClassIfc {
  readonly kind: StructureKind.ExportAssignment;
  expression: stringOrWriterFunction;
  isExportEquals: boolean;
}

interface ExportDeclarationStructureClassIfc {
  readonly kind: StructureKind.ExportDeclaration;
  attributes?: ImportAttributeImpl[];
  isTypeOnly: boolean;
  moduleSpecifier?: string;
  readonly namedExports: (ExportSpecifierImpl | stringOrWriterFunction)[];
  namespaceExport?: string;
}

interface ExportSpecifierStructureClassIfc {
  readonly kind: StructureKind.ExportSpecifier;
  alias?: string;
  isTypeOnly: boolean;
}

interface FunctionDeclarationOverloadStructureClassIfc {
  readonly kind: StructureKind.FunctionOverload;
}

interface FunctionDeclarationStructureClassIfc {
  readonly kind: StructureKind.Function;
  readonly overloads: FunctionDeclarationOverloadImpl[];
}

interface GeneratorableNodeStructureClassIfc {
  isGenerator: boolean;
}

interface GetAccessorDeclarationStructureClassIfc {
  readonly kind: StructureKind.GetAccessor;
  isStatic: boolean;
}

interface ImportAttributeStructureClassIfc {
  readonly kind: StructureKind.ImportAttribute;
  /** Expression value. Quote this when providing a string. */
  value: string;
}

interface ImportDeclarationStructureClassIfc {
  readonly kind: StructureKind.ImportDeclaration;
  attributes?: ImportAttributeImpl[];
  defaultImport?: string;
  isTypeOnly: boolean;
  moduleSpecifier: string;
  readonly namedImports: (ImportSpecifierImpl | stringOrWriterFunction)[];
  namespaceImport?: string;
}

interface ImportSpecifierStructureClassIfc {
  readonly kind: StructureKind.ImportSpecifier;
  alias?: string;
  isTypeOnly: boolean;
}

interface IndexSignatureDeclarationStructureClassIfc {
  readonly kind: StructureKind.IndexSignature;
  keyName?: string;
  keyType?: string;
  keyTypeStructure: TypeStructures | undefined;
}

interface InitializerExpressionableNodeStructureClassIfc {
  initializer?: stringOrWriterFunction;
}

interface InterfaceDeclarationStructureClassIfc {
  readonly kind: StructureKind.Interface;
  readonly callSignatures: CallSignatureDeclarationImpl[];
  readonly constructSignatures: ConstructSignatureDeclarationImpl[];
  /** Treat this as a read-only array.  Use `.extendsSet` to modify this. */
  readonly extends: stringOrWriterFunction[];
  readonly extendsSet: TypeStructureSet;
  readonly getAccessors: GetAccessorDeclarationImpl[];
  readonly indexSignatures: IndexSignatureDeclarationImpl[];
  readonly methods: MethodSignatureImpl[];
  readonly properties: PropertySignatureImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
}

interface JSDocableNodeStructureClassIfc {
  readonly docs: (JSDocImpl | string)[];
}

interface JSDocStructureClassIfc {
  readonly kind: StructureKind.JSDoc;
  /**
   * The description of the JS doc.
   * @remarks To force this to be multi-line, add a newline to the front of the string.
   */
  description?: stringOrWriterFunction;
  /** JS doc tags (ex. `&#64;param value - Some description.`). */
  readonly tags: JSDocTagImpl[];
}

interface JSDocTagStructureClassIfc {
  readonly kind: StructureKind.JSDocTag;
  /** The name for the JS doc tag that comes after the "at" symbol. */
  tagName: string;
  /** The text that follows the tag name. */
  text?: stringOrWriterFunction;
}

interface JsxAttributeStructureClassIfc {
  readonly kind: StructureKind.JsxAttribute;
  initializer?: string;
  name: JsxNamespacedNameStructure | string;
}

interface JsxElementStructureClassIfc {
  readonly kind: StructureKind.JsxElement;
  readonly attributes: (JsxAttributeImpl | JsxSpreadAttributeImpl)[];
  bodyText?: string;
  readonly children: (JsxElementImpl | JsxSelfClosingElementImpl)[];
}

interface JsxSelfClosingElementStructureClassIfc {
  readonly kind: StructureKind.JsxSelfClosingElement;
  readonly attributes: (JsxAttributeImpl | JsxSpreadAttributeImpl)[];
}

interface JsxSpreadAttributeStructureClassIfc {
  readonly kind: StructureKind.JsxSpreadAttribute;
  expression: string;
}

interface MethodDeclarationOverloadStructureClassIfc {
  readonly kind: StructureKind.MethodOverload;
  isStatic: boolean;
}

interface MethodDeclarationStructureClassIfc {
  readonly kind: StructureKind.Method;
  isStatic: boolean;
  readonly overloads: MethodDeclarationOverloadImpl[];
}

interface MethodSignatureStructureClassIfc {
  readonly kind: StructureKind.MethodSignature;
}

interface ModuleDeclarationStructureClassIfc {
  readonly kind: StructureKind.Module;
  /**
   * The module declaration kind.
   *
   * @remarks Defaults to "namespace".
   */
  declarationKind?: ModuleDeclarationKind;
}

interface NameableNodeStructureClassIfc {
  name?: string;
}

interface NamedNodeStructureClassIfc {
  name: string;
}

interface OverrideableNodeStructureClassIfc {
  hasOverrideKeyword: boolean;
}

interface ParameterDeclarationStructureClassIfc {
  readonly kind: StructureKind.Parameter;
  isRestParameter: boolean;
}

interface ParameteredNodeStructureClassIfc {
  readonly parameters: ParameterDeclarationImpl[];
}

interface PropertyAssignmentStructureClassIfc {
  readonly kind: StructureKind.PropertyAssignment;
  initializer: stringOrWriterFunction;
}

interface PropertyDeclarationStructureClassIfc {
  readonly kind: StructureKind.Property;
  hasAccessorKeyword: boolean;
  isStatic: boolean;
}

interface PropertySignatureStructureClassIfc {
  readonly kind: StructureKind.PropertySignature;
}

interface QuestionTokenableNodeStructureClassIfc {
  hasQuestionToken: boolean;
}

interface ReadonlyableNodeStructureClassIfc {
  isReadonly: boolean;
}

interface ReturnTypedNodeStructureClassIfc {
  returnType?: stringOrWriterFunction;
  returnTypeStructure: TypeStructures | undefined;
}

interface ScopedNodeStructureClassIfc {
  scope?: Scope;
}

interface SetAccessorDeclarationStructureClassIfc {
  readonly kind: StructureKind.SetAccessor;
  isStatic: boolean;
}

interface ShorthandPropertyAssignmentStructureClassIfc {
  readonly kind: StructureKind.ShorthandPropertyAssignment;
}

interface SourceFileStructureClassIfc {
  readonly kind: StructureKind.SourceFile;
}

interface SpreadAssignmentStructureClassIfc {
  readonly kind: StructureKind.SpreadAssignment;
  expression: stringOrWriterFunction;
}

interface StatementedNodeStructureClassIfc {
  readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
}

interface StructureClassIfc {
  /** Leading comments or whitespace. */
  readonly leadingTrivia: stringOrWriterFunction[];
  /** Trailing comments or whitespace. */
  readonly trailingTrivia: stringOrWriterFunction[];
}

interface TypeAliasDeclarationStructureClassIfc {
  readonly kind: StructureKind.TypeAlias;
  type: stringOrWriterFunction;
}

interface TypedNodeStructureClassIfc {
  type?: stringOrWriterFunction;
  typeStructure: TypeStructures | undefined;
}

interface TypeParameterDeclarationStructureClassIfc {
  readonly kind: StructureKind.TypeParameter;
  constraint?: stringOrWriterFunction;
  constraintStructure: TypeStructures | undefined;
  default?: stringOrWriterFunction;
  defaultStructure: TypeStructures | undefined;
  isConst: boolean;
  variance?: TypeParameterVariance;
}

interface TypeParameteredNodeStructureClassIfc {
  readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
}

interface VariableDeclarationStructureClassIfc {
  readonly kind: StructureKind.VariableDeclaration;
}

interface VariableStatementStructureClassIfc {
  readonly kind: StructureKind.VariableStatement;
  declarationKind?: VariableDeclarationKind;
  readonly declarations: VariableDeclarationImpl[];
}

declare const TypeParameterDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class TypeParameterDeclarationImpl extends TypeParameterDeclarationStructureBase implements TypeParameterDeclarationStructureClassIfc {
    #private;
    readonly kind: StructureKind.TypeParameter;
    isConst: boolean;
    variance?: TypeParameterVariance;
    constructor(name: string);
    get constraint(): stringOrWriterFunction | undefined;
    set constraint(value: stringOrWriterFunction | undefined);
    get constraintStructure(): TypeStructures | undefined;
    set constraintStructure(value: TypeStructures | undefined);
    get default(): stringOrWriterFunction | undefined;
    set default(value: stringOrWriterFunction | undefined);
    get defaultStructure(): TypeStructures | undefined;
    set defaultStructure(value: TypeStructures | undefined);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<TypeParameterDeclarationStructure>, target: TypeParameterDeclarationImpl): void;
    static clone(source: OptionalKind<TypeParameterDeclarationStructure>): TypeParameterDeclarationImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
    toJSON(): StructureClassToJSON<TypeParameterDeclarationImpl>;
}

/**
 * `boolean[]`
 *
 * @see `IndexedAccessTypeStructureImpl` for `Foo["index"]`
 * @see `TupleTypeStructureImpl` for `[number, boolean]`
 */
declare class ArrayTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Array> {
    #private;
    static clone(other: ArrayTypeStructureImpl): ArrayTypeStructureImpl;
    readonly kind = TypeStructureKind.Array;
    objectType: TypeStructures;
    constructor(objectType: TypeStructures);
    readonly writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

interface ConditionalTypeStructureParts {
    checkType: TypeStructures;
    extendsType: TypeStructures;
    trueType: TypeStructures;
    falseType: TypeStructures;
}
/** `checkType` extends `extendsType` ? `trueType` : `falseType` */
declare class ConditionalTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Conditional> {
    #private;
    static clone(other: ConditionalTypeStructureImpl): ConditionalTypeStructureImpl;
    readonly kind = TypeStructureKind.Conditional;
    checkType: TypeStructures;
    extendsType: TypeStructures;
    trueType: TypeStructures;
    falseType: TypeStructures;
    constructor(conditionalParts: Partial<ConditionalTypeStructureParts>);
    readonly writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

declare enum FunctionWriterStyle {
    Arrow = "Arrow",
    Method = "Method",
    GetAccessor = "GetAccessor",
    SetAccessor = "SetAccessor"
}
interface FunctionTypeContext {
    name: string | undefined;
    isConstructor: boolean;
    typeParameters: TypeParameterDeclarationImpl[];
    parameters: ParameterTypeStructureImpl[];
    restParameter: ParameterTypeStructureImpl | undefined;
    returnType: TypeStructures | undefined;
    writerStyle: FunctionWriterStyle;
}
/** ("new" | "get" | "set" | "") name<typeParameters>(parameters, ...restParameter) ("=\>" | ":" ) returnType */
declare class FunctionTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Function> {
    #private;
    static clone(other: FunctionTypeStructureImpl): FunctionTypeStructureImpl;
    readonly kind: TypeStructureKind.Function;
    name: string;
    isConstructor: boolean;
    typeParameters: TypeParameterDeclarationImpl[];
    parameters: ParameterTypeStructureImpl[];
    restParameter: ParameterTypeStructureImpl | undefined;
    returnType: TypeStructures | undefined;
    writerStyle: FunctionWriterStyle;
    constructor(context: Partial<FunctionTypeContext>);
    writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/**
 * Literals (boolean, number, string, void, etc.), without quotes, brackets, or
 * anything else around them.  Leaf nodes.
 */
declare class LiteralTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Literal> {
    #private;
    /**
     * Gets a singleton `LiteralTypeStructureImpl` for the given name.
     */
    static get(name: string): LiteralTypeStructureImpl;
    static clone(other: LiteralTypeStructureImpl): LiteralTypeStructureImpl;
    readonly kind = TypeStructureKind.Literal;
    readonly stringValue: string;
    constructor(literal: string);
    readonly writerFunction: WriterFunction;
}

/** @example `import("ts-morph").StatementStructures` */
declare class ImportTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Import> {
    #private;
    readonly kind: TypeStructureKind.Import;
    readonly childTypes: TypeStructures[];
    constructor(argument: StringTypeStructureImpl, qualifier: LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null, typeArguments: TypeStructures[]);
    get argument(): StringTypeStructureImpl;
    set argument(value: StringTypeStructureImpl);
    get qualifier(): LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null;
    set qualifier(value: LiteralTypeStructureImpl | QualifiedNameTypeStructureImpl | null);
    readonly writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
    static clone(other: ImportTypeStructureImpl): ImportTypeStructureImpl;
}

/**
 * @example
 * `Foo["index"]`
 *
 * @see `ArrayTypeStructureImpl` for `boolean[]`
 * @see `MappedTypeStructureImpl` for `{ [key in keyof Foo]: boolean}`
 * @see `MemberedObjectTypeStructureImpl` for `{ [key: string]: boolean }`
 */
declare class IndexedAccessTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.IndexedAccess, [
    TypeStructures
]> {
    static clone(other: IndexedAccessTypeStructureImpl): IndexedAccessTypeStructureImpl;
    readonly kind = TypeStructureKind.IndexedAccess;
    objectType: TypeStructures;
    readonly childTypes: [TypeStructures];
    protected readonly startToken = "[";
    protected readonly joinChildrenToken = "";
    protected readonly endToken = "]";
    protected readonly maxChildCount = 1;
    constructor(objectType: TypeStructures, indexType: TypeStructures);
}

/** @example infer \<type\> (extends \<type\>)? */
declare class InferTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Infer> {
    #private;
    readonly kind: TypeStructureKind.Infer;
    typeParameter: TypeParameterDeclarationImpl;
    constructor(typeParameter: TypeParameterDeclarationImpl);
    readonly writerFunction: WriterFunction;
    static clone(other: InferTypeStructureImpl): InferTypeStructureImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/** @example `Foo & Bar & ...` */
declare class IntersectionTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.Intersection, TypeStructures[]> {
    static clone(other: IntersectionTypeStructureImpl): IntersectionTypeStructureImpl;
    readonly kind = TypeStructureKind.Intersection;
    protected readonly objectType: null;
    childTypes: TypeStructures[];
    protected readonly startToken = "";
    protected readonly joinChildrenToken = " & ";
    protected readonly endToken = "";
    protected readonly maxChildCount: number;
    constructor(childTypes?: TypeStructures[]);
}

/**
 * `{ readonly [key in keyof Foo]: boolean }`
 *
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 * @see `ObjectLiteralTypedStructureImpl` for `{ [key: string]: boolean }`
 */
declare class MappedTypeStructureImpl extends TypeStructuresWithTypeParameters<TypeStructureKind.Mapped> {
    #private;
    readonly kind: TypeStructureKind.Mapped;
    readonlyToken: "+readonly" | "-readonly" | "readonly" | undefined;
    parameter: TypeParameterDeclarationImpl;
    asName: TypeStructures | undefined;
    questionToken: "+?" | "-?" | "?" | undefined;
    type: TypeStructures | undefined;
    constructor(parameter: TypeParameterDeclarationImpl);
    readonly writerFunction: WriterFunction;
    static clone(other: MappedTypeStructureImpl): MappedTypeStructureImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/**
 * Properties, methods, getters, setters, and index signatures.  Very much like interfaces.  Usually in type aliases.
 * @example
 * ```typescript
 * {
 *    (callSignatureArgument) => string;
 *    new (constructSignatureArgument) => ClassName;
 *    get getterName(): symbol;
 *    [indexSignatureKey: string]: boolean;
 *    property: number;
 *    method(): void;
 *    set setterName(value: symbol);
 * }
 * ```
 *
 * @see `MappedTypeStructureImpl` for `{ readonly [key in keyof Foo]: boolean }`
 */
declare class MemberedObjectTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.MemberedObject> {
    #private;
    static clone(other: MemberedObjectTypeStructureImpl): MemberedObjectTypeStructureImpl;
    readonly kind = TypeStructureKind.MemberedObject;
    readonly callSignatures: CallSignatureDeclarationImpl[];
    readonly constructSignatures: ConstructSignatureDeclarationImpl[];
    readonly getAccessors: GetAccessorDeclarationImpl[];
    readonly indexSignatures: IndexSignatureDeclarationImpl[];
    readonly methods: MethodSignatureImpl[];
    readonly properties: PropertySignatureImpl[];
    readonly setAccessors: SetAccessorDeclarationImpl[];
    constructor();
    writerFunction: (writer: CodeBlockWriter) => void;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/**
 * Numbers (boolean, number, string, void, etc.), without quotes, brackets, or
 * anything else around them.  Leaf nodes.
 */
declare class NumberTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Number> {
    #private;
    /**
     * Gets a singleton `NumberTypeStructureImpl` for the given name.
     */
    static get(name: number): NumberTypeStructureImpl;
    static clone(other: NumberTypeStructureImpl): NumberTypeStructureImpl;
    readonly kind = TypeStructureKind.Number;
    readonly numberValue: number;
    constructor(value: number);
    readonly writerFunction: WriterFunction;
}

/** Just a parameter name and type for a `FunctionTypeStructureImpl`. */
declare class ParameterTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Parameter> {
    #private;
    static clone(other: ParameterTypeStructureImpl): ParameterTypeStructureImpl;
    readonly kind = TypeStructureKind.Parameter;
    readonly writerFunction: (writer: CodeBlockWriter) => void;
    name: string;
    typeStructure: TypeStructures | undefined;
    constructor(name: string, typeStructure: TypeStructures | undefined);
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/** Wrap the child type in parentheses. */
declare class ParenthesesTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.Parentheses, [
    TypeStructures
]> {
    static clone(other: ParenthesesTypeStructureImpl): ParenthesesTypeStructureImpl;
    readonly kind = TypeStructureKind.Parentheses;
    protected readonly objectType: null;
    readonly childTypes: [TypeStructures];
    protected readonly startToken = "(";
    protected readonly joinChildrenToken = "";
    protected readonly endToken = ")";
    protected readonly maxChildCount = 1;
    constructor(childType: TypeStructures);
}

type PrefixUnaryOperator = "..." | "keyof" | "typeof" | "readonly" | "unique";
/** `("..." | "keyof" | "typeof" | "readonly" | "unique")[]` (object type) */
declare class PrefixOperatorsTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.PrefixOperators> {
    #private;
    static clone(other: PrefixOperatorsTypeStructureImpl): PrefixOperatorsTypeStructureImpl;
    readonly kind = TypeStructureKind.PrefixOperators;
    operators: PrefixUnaryOperator[];
    objectType: TypeStructures;
    constructor(operators: readonly PrefixUnaryOperator[], objectType: TypeStructures);
    readonly writerFunction: WriterFunction;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/** @example `Foo.bar.baz...` */
declare class QualifiedNameTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.QualifiedName> {
    #private;
    static clone(other: QualifiedNameTypeStructureImpl): QualifiedNameTypeStructureImpl;
    readonly kind = TypeStructureKind.QualifiedName;
    childTypes: string[];
    constructor(childTypes?: string[]);
    readonly writerFunction: WriterFunction;
}

/** Strings, encased in double quotes.  Leaf nodes. */
declare class StringTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.String> {
    #private;
    /**
     * Gets a singleton `StringTypeStructureImpl` for the given name.
     */
    static get(name: string): StringTypeStructureImpl;
    static clone(other: StringTypeStructureImpl): StringTypeStructureImpl;
    readonly kind = TypeStructureKind.String;
    readonly stringValue: string;
    constructor(literal: string);
    readonly writerFunction: WriterFunction;
}

/** `one${"A" | "B"}two${"C" | "D"}three` */
declare class TemplateLiteralTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.TemplateLiteral> {
    #private;
    static clone(other: TemplateLiteralTypeStructureImpl): TemplateLiteralTypeStructureImpl;
    readonly kind = TypeStructureKind.TemplateLiteral;
    readonly writerFunction: WriterFunction;
    head: string;
    spans: [TypeStructures, string][];
    constructor(head: string, spans: [TypeStructures, string][]);
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/**
 * @example
 * `[number, boolean]`
 *
 * @see `ArrayTypeStructureImpl` for `boolean[]`
 * @see `IndexedAccessTypeStructureImpl` for `Foo["index"]`
 */
declare class TupleTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.Tuple, TypeStructures[]> {
    static clone(other: TupleTypeStructureImpl): TupleTypeStructureImpl;
    readonly kind = TypeStructureKind.Tuple;
    protected readonly objectType: null;
    childTypes: TypeStructures[];
    protected readonly startToken = "[";
    protected readonly joinChildrenToken = ", ";
    protected readonly endToken = "]";
    protected readonly maxChildCount: number;
    constructor(childTypes?: TypeStructures[]);
}

/**
 * This resolves type parameters, as opposed to defining them.
 *
 * @example
 * `Pick<NumberStringType, "repeatForward">`
 *
 * @see `TypeParameterDeclarationImpl` for `Type<Foo extends object>`
 */
declare class TypeArgumentedTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.TypeArgumented, TypeStructures[]> {
    static clone(other: TypeArgumentedTypeStructureImpl): TypeArgumentedTypeStructureImpl;
    readonly kind = TypeStructureKind.TypeArgumented;
    objectType: TypeStructures;
    childTypes: TypeStructures[];
    protected readonly startToken = "<";
    protected readonly joinChildrenToken = ", ";
    protected readonly endToken = ">";
    protected readonly maxChildCount: number;
    constructor(objectType: TypeStructures, childTypes?: TypeStructures[]);
}

/** @example assert condition is true */
declare class TypePredicateTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.TypePredicate> {
    #private;
    readonly kind: TypeStructureKind.TypePredicate;
    hasAssertsKeyword: boolean;
    parameterName: LiteralTypeStructureImpl;
    isType: TypeStructures | null;
    constructor(hasAssertsKeyword: boolean, parameterName: LiteralTypeStructureImpl, isType?: TypeStructures | null);
    readonly writerFunction: WriterFunction;
    static clone(other: TypePredicateTypeStructureImpl): TypePredicateTypeStructureImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
}

/** @example `Foo | Bar | ...` */
declare class UnionTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.Union, TypeStructures[]> {
    static clone(other: UnionTypeStructureImpl): UnionTypeStructureImpl;
    readonly kind = TypeStructureKind.Union;
    protected readonly objectType: null;
    childTypes: TypeStructures[];
    protected readonly startToken = "";
    protected readonly joinChildrenToken = " | ";
    protected readonly endToken = "";
    protected readonly maxChildCount: number;
    constructor(childTypes?: TypeStructures[]);
}

/** Wrappers for writer functions from external sources.  Leaf nodes. */
declare class WriterTypeStructureImpl extends TypeStructuresBase<TypeStructureKind.Writer> {
    static clone(other: WriterTypeStructureImpl): WriterTypeStructureImpl;
    readonly kind = TypeStructureKind.Writer;
    readonly writerFunction: WriterFunction;
    constructor(writer: WriterFunction);
}

type TypeStructures = ArrayTypeStructureImpl | ConditionalTypeStructureImpl | FunctionTypeStructureImpl | ImportTypeStructureImpl | IndexedAccessTypeStructureImpl | InferTypeStructureImpl | IntersectionTypeStructureImpl | LiteralTypeStructureImpl | MappedTypeStructureImpl | MemberedObjectTypeStructureImpl | NumberTypeStructureImpl | ParameterTypeStructureImpl | ParenthesesTypeStructureImpl | PrefixOperatorsTypeStructureImpl | QualifiedNameTypeStructureImpl | StringTypeStructureImpl | TemplateLiteralTypeStructureImpl | TupleTypeStructureImpl | TypeArgumentedTypeStructureImpl | TypePredicateTypeStructureImpl | UnionTypeStructureImpl | WriterTypeStructureImpl;
type TypeStructuresOrNull = TypeStructures | null;

declare const DecoratorStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class DecoratorImpl extends DecoratorStructureBase implements DecoratorStructureClassIfc {
    readonly kind: StructureKind.Decorator;
    /**
     * Arguments for a decorator factory.
     * @remarks Provide an empty array to make the structure a decorator factory.
     */
    readonly arguments: stringOrWriterFunction[];
    readonly typeArguments: string[];
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<DecoratorStructure>, target: DecoratorImpl): void;
    static clone(source: OptionalKind<DecoratorStructure>): DecoratorImpl;
    toJSON(): StructureClassToJSON<DecoratorImpl>;
}

declare const ParameterDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly decorators: DecoratorImpl[];
    name: string;
    hasOverrideKeyword: boolean;
    hasQuestionToken: boolean;
    isReadonly: boolean;
    type?: stringOrWriterFunction | undefined;
    typeStructure: TypeStructures | undefined;
    initializer?: stringOrWriterFunction | undefined;
}, typeof StructureBase>;
declare class ParameterDeclarationImpl extends ParameterDeclarationStructureBase implements ParameterDeclarationStructureClassIfc {
    readonly kind: StructureKind.Parameter;
    isRestParameter: boolean;
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ParameterDeclarationStructure>, target: ParameterDeclarationImpl): void;
    static clone(source: OptionalKind<ParameterDeclarationStructure>): ParameterDeclarationImpl;
    toJSON(): StructureClassToJSON<ParameterDeclarationImpl>;
}

declare const JSDocStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class JSDocImpl extends JSDocStructureBase implements JSDocStructureClassIfc {
    readonly kind: StructureKind.JSDoc;
    /**
     * The description of the JS doc.
     * @remarks To force this to be multi-line, add a newline to the front of the string.
     */
    description?: stringOrWriterFunction;
    /** JS doc tags (ex. `&#64;param value - Some description.`). */
    readonly tags: JSDocTagImpl[];
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<JSDocStructure>, target: JSDocImpl): void;
    static clone(source: OptionalKind<JSDocStructure>): JSDocImpl;
    toJSON(): StructureClassToJSON<JSDocImpl>;
}

declare const CallSignatureDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
}, typeof StructureBase>;
declare class CallSignatureDeclarationImpl extends CallSignatureDeclarationStructureBase implements CallSignatureDeclarationStructureClassIfc {
    readonly kind: StructureKind.CallSignature;
    static clone(source: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclarationImpl;
    toJSON(): StructureClassToJSON<CallSignatureDeclarationImpl>;
}

declare const ClassDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    readonly decorators: DecoratorImpl[];
    isAbstract: boolean;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
    name?: string | undefined;
}, typeof StructureBase>;
declare class ClassDeclarationImpl extends ClassDeclarationStructureBase implements ClassDeclarationStructureClassIfc {
    #private;
    readonly kind: StructureKind.Class;
    readonly ctors: ConstructorDeclarationImpl[];
    readonly getAccessors: GetAccessorDeclarationImpl[];
    readonly implementsSet: TypeStructureSet;
    readonly methods: MethodDeclarationImpl[];
    readonly properties: PropertyDeclarationImpl[];
    readonly setAccessors: SetAccessorDeclarationImpl[];
    readonly staticBlocks: ClassStaticBlockDeclarationImpl[];
    get extends(): stringOrWriterFunction | undefined;
    set extends(value: stringOrWriterFunction | undefined);
    get extendsStructure(): TypeStructures | undefined;
    set extendsStructure(value: TypeStructures | undefined);
    /** Treat this as a read-only array.  Use `.implementsSet` to modify this. */
    get implements(): stringOrWriterFunction[];
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ClassDeclarationStructure>, target: ClassDeclarationImpl): void;
    static clone(source: OptionalKind<ClassDeclarationStructure>): ClassDeclarationImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
    toJSON(): StructureClassToJSON<ClassDeclarationImpl>;
}

declare const ClassStaticBlockDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class ClassStaticBlockDeclarationImpl extends ClassStaticBlockDeclarationStructureBase implements ClassStaticBlockDeclarationStructureClassIfc {
    readonly kind: StructureKind.ClassStaticBlock;
    static clone(source: OptionalKind<ClassStaticBlockDeclarationStructure>): ClassStaticBlockDeclarationImpl;
    toJSON(): StructureClassToJSON<ClassStaticBlockDeclarationImpl>;
}

declare const ConstructorDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
}, typeof StructureBase>;
declare class ConstructorDeclarationImpl extends ConstructorDeclarationStructureBase implements ConstructorDeclarationStructureClassIfc {
    readonly kind: StructureKind.Constructor;
    readonly overloads: ConstructorDeclarationOverloadImpl[];
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ConstructorDeclarationStructure>, target: ConstructorDeclarationImpl): void;
    static clone(source: OptionalKind<ConstructorDeclarationStructure>): ConstructorDeclarationImpl;
    static fromSignature(signature: ConstructSignatureDeclarationImpl): ConstructorDeclarationImpl;
    toJSON(): StructureClassToJSON<ConstructorDeclarationImpl>;
}

declare const ConstructorDeclarationOverloadStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
}, typeof StructureBase>;
declare class ConstructorDeclarationOverloadImpl extends ConstructorDeclarationOverloadStructureBase implements ConstructorDeclarationOverloadStructureClassIfc {
    readonly kind: StructureKind.ConstructorOverload;
    static clone(source: OptionalKind<ConstructorDeclarationOverloadStructure>): ConstructorDeclarationOverloadImpl;
    toJSON(): StructureClassToJSON<ConstructorDeclarationOverloadImpl>;
}

declare const ConstructSignatureDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
}, typeof StructureBase>;
declare class ConstructSignatureDeclarationImpl extends ConstructSignatureDeclarationStructureBase implements ConstructSignatureDeclarationStructureClassIfc {
    readonly kind: StructureKind.ConstructSignature;
    static clone(source: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclarationImpl;
    toJSON(): StructureClassToJSON<ConstructSignatureDeclarationImpl>;
}

declare const EnumDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
}, typeof StructureBase>;
declare class EnumDeclarationImpl extends EnumDeclarationStructureBase implements EnumDeclarationStructureClassIfc {
    readonly kind: StructureKind.Enum;
    isConst: boolean;
    readonly members: EnumMemberImpl[];
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<EnumDeclarationStructure>, target: EnumDeclarationImpl): void;
    static clone(source: OptionalKind<EnumDeclarationStructure>): EnumDeclarationImpl;
    toJSON(): StructureClassToJSON<EnumDeclarationImpl>;
}

declare const EnumMemberStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
    initializer?: stringOrWriterFunction | undefined;
}, typeof StructureBase>;
declare class EnumMemberImpl extends EnumMemberStructureBase implements EnumMemberStructureClassIfc {
    readonly kind: StructureKind.EnumMember;
    /** Convenience property for setting the initializer. */
    value?: number | string;
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<EnumMemberStructure>, target: EnumMemberImpl): void;
    static clone(source: OptionalKind<EnumMemberStructure>): EnumMemberImpl;
    toJSON(): StructureClassToJSON<EnumMemberImpl>;
}

declare const ExportAssignmentStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class ExportAssignmentImpl extends ExportAssignmentStructureBase implements ExportAssignmentStructureClassIfc {
    readonly kind: StructureKind.ExportAssignment;
    expression: stringOrWriterFunction;
    isExportEquals: boolean;
    constructor(expression: stringOrWriterFunction);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ExportAssignmentStructure>, target: ExportAssignmentImpl): void;
    static clone(source: OptionalKind<ExportAssignmentStructure>): ExportAssignmentImpl;
    toJSON(): StructureClassToJSON<ExportAssignmentImpl>;
}

declare const ExportDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class ExportDeclarationImpl extends ExportDeclarationStructureBase implements ExportDeclarationStructureClassIfc {
    readonly kind: StructureKind.ExportDeclaration;
    attributes?: ImportAttributeImpl[];
    isTypeOnly: boolean;
    moduleSpecifier?: string;
    readonly namedExports: (ExportSpecifierImpl | stringOrWriterFunction)[];
    namespaceExport?: string;
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ExportDeclarationStructure>, target: ExportDeclarationImpl): void;
    static clone(source: OptionalKind<ExportDeclarationStructure>): ExportDeclarationImpl;
    toJSON(): StructureClassToJSON<ExportDeclarationImpl>;
}

declare const ExportSpecifierStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class ExportSpecifierImpl extends ExportSpecifierStructureBase implements ExportSpecifierStructureClassIfc {
    readonly kind: StructureKind.ExportSpecifier;
    alias?: string;
    isTypeOnly: boolean;
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ExportSpecifierStructure>, target: ExportSpecifierImpl): void;
    static clone(source: OptionalKind<ExportSpecifierStructure>): ExportSpecifierImpl;
    toJSON(): StructureClassToJSON<ExportSpecifierImpl>;
}

declare const FunctionDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    isAsync: boolean;
    isGenerator: boolean;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
    name?: string | undefined;
}, typeof StructureBase>;
declare class FunctionDeclarationImpl extends FunctionDeclarationStructureBase implements FunctionDeclarationStructureClassIfc {
    readonly kind: StructureKind.Function;
    readonly overloads: FunctionDeclarationOverloadImpl[];
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<FunctionDeclarationStructure>, target: FunctionDeclarationImpl): void;
    static clone(source: OptionalKind<FunctionDeclarationStructure>): FunctionDeclarationImpl;
    toJSON(): StructureClassToJSON<FunctionDeclarationImpl>;
}

declare const FunctionDeclarationOverloadStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    isAsync: boolean;
    isGenerator: boolean;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
}, typeof StructureBase>;
declare class FunctionDeclarationOverloadImpl extends FunctionDeclarationOverloadStructureBase implements FunctionDeclarationOverloadStructureClassIfc {
    readonly kind: StructureKind.FunctionOverload;
    static clone(source: OptionalKind<FunctionDeclarationOverloadStructure>): FunctionDeclarationOverloadImpl;
    toJSON(): StructureClassToJSON<FunctionDeclarationOverloadImpl>;
}

declare const GetAccessorDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    readonly decorators: DecoratorImpl[];
    isAbstract: boolean;
    name: string;
}, typeof StructureBase>;
declare class GetAccessorDeclarationImpl extends GetAccessorDeclarationStructureBase implements GetAccessorDeclarationStructureClassIfc {
    readonly kind: StructureKind.GetAccessor;
    isStatic: boolean;
    constructor(isStatic: boolean, name: string, returnType?: TypeStructures);
    static clone(source: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclarationImpl;
    toJSON(): StructureClassToJSON<GetAccessorDeclarationImpl>;
}

declare const ImportAttributeStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class ImportAttributeImpl extends ImportAttributeStructureBase implements ImportAttributeStructureClassIfc {
    readonly kind: StructureKind.ImportAttribute;
    /** Expression value. Quote this when providing a string. */
    value: string;
    constructor(name: string, value: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ImportAttributeStructure>, target: ImportAttributeImpl): void;
    static clone(source: OptionalKind<ImportAttributeStructure>): ImportAttributeImpl;
    toJSON(): StructureClassToJSON<ImportAttributeImpl>;
}

declare const ImportDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class ImportDeclarationImpl extends ImportDeclarationStructureBase implements ImportDeclarationStructureClassIfc {
    readonly kind: StructureKind.ImportDeclaration;
    attributes?: ImportAttributeImpl[];
    defaultImport?: string;
    isTypeOnly: boolean;
    moduleSpecifier: string;
    readonly namedImports: (ImportSpecifierImpl | stringOrWriterFunction)[];
    namespaceImport?: string;
    constructor(moduleSpecifier: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ImportDeclarationStructure>, target: ImportDeclarationImpl): void;
    static clone(source: OptionalKind<ImportDeclarationStructure>): ImportDeclarationImpl;
    toJSON(): StructureClassToJSON<ImportDeclarationImpl>;
}

declare const ImportSpecifierStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class ImportSpecifierImpl extends ImportSpecifierStructureBase implements ImportSpecifierStructureClassIfc {
    readonly kind: StructureKind.ImportSpecifier;
    alias?: string;
    isTypeOnly: boolean;
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ImportSpecifierStructure>, target: ImportSpecifierImpl): void;
    static clone(source: OptionalKind<ImportSpecifierStructure>): ImportSpecifierImpl;
    toJSON(): StructureClassToJSON<ImportSpecifierImpl>;
}

declare const IndexSignatureDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    isReadonly: boolean;
}, typeof StructureBase>;
declare class IndexSignatureDeclarationImpl extends IndexSignatureDeclarationStructureBase implements IndexSignatureDeclarationStructureClassIfc {
    #private;
    readonly kind: StructureKind.IndexSignature;
    keyName?: string;
    get keyType(): string | undefined;
    set keyType(value: string | undefined);
    get keyTypeStructure(): TypeStructures | undefined;
    set keyTypeStructure(value: TypeStructures | undefined);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<IndexSignatureDeclarationStructure>, target: IndexSignatureDeclarationImpl): void;
    static clone(source: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclarationImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
    toJSON(): StructureClassToJSON<IndexSignatureDeclarationImpl>;
}

declare const InterfaceDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    name: string;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
}, typeof StructureBase>;
declare class InterfaceDeclarationImpl extends InterfaceDeclarationStructureBase implements InterfaceDeclarationStructureClassIfc {
    #private;
    readonly kind: StructureKind.Interface;
    readonly callSignatures: CallSignatureDeclarationImpl[];
    readonly constructSignatures: ConstructSignatureDeclarationImpl[];
    readonly extendsSet: TypeStructureSet;
    readonly getAccessors: GetAccessorDeclarationImpl[];
    readonly indexSignatures: IndexSignatureDeclarationImpl[];
    readonly methods: MethodSignatureImpl[];
    readonly properties: PropertySignatureImpl[];
    readonly setAccessors: SetAccessorDeclarationImpl[];
    constructor(name: string);
    /** Treat this as a read-only array.  Use `.extendsSet` to modify this. */
    get extends(): stringOrWriterFunction[];
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<InterfaceDeclarationStructure>, target: InterfaceDeclarationImpl): void;
    static clone(source: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclarationImpl;
    /** @internal */
    [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures>;
    toJSON(): StructureClassToJSON<InterfaceDeclarationImpl>;
}

declare const JSDocTagStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class JSDocTagImpl extends JSDocTagStructureBase implements JSDocTagStructureClassIfc {
    readonly kind: StructureKind.JSDocTag;
    /** The name for the JS doc tag that comes after the "at" symbol. */
    tagName: string;
    /** The text that follows the tag name. */
    text?: stringOrWriterFunction;
    constructor(tagName: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<JSDocTagStructure>, target: JSDocTagImpl): void;
    static clone(source: OptionalKind<JSDocTagStructure>): JSDocTagImpl;
    toJSON(): StructureClassToJSON<JSDocTagImpl>;
}

declare const JsxAttributeStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class JsxAttributeImpl extends JsxAttributeStructureBase implements JsxAttributeStructureClassIfc {
    readonly kind: StructureKind.JsxAttribute;
    initializer?: string;
    name: JsxNamespacedNameStructure | string;
    constructor(name: JsxNamespacedNameStructure | string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<JsxAttributeStructure>, target: JsxAttributeImpl): void;
    static clone(source: OptionalKind<JsxAttributeStructure>): JsxAttributeImpl;
    toJSON(): StructureClassToJSON<JsxAttributeImpl>;
}

declare const JsxElementStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class JsxElementImpl extends JsxElementStructureBase implements JsxElementStructureClassIfc {
    readonly kind: StructureKind.JsxElement;
    readonly attributes: (JsxAttributeImpl | JsxSpreadAttributeImpl)[];
    bodyText?: string;
    readonly children: (JsxElementImpl | JsxSelfClosingElementImpl)[];
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<JsxElementStructure>, target: JsxElementImpl): void;
    static clone(source: OptionalKind<JsxElementStructure>): JsxElementImpl;
    toJSON(): StructureClassToJSON<JsxElementImpl>;
}

declare const JsxSelfClosingElementStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class JsxSelfClosingElementImpl extends JsxSelfClosingElementStructureBase implements JsxSelfClosingElementStructureClassIfc {
    readonly kind: StructureKind.JsxSelfClosingElement;
    readonly attributes: (JsxAttributeImpl | JsxSpreadAttributeImpl)[];
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<JsxSelfClosingElementStructure>, target: JsxSelfClosingElementImpl): void;
    static clone(source: OptionalKind<JsxSelfClosingElementStructure>): JsxSelfClosingElementImpl;
    toJSON(): StructureClassToJSON<JsxSelfClosingElementImpl>;
}

declare const JsxSpreadAttributeStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class JsxSpreadAttributeImpl extends JsxSpreadAttributeStructureBase implements JsxSpreadAttributeStructureClassIfc {
    readonly kind: StructureKind.JsxSpreadAttribute;
    expression: string;
    constructor(expression: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<JsxSpreadAttributeStructure>, target: JsxSpreadAttributeImpl): void;
    static clone(source: OptionalKind<JsxSpreadAttributeStructure>): JsxSpreadAttributeImpl;
    toJSON(): StructureClassToJSON<JsxSpreadAttributeImpl>;
}

declare const MethodDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    readonly decorators: DecoratorImpl[];
    isAbstract: boolean;
    name: string;
    isAsync: boolean;
    isGenerator: boolean;
    hasOverrideKeyword: boolean;
    hasQuestionToken: boolean;
}, typeof StructureBase>;
declare class MethodDeclarationImpl extends MethodDeclarationStructureBase implements MethodDeclarationStructureClassIfc {
    readonly kind: StructureKind.Method;
    isStatic: boolean;
    readonly overloads: MethodDeclarationOverloadImpl[];
    constructor(isStatic: boolean, name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<MethodDeclarationStructure>, target: MethodDeclarationImpl): void;
    static clone(source: OptionalKind<MethodDeclarationStructure>): MethodDeclarationImpl;
    static fromSignature(isStatic: boolean, signature: MethodSignatureImpl): MethodDeclarationImpl;
    toJSON(): StructureClassToJSON<MethodDeclarationImpl>;
}

declare const MethodDeclarationOverloadStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    isAbstract: boolean;
    isAsync: boolean;
    isGenerator: boolean;
    hasOverrideKeyword: boolean;
    hasQuestionToken: boolean;
}, typeof StructureBase>;
declare class MethodDeclarationOverloadImpl extends MethodDeclarationOverloadStructureBase implements MethodDeclarationOverloadStructureClassIfc {
    readonly kind: StructureKind.MethodOverload;
    isStatic: boolean;
    constructor(isStatic: boolean);
    static clone(source: OptionalKind<MethodDeclarationOverloadStructure>): MethodDeclarationOverloadImpl;
    toJSON(): StructureClassToJSON<MethodDeclarationOverloadImpl>;
}

declare const MethodSignatureStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    name: string;
    hasQuestionToken: boolean;
}, typeof StructureBase>;
declare class MethodSignatureImpl extends MethodSignatureStructureBase implements MethodSignatureStructureClassIfc {
    readonly kind: StructureKind.MethodSignature;
    constructor(name: string);
    static clone(source: OptionalKind<MethodSignatureStructure>): MethodSignatureImpl;
    toJSON(): StructureClassToJSON<MethodSignatureImpl>;
}

declare const ModuleDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
}, typeof StructureBase>;
declare class ModuleDeclarationImpl extends ModuleDeclarationStructureBase implements ModuleDeclarationStructureClassIfc {
    readonly kind: StructureKind.Module;
    /**
     * The module declaration kind.
     *
     * @remarks Defaults to "namespace".
     */
    declarationKind?: ModuleDeclarationKind;
    constructor(name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<ModuleDeclarationStructure>, target: ModuleDeclarationImpl): void;
    static clone(source: OptionalKind<ModuleDeclarationStructure>): ModuleDeclarationImpl;
    toJSON(): StructureClassToJSON<ModuleDeclarationImpl>;
}

declare const PropertyAssignmentStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class PropertyAssignmentImpl extends PropertyAssignmentStructureBase implements PropertyAssignmentStructureClassIfc {
    readonly kind: StructureKind.PropertyAssignment;
    initializer: stringOrWriterFunction;
    constructor(name: string, initializer: stringOrWriterFunction);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<PropertyAssignmentStructure>, target: PropertyAssignmentImpl): void;
    static clone(source: OptionalKind<PropertyAssignmentStructure>): PropertyAssignmentImpl;
    toJSON(): StructureClassToJSON<PropertyAssignmentImpl>;
}

declare const PropertyDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly decorators: DecoratorImpl[];
    isAbstract: boolean;
    name: string;
    hasOverrideKeyword: boolean;
    hasQuestionToken: boolean;
    hasExclamationToken: boolean;
    isReadonly: boolean;
    type?: stringOrWriterFunction | undefined;
    typeStructure: TypeStructures | undefined;
    initializer?: stringOrWriterFunction | undefined;
    hasDeclareKeyword: boolean;
}, typeof StructureBase>;
declare class PropertyDeclarationImpl extends PropertyDeclarationStructureBase implements PropertyDeclarationStructureClassIfc {
    readonly kind: StructureKind.Property;
    hasAccessorKeyword: boolean;
    isStatic: boolean;
    constructor(isStatic: boolean, name: string);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<PropertyDeclarationStructure>, target: PropertyDeclarationImpl): void;
    static clone(source: OptionalKind<PropertyDeclarationStructure>): PropertyDeclarationImpl;
    static fromSignature(isStatic: boolean, signature: PropertySignatureImpl): PropertyDeclarationImpl;
    toJSON(): StructureClassToJSON<PropertyDeclarationImpl>;
}

declare const PropertySignatureStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
    hasQuestionToken: boolean;
    isReadonly: boolean;
    type?: stringOrWriterFunction | undefined;
    typeStructure: TypeStructures | undefined;
    initializer?: stringOrWriterFunction | undefined;
}, typeof StructureBase>;
declare class PropertySignatureImpl extends PropertySignatureStructureBase implements PropertySignatureStructureClassIfc {
    readonly kind: StructureKind.PropertySignature;
    constructor(name: string);
    static clone(source: OptionalKind<PropertySignatureStructure>): PropertySignatureImpl;
    toJSON(): StructureClassToJSON<PropertySignatureImpl>;
}

declare const SetAccessorDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    scope?: ts_morph.Scope | undefined;
    readonly parameters: ParameterDeclarationImpl[];
    returnType?: stringOrWriterFunction | undefined;
    returnTypeStructure: TypeStructures | undefined;
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    readonly decorators: DecoratorImpl[];
    isAbstract: boolean;
    name: string;
}, typeof StructureBase>;
declare class SetAccessorDeclarationImpl extends SetAccessorDeclarationStructureBase implements SetAccessorDeclarationStructureClassIfc {
    readonly kind: StructureKind.SetAccessor;
    isStatic: boolean;
    constructor(isStatic: boolean, name: string, setterParameter: ParameterDeclarationImpl);
    static clone(source: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclarationImpl;
    toJSON(): StructureClassToJSON<SetAccessorDeclarationImpl>;
}

declare const ShorthandPropertyAssignmentStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
}, typeof StructureBase>;
declare class ShorthandPropertyAssignmentImpl extends ShorthandPropertyAssignmentStructureBase implements ShorthandPropertyAssignmentStructureClassIfc {
    readonly kind: StructureKind.ShorthandPropertyAssignment;
    constructor(name: string);
    static clone(source: OptionalKind<ShorthandPropertyAssignmentStructure>): ShorthandPropertyAssignmentImpl;
    toJSON(): StructureClassToJSON<ShorthandPropertyAssignmentImpl>;
}

declare const SourceFileStructureBase: mixin_decorators.MixinClass<object, {
    readonly statements: (StatementStructureImpls | stringOrWriterFunction)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class SourceFileImpl extends SourceFileStructureBase implements SourceFileStructureClassIfc {
    readonly kind: StructureKind.SourceFile;
    static clone(source: OptionalKind<SourceFileStructure>): SourceFileImpl;
    toJSON(): StructureClassToJSON<SourceFileImpl>;
}

declare const SpreadAssignmentStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
}, typeof StructureBase>;
declare class SpreadAssignmentImpl extends SpreadAssignmentStructureBase implements SpreadAssignmentStructureClassIfc {
    readonly kind: StructureKind.SpreadAssignment;
    expression: stringOrWriterFunction;
    constructor(expression: stringOrWriterFunction);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<SpreadAssignmentStructure>, target: SpreadAssignmentImpl): void;
    static clone(source: OptionalKind<SpreadAssignmentStructure>): SpreadAssignmentImpl;
    toJSON(): StructureClassToJSON<SpreadAssignmentImpl>;
}

declare const TypeAliasDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
    name: string;
    type?: stringOrWriterFunction | undefined;
    typeStructure: TypeStructures | undefined;
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
}, typeof StructureBase>;
declare class TypeAliasDeclarationImpl extends TypeAliasDeclarationStructureBase implements TypeAliasDeclarationStructureClassIfc {
    readonly kind: StructureKind.TypeAlias;
    constructor(name: string, type: stringOrWriterFunction | TypeStructures);
    get type(): stringOrWriterFunction;
    set type(value: stringOrWriterFunction);
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<TypeAliasDeclarationStructure>, target: TypeAliasDeclarationImpl): void;
    static clone(source: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclarationImpl;
    toJSON(): StructureClassToJSON<TypeAliasDeclarationImpl>;
}

declare const VariableDeclarationStructureBase: mixin_decorators.MixinClass<object, {
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    name: string;
    hasExclamationToken: boolean;
    type?: stringOrWriterFunction | undefined;
    typeStructure: TypeStructures | undefined;
    initializer?: stringOrWriterFunction | undefined;
}, typeof StructureBase>;
declare class VariableDeclarationImpl extends VariableDeclarationStructureBase implements VariableDeclarationStructureClassIfc {
    readonly kind: StructureKind.VariableDeclaration;
    constructor(name: string);
    static clone(source: OptionalKind<VariableDeclarationStructure>): VariableDeclarationImpl;
    toJSON(): StructureClassToJSON<VariableDeclarationImpl>;
}

declare const VariableStatementStructureBase: mixin_decorators.MixinClass<object, {
    readonly docs: (JSDocImpl | string)[];
    readonly leadingTrivia: stringOrWriterFunction[];
    readonly trailingTrivia: stringOrWriterFunction[];
    hasDeclareKeyword: boolean;
    isDefaultExport: boolean;
    isExported: boolean;
}, typeof StructureBase>;
declare class VariableStatementImpl extends VariableStatementStructureBase implements VariableStatementStructureClassIfc {
    readonly kind: StructureKind.VariableStatement;
    declarationKind?: VariableDeclarationKind;
    readonly declarations: VariableDeclarationImpl[];
    /** @internal */
    static [COPY_FIELDS](source: OptionalKind<VariableStatementStructure>, target: VariableStatementImpl): void;
    static clone(source: OptionalKind<VariableStatementStructure>): VariableStatementImpl;
    toJSON(): StructureClassToJSON<VariableStatementImpl>;
}

/**
 * This is a map for specifying statements across several class members for a single class field.
 *
 * For example, a field may require statements for:
 * - defining a getter and/or a setter
 * - initializing in a constructor
 * - implementing a .toJSON() method
 *
 * The field name specifies which field the statements are about.
 * The statement group specifies where the statements go (what method, or an initializer).
 *
 * Special field keys:
 * ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL:
 *   These statements will appear at the head of the statement block.
 * ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN:
 *   These statements will appear at the tail of the statement block.
 *
 * Special statement group keys:
 * ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY:
 *   This represents an initializer for a property, or a value reference for a getter or setter.
 *   Field keys will have `get ` or `set ` stripped from them for this group key.
 *   Statement arrays for this group key should contain exactly one statement, and should be just a string.
 *
 * @example
 * ```typescript
 * map.set("foo", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, ['this.#foo.value']);
 * map.set("foo", "toJSON", ["rv.foo = this.foo;"]);
 * // ...
 * map.set(ClassFieldsStatementsMap.FIELD_HEAD_SUPER_CALL, "toJSON", ["const rv = super.toJSON();"]);
 * map.set(ClassFieldsStatementsMap.FIELD_TAIL_FINAL_RETURN, "toJSON", ["return rv;"]);
 *
 * Array.from(map.groupStatementsMap("toJSON")!.values())
 * // [["const rv = super.toJSON();"], ["rv.foo = this.foo;"], ["return rv;"]];
 * ```
 */
declare class ClassFieldStatementsMap {
    #private;
    static normalizeKeys(fieldName: string, statementGroup: string): [string, string];
    /** A special field name for the start of a function. */
    static readonly FIELD_HEAD_SUPER_CALL = "(super call)";
    /** A special field name for the end of a function. */
    static readonly FIELD_TAIL_FINAL_RETURN = "(final return)";
    static readonly GROUP_INITIALIZER_OR_PROPERTY = "(initializer or property reference)";
    /** A convenience sorting function for fields. */
    static fieldComparator(a: string, b: string): number;
    purposeKey?: string;
    regionName?: string;
    isBlockStatement: boolean;
    constructor(iterable?: [string, string, ClassFieldStatement[]][]);
    /**
     * The number of elements in this collection.
     * @returns The element count.
     */
    get size(): number;
    /**
     * Clear the collection.
     */
    clear(): void;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param fieldName - The class field name for the statements.
     * @param statementGroup - The statement group owning the statements.
     * @returns True if we found the statements and deleted it.
     */
    delete(fieldName: string, statementGroup: string): boolean;
    /**
     * Yield the key-statements tuples of the collection.
     */
    entries(): IterableIterator<[string, string, ClassFieldStatement[]]>;
    /**
     * Iterate over the keys and statementss.
     * @param __callback__ - A function to invoke for each iteration.
     * @param __thisArg__ -  statements to use as this when executing callback.
     */
    forEach(__callback__: (statements: ClassFieldStatement[], fieldName: string, statementGroup: string, __collection__: ClassFieldStatementsMap) => void, __thisArg__?: unknown): void;
    /**
     * Get a statements for a key set.
     *
     * @param fieldName - The class field name for the statements.
     * @param statementGroup - The statement group owning the statements.
     * @returns The statements.  Undefined if it isn't in the collection.
     */
    get(fieldName: string, statementGroup: string): ClassFieldStatement[] | undefined;
    /**
     * Report if the collection has a statements for a key set.
     *
     * @param fieldName - The class field name for the statements.
     * @param statementGroup - The statement group owning the statements.
     * @returns True if the key set refers to a statements in the collection.
     */
    has(fieldName: string, statementGroup: string): boolean;
    /**
     * Yield the key sets of the collection.
     */
    keys(): IterableIterator<[string, string]>;
    /**
     * Set a statements for a key set.
     *
     * @param fieldName - The class field name for the statements.
     * @param statementGroup - The statement group owning the statements.
     * @param statements - The statements.
     * @returns This collection.
     */
    set(fieldName: string, statementGroup: string, statements: ClassFieldStatement[]): this;
    /**
     * Yield the statementss of the collection.
     */
    values(): IterableIterator<ClassFieldStatement[]>;
    [Symbol.iterator](): IterableIterator<[
        string,
        string,
        ClassFieldStatement[]
    ]>;
    [Symbol.toStringTag]: string;
    groupKeys(): string[];
    /**
     * Get the current set of statements for each statement group, sorted by field name.
     * @param statementGroup - The statement group owning the statements.
     */
    groupStatementsMap(statementGroup: string): ReadonlyMap<string, ClassFieldStatement[]> | undefined;
}

declare class OrderedMap<K, V> extends Map<K, V> {
    sortEntries(comparator: (a: [K, V], b: [K, V]) => number): void;
}

/**
 * A map for class methods, properties, accessors and a constructor.  This doesn't
 * replace `ClassDeclarationImpl`, rather, it _feeds_ `ClassDeclarationImpl`.
 *
 * @example
 *
 * const map = new ClassMembersMap;
 * const foo = new PropertyDeclarationImpl(false, "foo");
 * map.addMembers([foo]);
 * // ...
 * const classDecl = new ClassDeclarationImpl;
 * classDecl.name = "FooClass";
 * map.moveMembersToClass(classDecl);
 * // classDecl.properties === [foo];
 */
declare class ClassMembersMap extends OrderedMap<string, ClassMemberImpl> {
    #private;
    /**
     * Get a map key from a potential class member.
     * @param member - the class member
     */
    static keyFromMember(member: ClassMemberImpl): string;
    /**
     * @param kind - the structure kind.
     * @param isStatic - true if the class member should be static.
     * @param name - the name of the class member.
     * @returns the map key to use.
     */
    static keyFromName(kind: ClassMemberImpl["kind"], isStatic: boolean, name: string): string;
    /**
     * Create a `ClassMembersMap` from a class declaration.
     * @param classDecl - the class declaration.
     * @returns the class members map.
     */
    static fromClassDeclaration(classDecl: ClassDeclarationImpl): ClassMembersMap;
    /**
     * Creata an array of class members from an array of type members,
     * @param isStatic - true if the class members should be static, false if they should not be.
     * @param typeMembers - the type members to convert.
     * @param map - for defining which type member a class member comes from.
     */
    static convertTypeMembers(isStatic: boolean, typeMembers: NamedTypeMemberImpl[], map?: WeakMap<ClassMemberImpl, TypeMemberImpl>): NamedClassMemberImpl[];
    /**
     * Add class members as values of this map, using standard keys.
     *
     * @param members - the class members to add.
     */
    addMembers(members: readonly ClassMemberImpl[]): void;
    /**
     * Get class members of a particular kind.
     *
     * @param kind - the structure kind to get.
     * @returns all current members of that kind.
     */
    arrayOfKind<Kind extends ClassMemberImpl["kind"]>(kind: Kind): Extract<ClassMemberImpl, KindedStructure<Kind>>[];
    /** Get a clone of this map. */
    clone(): ClassMembersMap;
    /**
     * Convert get and/or set accessors to a property.  This may be lossy, but we try to be faithful.
     * @param isStatic - true if the property is static (and the accessors should be)
     * @param name - the property name
     */
    convertAccessorsToProperty(isStatic: boolean, name: string): void;
    /**
     * Convert a property to get and/or set accessors.  This may be lossy, but we try to be faithful.
     * @param isStatic - true if the property is static (and the accessors should be)
     * @param name - the property name
     * @param toGetter - true if the caller wants a getter
     * @param toSetter - true if the caller wants a setter
     */
    convertPropertyToAccessors(isStatic: boolean, name: string, toGetter: boolean, toSetter: boolean): void;
    /**
     * A typed call to `this.get()` for a given kind.
     * @param kind - the structure kind.
     * @param isStatic - true if the member is static.
     * @param name - the name of the member.
     * @returns - the class member, as the right type, or undefined if the wrong type.
     *
     * @see `ClassMembersMap::keyFromName`
     */
    getAsKind<Kind extends ClassMemberImpl["kind"]>(kind: Kind, isStatic: boolean, name: string): Extract<ClassMemberImpl, KindedStructure<Kind>> | undefined;
    /**
     * Move class members from this map to a class declaration, and clear this map.
     * @param classSettings - a dictionary of optional `ClassDeclarationStructure` properties which this cannot otherwise cover.
     * @returns the new class declaration.
     */
    moveMembersToClass(classDecl: ClassDeclarationImpl): ClassDeclarationImpl;
    /**
     * Move statements from a sequence of statement maps to the class members.
     * @param statementsMaps - the statements to apply to each member, ordered by purpose.
     */
    moveStatementsToMembers(statementsMaps: ClassFieldStatementsMap[]): void;
    toJSON(): readonly ClassMemberImpl[];
}

/**
 * This manages export declarations and specifiers, for including in a source file.
 *
 * @example
 * ```typescript
 * publicExports.addExports({
 *   pathToExportedModule: path.join(distDir, "source/toolbox/ExportManager.ts"),
 *   exportNames: ["ExportManager"],
 *   isDefaultExport: true,
 *   isType: false,
 * });
 * // ...
 * sourceFile.statements.push(...publicExports.getDeclarations());
 * ```
 */
declare class ExportManager {
    #private;
    /** Where the file will live on the file system. */
    readonly absolutePathToExportFile: string;
    /**
     * @param absolutePathToExportFile - Where the file will live on the file system.
     */
    constructor(absolutePathToExportFile: string);
    /**
     * @param context - a description of the exports to add.
     */
    addExports(context: AddExportContext): void;
    /** Get the export declarations, sorted by path to file, then internally by specified export values. */
    getDeclarations(): ExportDeclarationImpl[];
}

type ArrayOrValue<T> = T | readonly T[];
/**
 * Iterates over the children of a structure (or type structure), or the elements of an array of structures and type structures.
 * @param structureOrArray - Structure or array of structures to iterate over.
 * @param callback - Callback to do on each structure, until the callback returns a truthy result.
 * @returns the first truthy result from the callback.
 *
 * @see {@link https://ts-morph.com/manipulation/structures#codeforeachstructurechildcode}
 */
declare function forEachAugmentedStructureChild<TStructure>(structureOrArray: ArrayOrValue<StructureImpls | TypeStructures>, callback: (child: StructureImpls | TypeStructures) => TStructure | void): TStructure | undefined;

/**
 * This manages import declarations and specifiers, for including in a source file.
 *
 * @example
 * ```typescript
 * importsManager.addImports({
 *   pathToImportedModule: "ts-morph",
 *   isPackageImport: true,
 *   importNames: ["Structure", "StructureKind"],
 *   isDefaultImport: false,
 *   isTypeOnly: true
 * });
 * // ...
 * sourceFile.statements.unshift(...importsManager.getDeclarations());
 * ```
 */
declare class ImportManager {
    #private;
    /** Where the file will live on the file system. */
    readonly absolutePathToModule: string;
    /**
     * @param absolutePathToModule - Where the file will live on the file system.
     */
    constructor(absolutePathToModule: string);
    /**
     * @param context - a description of the imports to add.
     */
    addImports(context: AddImportContext): void;
    /** Get the import declarations, sorted by path to file, then internally by specified import values. */
    getDeclarations(): ImportDeclarationImpl[];
}

interface InsertedMemberKey {
    readonly isFieldStatic: boolean;
    readonly fieldType: PropertySignatureImpl;
    readonly isGroupStatic: boolean;
    readonly groupType: GetAccessorDeclarationImpl | SetAccessorDeclarationImpl | MethodSignatureImpl | "constructor" | "(initializer or property reference)";
}
/**
 * Bitwise flags to enable statement getter traps.
 */
declare enum ClassSupportsStatementsFlags {
    /** The initial value of a property.*/
    PropertyInitializer = 1,
    /** Values for a class getter or class setter to mirror. */
    AccessorMirror = 2,
    /** Statements starting a statement purpose block. */
    HeadStatements = 4,
    /** Statements in a purpose block for a given property and class member. */
    BodyStatements = 8,
    /** Statements closing a statement purpose block. */
    TailStatements = 16,
    /** Statements starting a statement purpose block for the constructor. */
    ConstructorHeadStatements = 32,
    /** Statements in a purpose block for a given property on the constructor. */
    ConstructorBodyStatements = 64,
    /** Statements closing a statement purpose block for the constructor. */
    ConstructorTailStatements = 128
}
/** Convert type members to a class members map, including statements. */
declare class MemberedTypeToClass {
    #private;
    /** The class constructor's current parameters list. */
    get constructorParameters(): ParameterDeclarationImpl[];
    /**
     * An interface to get names which match an index signature's key name.
     */
    get indexSignatureResolver(): IndexSignatureResolver | undefined;
    set indexSignatureResolver(value: IndexSignatureResolver | undefined);
    get isAbstractCallback(): ClassAbstractMemberQuestion | undefined;
    set isAbstractCallback(value: ClassAbstractMemberQuestion | undefined);
    get isAsyncCallback(): ClassAsyncMethodQuestion | undefined;
    set isAsyncCallback(value: ClassAsyncMethodQuestion | undefined);
    get isGeneratorCallback(): ClassGeneratorMethodQuestion | undefined;
    set isGeneratorCallback(value: ClassGeneratorMethodQuestion | undefined);
    get scopeCallback(): ClassScopeMemberQuestion | undefined;
    set scopeCallback(value: ClassScopeMemberQuestion | undefined);
    /**
     * Get the current type members in our cache.
     *
     * @internal This is for debugging and testing purposes only.
     */
    getCurrentTypeMembers(isStatic: boolean): readonly TypeMemberImpl[];
    /**
     * Define a class member for a given type member (constructor, property, method, getter, setter).
     * @param isStatic - true if the class member is static.
     * @param member - the type member to convert to a class member.
     */
    addTypeMember(isStatic: boolean, member: TypeMemberImpl): void;
    /**
     * Define class members for a map of given type members (constructor, property, method, getter, setter).
     * @param isStatic - true if the class members are static.
     * @param membersMap - the type members map for conversion to class members.
     */
    importFromTypeMembersMap(isStatic: boolean, membersMap: TypeMembersMap): void;
    /**
     * Define class members for a membered object type or interface.
     * @param isStatic - true if the class members are static.
     * @param membered - the interface or membered object type.
     */
    importFromMemberedType(isStatic: boolean, membered: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl): void;
    /**
     * Convert cached type members to a ClassMembersMap, complete with statements.
     */
    buildClassMembersMap(): ClassMembersMap;
    /**
     * Define a statement purpose group for the target class.
     *
     * @param purposeKey - The purpose of the statmeent group (validation, preconditions, body, postconditions, etc.)
     * @param isBlockStatement - true if the statement block should be enclosed in curly braces.
     * @param regionName - an optional #region / #endregion comment name.
     *
     * Call this in the order of statement purpose groups you intend.
     */
    defineStatementsByPurpose(purposeKey: string, isBlockStatement: boolean, regionName?: string): void;
    /**
     * Add statement getters to this.
     *
     * @param priority - a number indicating the priority of the getters (lower numbers beat higher numbers).
     * @param statementGetters - the statement getters to insert.
     */
    addStatementGetters(priority: number, statementGetters: readonly ClassStatementsGetter[]): void;
    /**
     * Add member keys for a field and a group.
     * @param isFieldStatic - true if the field is static.
     * @param fieldType - the field signature.
     * @param isGroupStatic - true if the group is static (false for constructors)
     * @param groupType - the group signature, or "constructor" for the constructor I generate.
     */
    insertMemberKey(isFieldStatic: boolean, fieldType: PropertySignatureImpl, isGroupStatic: boolean, groupType: InsertedMemberKey["groupType"]): void;
}

/**
 * A map for members of `InterfaceDeclarationImpl` and `MemberedObjectTypeStructureImpl`.  This
 * doesn't replace the structures, rather it _feeds_ them.
 *
 * @example
 *
 * const map = new TypeMembersMap;
 * const foo = new PropertySignatureImpl(false, "foo");
 * map.addMembers([foo]);
 * // ...
 * const interfaceDecl = new InterfaceDeclarationImpl("FooInterface");
 * map.moveMembersToType(interfaceDecl);
 * // interfaceDecl.properties === [foo];
 */
declare class TypeMembersMap extends OrderedMap<string, TypeMemberImpl> {
    #private;
    /**
     * Get a map key from a potential type member.
     * @param member - the type member
     */
    static keyFromMember(member: TypeMemberImpl): string;
    /**
     * @param kind - the structure kind.
     * @param name - the name of the type member.
     * @returns the map key to use.
     */
    static keyFromName(kind: NamedTypeMemberImpl["kind"], name: string): string;
    /**
     * Create a `TypeMembersMap` from an interface or membered object.
     * @param membered - the membered object.
     * @returns the type members map.
     */
    static fromMemberedObject(membered: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl): TypeMembersMap;
    /**
     * Add type members as values of this map, using standard keys.
     *
     * @param members - the type members to add.
     */
    addMembers(members: readonly TypeMemberImpl[]): void;
    /**
     * Get type members of a particular kind.
     *
     * @param kind - the structure kind to get.
     * @returns all current members of that kind.
     */
    arrayOfKind<Kind extends TypeMemberImpl["kind"]>(kind: Kind): readonly Extract<TypeMemberImpl, KindedStructure<Kind>>[];
    /** Get a clone of this map. */
    clone(): TypeMembersMap;
    /**
     * Convert get and/or set accessors to a property.  This may be lossy, but we try to be faithful.
     * @param name - the property name
     */
    convertAccessorsToProperty(name: string): void;
    /**
     * Convert a property signature to get and/or set accessors.  This may be lossy, but we try to be faithful.
     * @param name - the property name
     * @param toGetter - true if the caller wants a getter
     * @param toSetter - true if the caller wants a setter
     */
    convertPropertyToAccessors(name: string, toGetter: boolean, toSetter: boolean): void;
    /**
     * A typed call to `this.get()` for a given kind.
     * @param kind - the structure kind.
     * @param name - the key to get.
     * @returns - the type member, as the right type, or undefined if the wrong type.
     *
     * @see `TypeMembersMap::keyFromName`
     */
    getAsKind<Kind extends NamedTypeMemberImpl["kind"]>(kind: Kind, name: string): Extract<TypeMemberImpl, KindedStructure<Kind>> | undefined;
    /**
     * Move type members from this map to an interface or type literal, and clear this map.
     *
     * @param owner - the target interface or type literal declaration.
     */
    moveMembersToType(owner: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl): void;
    /**
     * Replace an index signature with other methods/properties matching the signature's return type.
     *
     * It is up to you to ensure the names match the key type of the index signature.
     *
     * @param signature - the signature (which must be a member of this) to resolve.
     * @param names - the names to replace the signature's key with.
     */
    resolveIndexSignature(signature: IndexSignatureDeclarationImpl, names: string[]): MethodSignatureImpl[] | PropertySignatureImpl[];
    toJSON(): readonly TypeMemberImpl[];
}
type ReadonlyTypeMembersMap = Simplify<ReadonlyMap<string, TypeMemberImpl> & Pick<TypeMembersMap, "arrayOfKind" | "clone" | "getAsKind">>;

/** A description of the exports to add. */
interface AddExportContext {
  /** This could be an absolute path, or a package import like "ts-morph-structures". */
  pathToExportedModule: string;

  /** The names to add to the import.  Pass an empty array for "*". */
  exportNames: readonly string[];

  /** True if the import is the default.  exportNames will then be the default export name. */
  isDefaultExport: boolean;

  /** True if the export names are types only. */
  isType: boolean;
}

/** A description of the imports to add. */
interface AddImportContext {
  /** This could be an absolute path, or a package import like "ts-morph-structures". */
  pathToImportedModule: string;

  /**
   * True if `this.pathToImportedModule` represents a package import.
   * False if the imported module path should be relative to the
   * manager's absolute path in generated code.
   */
  isPackageImport: boolean;

  /** The names to add to the import.  Pass an empty array for "*". */
  importNames: readonly string[];

  /** True if the import is the default.  importNames will then be the default import. */
  isDefaultImport: boolean;

  /** True if the import names are types only. */
  isTypeOnly: boolean;
}

type ClassFieldStatement =
  | string
  | WriterFunction
  | StatementStructureImpls;

type ClassMemberImpl =
  | ConstructorDeclarationImpl
  | GetAccessorDeclarationImpl
  | MethodDeclarationImpl
  | PropertyDeclarationImpl
  | SetAccessorDeclarationImpl;

type NamedClassMemberImpl = Extract<ClassMemberImpl, { name: string }>;

interface IndexSignatureResolver {
  resolveIndexSignature(signature: IndexSignatureDeclarationImpl): string[];
}

interface MemberedStatementsKey {
  readonly fieldKey: string;
  readonly statementGroupKey: string;
  readonly purpose: string;

  readonly isFieldStatic: boolean;
  readonly fieldType: TypeMemberImpl | undefined;

  readonly isGroupStatic: boolean;
  readonly groupType: TypeMemberImpl | undefined;
}

interface ClassAbstractMemberQuestion {
  isAbstract(
    kind: Exclude<ClassMemberImpl, ConstructorDeclarationImpl>["kind"],
    memberName: string,
  ): boolean;
}

interface ClassAsyncMethodQuestion {
  isAsync(isStatic: boolean, methodName: string): boolean;
}

interface ClassGeneratorMethodQuestion {
  isGenerator(isStatic: boolean, methodName: string): boolean;
}

interface ClassScopeMemberQuestion {
  getScope(
    isStatic: boolean,
    kind: ClassMemberImpl["kind"],
    memberName: string,
  ): Scope | undefined;
}

type NamedTypeMemberImpl = Extract<TypeMemberImpl, { name: string }>;

type TypeMemberImpl =
  | CallSignatureDeclarationImpl
  | ConstructSignatureDeclarationImpl
  | GetAccessorDeclarationImpl
  | IndexSignatureDeclarationImpl
  | MethodSignatureImpl
  | PropertySignatureImpl
  | SetAccessorDeclarationImpl;

type stringWriterOrStatementImpl =
  | stringOrWriterFunction
  | StatementStructureImpls;

/**
 * For the initial value of a property.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.PropertyInitializer` must be non-zero.
 */
interface PropertyInitializerGetter {
  /**
   * @param key - The property description key.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns true for a match against the key.
   */
  filterPropertyInitializer(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The property description key.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns the value to write for the property initializer.
   */
  getPropertyInitializer(
    key: MemberedStatementsKey,
  ): stringWriterOrStatementImpl | undefined;
}

/**
 * A value for getters and setters of a class to reflect.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.AccessorMirror` must be non-zero.
 */
interface AccessorMirrorGetter {
  /**
   * @param key - Describing the getter or setter to implement.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns true for a match against the key.
   */
  filterAccessorMirror(key: MemberedStatementsKey): boolean;

  /**
   * @param key - Describing the getter or setter to implement.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns the value to write for the getter and/or setter to mirror.
   */
  getAccessorMirror(
    key: MemberedStatementsKey,
  ): stringWriterOrStatementImpl | undefined;
}

/**
 * Statements at the start of a statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.HeadStatements` must be non-zero.
 */
interface ClassHeadStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.
   * @returns true for a match against the key.
   */
  filterHeadStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.
   * @returns statements to insert before other statements in the purpose block.
   */
  getHeadStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements in a statement purpose block for a particular property and function.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.BodyStatements` must be non-zero.
 */
interface ClassBodyStatementsGetter {
  /**
   * @param key - The membered statement key.
   * @returns true for a match against the key.
   */
  filterBodyStatements(key: MemberedStatementsKey): boolean;
  /**
   * @param key - The membered statement key.
   * @returns statements to insert for the given field key and statement group key.
   */
  getBodyStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the end of a statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.TailStatements` must be non-zero.
 */
interface ClassTailStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.
   * @returns true for a match against the key.
   */
  filterTailStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.
   * @returns statements to insert after other statements in the purpose block.
   */
  getTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the start of a constructor's statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorHeadStatements` must be non-zero.
 */
interface ConstructorHeadStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorHeadStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.  `statementGroupKey` will be "constructor".
   * @returns statements to insert before other statements in the purpose block.
   */
  getCtorHeadStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements in a statement purpose block for a particular property in the constructor.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorBodyStatements` must be non-zero.
 */
interface ConstructorBodyStatementsGetter {
  /**
   * @param key - The membered statement key.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorBodyStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `statementGroupKey` will be "constructor".
   * @returns statements to insert for the given field key and statement group key.
   */
  getCtorBodyStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the end of a constructor's statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorTailStatements` must be non-zero.
 */
interface ConstructorTailStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorTailStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.  `statementGroupKey` will be "constructor".
   * @returns statements to insert before other statements in the purpose block.
   */
  getCtorTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Traps for getting statements, based on a `MemberedStatementsKey`.
 */
interface ClassStatementsGetter
  extends Partial<PropertyInitializerGetter>,
    Partial<AccessorMirrorGetter>,
    Partial<ClassHeadStatementsGetter>,
    Partial<ClassBodyStatementsGetter>,
    Partial<ClassTailStatementsGetter>,
    Partial<ConstructorHeadStatementsGetter>,
    Partial<ConstructorBodyStatementsGetter>,
    Partial<ConstructorTailStatementsGetter> {
  /** A human-readable string for debugging. */
  keyword: readonly string;

  /**
   * Bitwise flags to determine which statement getter traps are active.
   * @see ClassSupportsStatementsFlags
   */
  supportsStatementsFlags: readonly number;
}

type stringOrWriterFunction = string | WriterFunction;

type ClassMemberStructureImpls =
  | ClassStaticBlockDeclarationImpl
  | ConstructorDeclarationImpl
  | GetAccessorDeclarationImpl
  | MethodDeclarationImpl
  | PropertyDeclarationImpl
  | SetAccessorDeclarationImpl;
type InterfaceMemberStructureImpls = TypeElementMemberStructureImpls;
type JsxStructureImpls =
  | JsxAttributeImpl
  | JsxElementImpl
  | JsxSelfClosingElementImpl
  | JsxSpreadAttributeImpl;
type ObjectLiteralExpressionPropertyStructureImpls =
  | GetAccessorDeclarationImpl
  | MethodDeclarationImpl
  | PropertyAssignmentImpl
  | SetAccessorDeclarationImpl
  | ShorthandPropertyAssignmentImpl
  | SpreadAssignmentImpl;
type StatementStructureImpls =
  | ClassDeclarationImpl
  | EnumDeclarationImpl
  | ExportAssignmentImpl
  | ExportDeclarationImpl
  | FunctionDeclarationImpl
  | ImportDeclarationImpl
  | InterfaceDeclarationImpl
  | ModuleDeclarationImpl
  | TypeAliasDeclarationImpl
  | VariableStatementImpl;
type StructureImpls =
  | ClassMemberStructureImpls
  | ConstructorDeclarationOverloadImpl
  | DecoratorImpl
  | EnumMemberImpl
  | ExportSpecifierImpl
  | FunctionDeclarationOverloadImpl
  | ImportAttributeImpl
  | ImportSpecifierImpl
  | InterfaceMemberStructureImpls
  | JSDocImpl
  | JSDocTagImpl
  | JsxStructureImpls
  | MethodDeclarationOverloadImpl
  | ObjectLiteralExpressionPropertyStructureImpls
  | ParameterDeclarationImpl
  | SourceFileImpl
  | StatementStructureImpls
  | TypeParameterDeclarationImpl
  | VariableDeclarationImpl;
type TypeElementMemberStructureImpls =
  | CallSignatureDeclarationImpl
  | ConstructSignatureDeclarationImpl
  | IndexSignatureDeclarationImpl
  | MethodSignatureImpl
  | PropertySignatureImpl;

interface TypedNodeTypeStructure {
  typeStructure: TypeStructures | undefined;
  type: stringOrWriterFunction | undefined;
}

interface ReturnTypedNodeTypeStructure {
  returnTypeStructure: TypeStructures | undefined;
  returnType: stringOrWriterFunction | undefined;
}

interface TypeParameterWithTypeStructures {
  constraintStructure: TypeStructures | undefined;
  constraint: stringOrWriterFunction | undefined;

  defaultStructure: TypeStructures | undefined;
  default: stringOrWriterFunction | undefined;
}

interface ClassDeclarationWithImplementsTypeStructures {
  implementsSet: TypeStructureSet;
  implements: stringOrWriterFunction[];
}

interface InterfaceDeclarationWithExtendsTypeStructures {
  extendsSet: TypeStructureSet;
  extends: stringOrWriterFunction[];
}

export { type AbstractableNodeStructureClassIfc, type AccessorMirrorGetter, type AddExportContext, type AddImportContext, type AmbientableNodeStructureClassIfc, ArrayTypeStructureImpl, type AsyncableNodeStructureClassIfc, CallSignatureDeclarationImpl, type CallSignatureDeclarationStructureClassIfc, type ClassAbstractMemberQuestion, type ClassAsyncMethodQuestion, type ClassBodyStatementsGetter, ClassDeclarationImpl, type ClassDeclarationStructureClassIfc, type ClassDeclarationWithImplementsTypeStructures, type ClassFieldStatement, ClassFieldStatementsMap, type ClassGeneratorMethodQuestion, type ClassHeadStatementsGetter, type ClassMemberImpl, type ClassMemberStructureImpls, ClassMembersMap, type ClassScopeMemberQuestion, type ClassStatementsGetter, ClassStaticBlockDeclarationImpl, type ClassStaticBlockDeclarationStructureClassIfc, ClassSupportsStatementsFlags, type ClassTailStatementsGetter, ConditionalTypeStructureImpl, type ConditionalTypeStructureParts, ConstructSignatureDeclarationImpl, type ConstructSignatureDeclarationStructureClassIfc, type ConstructorBodyStatementsGetter, ConstructorDeclarationImpl, ConstructorDeclarationOverloadImpl, type ConstructorDeclarationOverloadStructureClassIfc, type ConstructorDeclarationStructureClassIfc, type ConstructorHeadStatementsGetter, type ConstructorTailStatementsGetter, type DecoratableNodeStructureClassIfc, DecoratorImpl, type DecoratorStructureClassIfc, EnumDeclarationImpl, type EnumDeclarationStructureClassIfc, EnumMemberImpl, type EnumMemberStructureClassIfc, type ExclamationTokenableNodeStructureClassIfc, ExportAssignmentImpl, type ExportAssignmentStructureClassIfc, ExportDeclarationImpl, type ExportDeclarationStructureClassIfc, ExportManager, ExportSpecifierImpl, type ExportSpecifierStructureClassIfc, type ExportableNodeStructureClassIfc, FunctionDeclarationImpl, FunctionDeclarationOverloadImpl, type FunctionDeclarationOverloadStructureClassIfc, type FunctionDeclarationStructureClassIfc, type FunctionTypeContext, FunctionTypeStructureImpl, FunctionWriterStyle, type GeneratorableNodeStructureClassIfc, GetAccessorDeclarationImpl, type GetAccessorDeclarationStructureClassIfc, ImportAttributeImpl, type ImportAttributeStructureClassIfc, ImportDeclarationImpl, type ImportDeclarationStructureClassIfc, ImportManager, ImportSpecifierImpl, type ImportSpecifierStructureClassIfc, ImportTypeStructureImpl, IndexSignatureDeclarationImpl, type IndexSignatureDeclarationStructureClassIfc, type IndexSignatureResolver, IndexedAccessTypeStructureImpl, InferTypeStructureImpl, type InitializerExpressionableNodeStructureClassIfc, InterfaceDeclarationImpl, type InterfaceDeclarationStructureClassIfc, type InterfaceDeclarationWithExtendsTypeStructures, type InterfaceMemberStructureImpls, IntersectionTypeStructureImpl, JSDocImpl, type JSDocStructureClassIfc, JSDocTagImpl, type JSDocTagStructureClassIfc, type JSDocableNodeStructureClassIfc, JsxAttributeImpl, type JsxAttributeStructureClassIfc, JsxElementImpl, type JsxElementStructureClassIfc, JsxSelfClosingElementImpl, type JsxSelfClosingElementStructureClassIfc, JsxSpreadAttributeImpl, type JsxSpreadAttributeStructureClassIfc, type JsxStructureImpls, type KindedTypeStructure, LiteralTypeStructureImpl, MappedTypeStructureImpl, MemberedObjectTypeStructureImpl, type MemberedStatementsKey, MemberedTypeToClass, MethodDeclarationImpl, MethodDeclarationOverloadImpl, type MethodDeclarationOverloadStructureClassIfc, type MethodDeclarationStructureClassIfc, MethodSignatureImpl, type MethodSignatureStructureClassIfc, ModuleDeclarationImpl, type ModuleDeclarationStructureClassIfc, type NameableNodeStructureClassIfc, type NamedClassMemberImpl, type NamedNodeStructureClassIfc, type NamedTypeMemberImpl, NumberTypeStructureImpl, type ObjectLiteralExpressionPropertyStructureImpls, type OverrideableNodeStructureClassIfc, ParameterDeclarationImpl, type ParameterDeclarationStructureClassIfc, ParameterTypeStructureImpl, type ParameteredNodeStructureClassIfc, ParenthesesTypeStructureImpl, PrefixOperatorsTypeStructureImpl, type PrefixUnaryOperator, PropertyAssignmentImpl, type PropertyAssignmentStructureClassIfc, PropertyDeclarationImpl, type PropertyDeclarationStructureClassIfc, type PropertyInitializerGetter, PropertySignatureImpl, type PropertySignatureStructureClassIfc, QualifiedNameTypeStructureImpl, type QuestionTokenableNodeStructureClassIfc, type ReadonlyTypeMembersMap, type ReadonlyableNodeStructureClassIfc, type ReturnTypedNodeStructureClassIfc, type ReturnTypedNodeTypeStructure, type ScopedNodeStructureClassIfc, SetAccessorDeclarationImpl, type SetAccessorDeclarationStructureClassIfc, ShorthandPropertyAssignmentImpl, type ShorthandPropertyAssignmentStructureClassIfc, SourceFileImpl, type SourceFileStructureClassIfc, SpreadAssignmentImpl, type SpreadAssignmentStructureClassIfc, type StatementStructureImpls, type StatementedNodeStructureClassIfc, StringTypeStructureImpl, type StructureClassIfc, type StructureImpls, TemplateLiteralTypeStructureImpl, TupleTypeStructureImpl, TypeAliasDeclarationImpl, type TypeAliasDeclarationStructureClassIfc, TypeArgumentedTypeStructureImpl, type TypeElementMemberStructureImpls, type TypeMemberImpl, TypeMembersMap, type TypeNodeToTypeStructureConsole, TypeParameterDeclarationImpl, type TypeParameterDeclarationStructureClassIfc, type TypeParameterWithTypeStructures, type TypeParameteredNodeStructureClassIfc, TypePredicateTypeStructureImpl, TypeStructureKind, type TypeStructureSet, type TypeStructures, type TypeStructuresOrNull, type TypedNodeStructureClassIfc, type TypedNodeTypeStructure, UnionTypeStructureImpl, VariableDeclarationImpl, type VariableDeclarationStructureClassIfc, VariableStatementImpl, type VariableStatementStructureClassIfc, VoidTypeNodeToTypeStructureConsole, WriterTypeStructureImpl, forEachAugmentedStructureChild, getTypeAugmentedStructure, parseLiteralType, type stringOrWriterFunction, type stringWriterOrStatementImpl };
