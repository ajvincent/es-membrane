# Overall design for developers

## Philosophy of this design

- Maintain compatibility with ts-morph, particularly the structure interfaces.
- Be reliable.  Don't allow operations which may make a structure inconsistent.
- Support any structure you can reach via a `SourceFileStructure`.
- For common properties and methods of structures, implement using class decorators.
- Type structures map to type nodes.
- Every type attribute on a structure class has a backing type structure.
- Recursive design for creating type structures.
- Each type structure class does only one thing, but does it well.
- Each structure class and each type structure class is _cloneable_.
- Prefer explicit properties over `undefined`.
- Prefer arrays when `foo | bar | [foo | bar][]` is an option.
- The source code should be readable.

You may wonder why "test everything" isn't on this list.  I normally would do that... but this is a prototype, which I threw together in a month.  As such, I am relying on the TypeScript compiler to catch a lot of mistakes for me, and visual code inspection for much of the rest.  Plus, there's a lot of features of ordinary structures I don't know _how_ to test.

## Class decorators for existing structures

With TypeScript 5.0, [ECMAScript decorators](https://github.com/tc39/proposal-decorators) are now available.  I decided to use them.

As part of this, I'm using my [mixin-decorators](../_02_mixin_decorators/) project to ensure strong typing support via `MultiMixinBuilder`.  This allows me to create mixins with static methods, and ensure each class has the right type definitions.  (It also gives me a second use case for mixin-decorators, so I can confirm it is stable.)

The source code is significantly more verbose than I would like, but easy to verify, especially visually.  I follow a particular pattern with class decorators in structures:

- `KindedStructure`, `leadingTrivia` and `trailingTrivia` support first, as this is common to all ts-morph structures
- All other class decorators in alphabetical order.

Each decorator adds only the class fields it is responsible for.  This is why on some structure classes you'll see over a dozen class decorators.

For decorators which implement anything more complicated than simple booleans, I _did_ write tests.

## Base utilities

### `StructureBase`

All ts-morph structure classes inherit from [`StructureBase`](./source/base/StructureBase.mts), for `leadingTrivia` and `trailingTrivia` support.  (These are comments before and after a structure).

### Classes maps

There are three class maps for this project:

```typescript
const StructuresClassesMap = new Map<
  StructureKind,
  CloneableStructure<Structures> & Class<KindedStructure<StructureKind>>
>;

const StatementClassesMap = new Map<
  StructureKind,
  CloneableStructure<StatementStructures> & Class<KindedStructure<StructureKind>>
>;

// with a couple additional utility methods
const TypeStrucureClassesMap = new Map<
  TypeStructureKind,
  CloneableStructure<TypeStructures> & Class<KindedTypeStructure<TypeStructureKind>>
>;
```

These provide a common API for cloning a structure or type structure:  get the class from the map, then invoke the class's static `clone()` method.

### `TypeStructureKind`

Each type structure has a `kind` property which comes from a `TypeStructureKind` enum.  The values for this enum start at 1,000,000.  This reserves more than 999,000 structure kind values for ts-morph... since there's less than 100 type structure kinds, there should be no conflict.

There is also a `KindedTypeStructure` type, similar to `KindedStructure`.

By using a similar enum to `StructureKind`, the hope is to make this aspect of porting from this project to ts-morph itself seamless.

## Structure classes which define everything (almost)

While interfaces can be loose, classes implementing them lean towards tight definitions.  For example, from `ClassDeclarationStructure`:

```typescript
docs?: (OptionalKind<JSDocStructure> | string)[]; // From JSDocableNodeStructure
// ...
isDefaultExport?: boolean; // From ExportableNodeStructure.
```

This says `docs` can be an array of structures (maybe missing their kind property) and strings, _or undefined_.   Likewise, `isDefaultExport` can be true, false, _or undefined_.  Classes implementing these structures need to support the most flexible of these, and only the most flexible:  if an array is possible, pick an array.

```typescript
docs: (string | JSDocImpl)[] = [];
// ...
isDefaultExport = false;
```

No optional kind fields, no undefined values, and objects are instances of other structure classes.

### What's missing?

- Any structure which is unreachable from a `SourceFileStructure`.
  - in particular, JSX structures.
- Factory support (`new Foo().appendStructures(/*...*/).enableFlags(/*...*/)`).  I started this with `MethodDeclarationImpl`, but realized it wasn't necessary for a prototype.

## Type structures overview

I have built these type structures in a tree pattern.  These maintain a one-to-one correspondence to type nodes in TypeScript.

### All type structures have a writer function

Every type structure has a `writerFunction(writer: CodeBlockWriter): void` method, which is bound to the type structure.  This means one type structure's `writerFunction()` can call its children's `writerFunction()` methods to provide the full type to ts-morph.  Further, we can attach a type structure's `writerFunction` as the `type` property of a structure, and ts-morph will happily call it to serialize the type.

### `TypeWriterManager`

The `TypeWriterManager` class is simple:

```typescript
export default class TypeWriterManager
extends StructureBase
implements TypedNodeStructure, TypedNodeTypeStructure
{
    typeStructure: TypeStructures | undefined;
    get type(): string | WriterFunction | undefined;
    set type(value: stringOrWriterFunction | undefined);
    static cloneType(type: stringOrWriterFunction | undefined): stringOrWriterFunction | undefined;
}
```

The getter for `type` returns `this.typeStructure?.writerFunction`, except when the type structure is a `LiteralTypedTypeStructureImpl`, in which case it returns `this.typeStructure.stringValue`.  Note `TypeWriterManager` does _not_ implement anything else.

### Using `TypeWriterManager` in structure classes and decorators

### Type structure registry (writer functions support)

### `LiteralTypedStructureImpl` and `WriterTypedStructureImpl` special handling

### Unordered type arrays: `class implements`, `interface extends`

### `ReadonlyProxyArrayHandler`

### `TypeWriterSet`

## Bootstrapping: from `ts-morph` nodes and structures to type-augmented structures

### Structure-to-node map

### Convert one type node to a type structure

### Finding the right type nodes for a given node

### Discovering nodes with structures within type nodes

### Allowing for failures (or "this code probably doesn't cover everything")

### Driving with `getTypeAugmentedStructure()`

## What does this project export?

## The Future

### Porting to `ts-morph` upstream?

### Factory constructors and methods

### Write access to type array proxies

### More tests, please

### Checklist for adding a new structure class

### Checklist for adding a new type structure class
