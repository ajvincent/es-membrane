# Structure Classes

In ts-morph, [structures](https://ts-morph.com/manipulation/structures) represent the abstract syntax trees of source files and their descendant nodes... at least partially.  If you have a structure, you can create an equivalent node from it.

## Philosophy of the structure classes

- Compatible with `ts-morph` API's
- A complete set of structure classes, one for each structure interface from `ts-morph`
- Arrays for structure fields where arrays are an option in the structure interface (so less guessing)
- Every field has a defined type (even if the field is optional and/or may be undefined)
- Static `clone` methods on every structure class and type structure class
- `.toJSON()` methods for easy serialization (think workers or child processes)
- [Types are editable as objects](./TypeStructures.md) through an extension to the type field name

## Converting from existing structures

If you have an existing ts-morph structure, and you want to create a structure class instance, each structure class has a static `.clone()` method.  Just pass in your structure as the first argument, and it will return a new structure class object.

Often you won't need the `kind` field.

Example:

```typescript
const doc = JSDocImpl.clone({
  description: "Hello World";
});

doc.tags.push(new JSDocTagImpl("internal"));
```

## Creating from existing nodes

Many ts-morph nodes have a `getStructure()` method on them - which return raw ts-morph structure _objects_.  This project uses `getStructure()` as a starting point to bootstrap to the full structure class instances.

```typescript
/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @param assertNoFailures - if true, assert there are no conversion failures.
 *
 * @returns the root structure, and any failures during recursion.
 */
declare function getTypeAugmentedStructure(
  rootNode: NodeWithStructures,
  userConsole: TypeNodeToTypeStructureConsole,
  assertNoFailures: boolean
): RootStructureWithConvertFailures;

/**
 * Get a structure for a node, with type structures installed throughout its descendants.
 * @param rootNode - The node to start from.
 * @param userConsole - a callback for conversion failures.
 * @param assertNoFailures - if true, assert there are no conversion failures.
 * @param kind - the expected structure kind to retrieve.
 * @returns the root structure, and any failures during recursion.
 */
declare function getTypeAugmentedStructure<TKind extends StructureKind>(
  rootNode: NodeWithStructures,
  userConsole: TypeNodeToTypeStructureConsole,
  assertNoFailures: boolean,
  kind: TKind
): RootStructureWithConvertFailures<TKind>;

interface NodeWithStructures extends Node {
  getStructure(): Structures;
}

/**
 * @param message - The failure message.
 * @param failingTypeNode - the type node we failed to resolve.
 */
type TypeNodeToTypeStructureConsole = (
  message: string,
  failingTypeNode: TypeNode,
) => void;

declare function VoidTypeNodeToTypeStructureConsole(
  message: string,
  failingTypeNode: TypeNode
): void;

interface RootStructureWithConvertFailures<
  TKind extends StructureKind = StructureKind,
>
{
  rootStructure: Extract<StructureImpls, KindedStructure<TKind>>;
  failures: readonly BuildTypesForStructureFailures[];
}

interface BuildTypesForStructureFailures {
  message: string;
  failingTypeNode: TypeNode;
}
```

All of these are exports from `"ts-morph-structures"`:

- The `userConsole` is a callback function for when ts-morph-structures might fail to convert a value.  (If it does, please file a bug.)
- `assertNoFailures` will cause te conversion to throw an exception if any conversion fails, recursively.
- Passing in a `kind` argument will force a check against the node you pass in for a matching _syntax_ kind, and assert the returned structure is of the kind you pass in.
- Usually, you just want the `rootStructure` of the `getTypeAugmentedStructure()` output.

## Creating from scratch

Where you see a [structure](../reference/structure-types.md) (where the name ends with `Structure`), there is an equivalent structure implementation class (where the name ends with `Impl`).  For example:

```typescript
// simplified for readability
declare class ClassDeclarationImpl {
  static clone(source: OptionalKind<ClassDeclarationStructure>): ClassDeclarationImpl;

  readonly kind: StructureKind.Class;
  name?: string | undefined;

  readonly leadingTrivia: (string | WriterFunction)[];
  readonly trailingTrivia: (string | WriterFunction)[];

  readonly decorators: DecoratorStructureImpl[];
  readonly docs: (string | JSDocStructureImpl)[];
  hasDeclareKeyword: boolean;
  isAbstract: boolean;
  isDefaultExport: boolean;
  isExported: boolean;
  readonly typeParameters: (string | TypeParameterDeclarationStructureImpl)[];

  readonly ctors: ConstructorDeclarationImpl[] = []
  readonly getAccessors: GetAccessorDeclarationImpl[] = []
  readonly methods: MethodDeclarationImpl[] = [];
  readonly properties: PropertyDeclarationImpl[] = []
  readonly setAccessors: SetAccessorDeclarationImpl[] = [];

  get extends(): stringOrWriterFunction | undefined;
  set extends(value: stringOrWriterFunction | undefined);
  get extendsStructure(): TypeStructures | undefined;
  set extendsStructure(value: TypeStructures | undefined);

  get implements(): stringOrWriterFunction[];
  readonly implementsSet: TypeStructureSet;

  toJSON(): StructureClassToJSON<ClassDeclarationImpl>;
}
```

So if I import `ClassDeclarationImpl` and call `new ClassDeclarationImpl`, all these fields are immediately available and well-defined.

Some of the structure classes have constructors to initialize required fields.

## Accessing type structures from existing structures

Generally speaking, where you have a single type field:

- The type is a string or writer function, per ts-morph.
- There is a matching type structure field, with the name matching and a suffix "Structure".

### Example

```typescript
const method = new MethodSignatureDeclarationImpl("foo");
method.returnTypeStructure = LiteralTypeStructureImpl.get("boolean");
console.log(method.returnType); // writes "boolean", without the quotes.
```

Where you have an _array_ of type structures (specifically, `ClassDeclarationImpl::implements` and `InterfaceDeclarationImpl::extends`), there are some special rules:

- The ts-morph structure types define these as `(string | WriterFunction)[]`.
  - This is great for serialization.
  - This doesn't allow for foreign types, like my `TypeStructure` objects.
  - As arrays, there is an implication of _ordered_ arrays, which isn't really necessary for types.
- These are effectively _readonly_ arrays in ts-morph-structures, because the structure class must maintain strict control of the array at all times.
  - Under the hood, these are _JavaScript proxies_ to a `ReadonlyArrayProxy` to control indexed access.
  - Modifying the array requires more complicated support.  It's not necessarily _hard_, just not a priority right now.

So how _do_ you modify the array of types?

These classes also provide type structure sets, in `ClassDeclarationImpl::implementsSet` and `InterfaceDeclarationImpl::extendsSet`, respectively.  Each of these is a [TypeStructuresSet](../api/ts-morph-structures.typestructureset.md) object: a `Set<TypeStructures>` with a couple extra methods:

- `cloneFromTypeStructureSet(other: TypeStructureSet): void;`
- `replaceFromTypeArray(array: (string | WriterFunction)[]): void;`

So you can just call `classDecl.implementsSet.add(typeStructure);`, and it will update `classDecl.implements` for you.

As for the type structure classes themselves, see [the guide on type structures](./TypeStructures.md).

## Feeding back to ts-morph

First, read [ts-morph's "setting with structure" documentation](https://ts-morph.com/manipulation/structures#setting-with-structure).

Each structure class instance _should_ correctly implement a `Structure`... if it doesn't, file a bug on this project!
