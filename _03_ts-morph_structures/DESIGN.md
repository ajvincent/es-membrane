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

### `TypeAccessors`

The `TypeAccessors` class is simple:

```typescript
declare class TypeAccessors
extends StructureBase
implements TypedNodeStructure, TypedNodeTypeStructure
{
    typeStructure: TypeStructures | undefined;
    get type(): string | WriterFunction | undefined;
    set type(value: stringOrWriterFunction | undefined);
    static cloneType(type: stringOrWriterFunction | undefined): stringOrWriterFunction | undefined;
}
```

The getter for `type` returns `this.typeStructure?.writerFunction`, except when the type structure is a `LiteralTypedTypeStructureImpl`, in which case it returns `this.typeStructure.stringValue`.  Note `TypeAccessors` does _not_ implement anything else.

The setter for `type` is somewhat smarter:

1. If the value is undefined, set undefined for the `typeStructure`, and exit.
1. If the value is a string, create a new (unregistered) `LiteralTypedTypeStructureImpl` and exit.  (Unregistered means "don't bind the writer function to the type structure".)
1. The value is a function.  If the function is registered to a known type structure, set the `typeStructure` to that type structure and exit.
1. Create a new `WriterTypedTypeStructureImpl` wrapping the writer function, assign the type structure to `typeStructure`, and exit.

### Using `TypeAccessors` in structure classes and decorators

Here's the class which [the `@ReturnTypedNode` decorator](./source/decorators/ReturnTypedNode.mts) provides:

```typescript
return class extends baseClass {
  readonly #typeWriterManager = new TypeAccessors;

  get returnType(): string | WriterFunction | undefined
  {
    return this.#typeWriterManager.type;
  }

  set returnType(
    value: string | WriterFunction | undefined
  )
  {
    this.#typeWriterManager.type = value;
  }

  get returnTypeStructure(): TypeStructures | undefined
  {
    return this.#typeWriterManager.typeStructure;
  }

  set returnTypeStructure(
    value: TypeStructures
  )
  {
    this.#typeWriterManager.typeStructure = value;
  }

  static cloneReturnTyped(
    source: ReturnTypedNodeStructure,
    target: ReturnTypedNodeTypeStructure
  ): void
  {
    target.returnType = TypeAccessors.cloneType(source.returnType);
  }
}
```

Other cases where we need to provide a type and a type structure follow the same pattern... with one exception, arrays of types (see `TypeStructureSet` below).

### Type structure registry (writer functions support)

[`source/base/callbackToTypeStructureRegistry.mts`](source/base/callbackToTypeStructureRegistry.mts) implements a `WeakMap<WriterFunction, TypeStructures>`.  This is how `TypeAccessors` knows when to store an existing type structure and when to create a new one.

### Type arrays: `class implements`, `interface extends`

In at least two cases, ts-morph structure interfaces specify an array of types.  These require special handling.

- Structure classes provide access to the arrays as a getter _only_.  I can't allow a setter, because either:
  1. we hand ownership over the elements to someone else, without being able to track updates, or
  2. the array the caller passes in is not the array we have: they update it and the update doesn't stick.
- The interface specifies these as writable, but that provides more complications:
  1. I have to provide methods to update the type structures which back them.
  2. If the user sets a value directly (`structure.implements[0] = "boolean";`), that means specialized [_proxy handling_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept the new value and create a type structure.
- There's really no need for these to be ordered.  A `Set<string | WriterFunction>` would suffice, and be easy to implement.  However, I have to implement the interface as it exists...

Ultimately, I decided to punt:  I hide the type array behind a readonly array proxy, and provide a special `TypeStructureSet` class for managing the actual structures, strings and writer functions.

Yes, I could've completed the proxy with a special helper class for the writable array methods.  Since this is part of a membrane project which depends heavily on proxies, I need that capability anyway.  It's a chicken-and-egg problem, one which would make ts-morph adoption of this project much harder.

That said, proxies are pretty obscure (and difficult to get right), and I felt for a first draft it would be overkill to write a truly correct proxy handler and helper class.  (I tried.  It really isn't worth it.)

### `ReadonlyProxyArrayHandler`

[`ReadonlyProxyArrayHandler.mts`](./source/array-utilities/ReadonlyArrayProxyHandler.mts) provides a minimalist proxy handler for reading index properties, and getting readonly methods (and the length) of a backing array of real strings and writer functions.  

When the user tries to set a property through the array, or access a method which would modify the array, the proxy handler throws an exception with a specific message.  The message comes from the proxy handler constructor.  The idea is the creator of the proxy handler will tell the user about the safe alternative for setting values.

The backing array is the `target` parameter of each proxy trap.  It is very specifically _not_ a property of the proxy handler.  This means the same proxy handler is reusable for many backing arrays.

### `TypeStructureSet`

The `TypeStructureSet` class extends `Set<string | WriterFunction | TypeStructures>`.  It overrides the `add`, `clear`, `has` and `delete` methods to update a backing array of strings and writer functions which it shares with the readonly array proxy.  

### Example implementation of a types array

```typescript
class ClassDeclarationImpl
{
  static readonly #implementsArrayReadonlyHandler = new ReadonlyArrayProxyHandler(
    "The implements array is read-only.  Please use this.implementsSet to set strings, writer functions, and type structures."
  );

  readonly #implementsShadowArray: stringOrWriterFunction[] = [];

  readonly #implementsProxyArray = new Proxy<stringOrWriterFunction[]>(
    this.#implementsShadowArray,
    ClassDeclarationImpl.#implementsArrayReadonlyHandler
  );

  readonly #implementsSet = new TypeStructureSet(this.#implementsShadowArray);

  get implements(): stringOrWriterFunction[] {
    return this.#implementsProxyArray;
  }

  get implementsSet(): TypeStructureSet {
    return this.#implementsSet;
  }
}
```

## Bootstrapping: from `ts-morph` nodes and structures to type-augmented structures

We get structures from ts-morph's `getStructures()` method, which ts-morph defines on `SourceFile` and several other node classes.  Given any node with a `getStructures()` method, and ts-morph's utilities for traversing structure trees and node trees, I can build the rest.

The source code for these lives in the [source/bootstrap](./source/bootstrap/) directory.

### Structure-to-node map

First I have to match [ts-morph structures to ts-morph nodes](./source/bootstrap/structureToNodeMap.mts).  This involves a multi-step process:

1. Walk the tree of nodes from a root node, generating string hashes for each node.  Collect the nodes by hash in a `Map<string, Set<Node>>`.
1. Get the structure from the root node, then clone it using the structure classes map.
1. Walk the tree of structures to collect all of them in a `Set<Structures>`.
1. For each element of the structures set,
   1. Create a hash of the node the structure represents.
   1. Look up that hash in the map of node sets above.
   1. If there is a match, extract the node from the set and add the `[structure, node]` tuple to a `Map<Structures, Node>`.
   1. Otherwise, throw an exception, because there should always be a 1:1 relationship between a structure and its node (until someone modifies one or the other, that is).
1. Return the map of structures to nodes.  The first key of the map should be the root structure.

There are nuances to both node trees and structure trees which make this a specialized task.  There is a fair bit of trial-and-error in developing this.  The module tracks debugging information (structure hashes, parent hashes of structure and node, node-to-hash maps, etc.), for the occasions when it fails.

### Finding the type nodes for a given node

Next we need to [find where the type nodes are](./source/bootstrap/buildTypesForStructures.mts) for each structure we care about.  This takes a `Map<Structures, Node>`, and a special type node converter (which I describe in the next section) and for each structure-node pair, runs the following algorithm:

1. Check the structure's kind property for structure-specific interfaces.
1. Assert the node is of the same type as the structure.  If it isn't, throw an exception.
1. Pass each type node belonging to the node to the type node converter.  Ignore undefined nodes.

At the end of the run, it returns all the failures the type node converter reports.

### Convert one type node to a type structure

Once we have a type node, we need to create a type structure for it.  [This is the purpose of `convertTypeNode()`](./source/bootstrap/convertTypeNode.mts).

1. Check what kind of type node it is.
2. Gather child type nodes belonging to the type node.
3. Call itself recursively for each child type node to get a child type structure.
4. Create the type structure and assign the child structures to it.
5. Return the type structure.

This function may not throw any exceptions.  It fails gracefully by calling the `consoleTrap()` callback at the point of failure and returning null up the call stack.

### Discovering nodes with structures within type nodes

Occasionally, a type structure will require a structure as one of its properties.  This is because, deep within the type node's descendants, there is a node with structures we haven't resolved yet.  (This most often happens with type parameter declaration nodes.)

The `subStructureResolver()` callback exists for this purpose.  We pass it down from `buildTypesForStructures()` to `convertTypeNode()` function.

### Allowing for failures (or "this code probably doesn't cover everything")

The `convertTypeNode()` function may fail to build a matching structure.  When it does, the failure may be deep within a tree of type nodes.  

The `consoleTrap()` callback of `convertTypeNode()` exists for this purpose: to report which type node we failed on, and why.  After calling it, we return null.  Only the node which the failure occurred on (not its ancestors) will have the `consoleTrap()` invocation.  When a child call to `convertTypeNode()` returns null, we return null as well, passing it all the way up.

The `buildTypesForStructures()` function handles a null return from `convertTypeNode()` gracefully: if it gets null back, it does nothing to the type field and rolls on to the next.  Thus, a failure will leave you with a string or writer function you can still use, and (courtesy of the `TypeAccessor`) a type structure reflecting the original type field, just unparsed.

### Driving with `getTypeAugmentedStructure()`

[The `getTypeAugmentedStructure()` function](./source/bootstrap/getTypeAugmentedStructure.mts) integrates all the above together.

1. It takes a callback function for type-to-type-structure conversion failures.
1. It calls `structureToNodeMap()` to get a `Map<Structures, Node>`.
1. It calls `buildTypesForStructures()` with:
   1. The map from `structureToNodeMap()`
   1. The user's failures callback
   1. A sub-structures callback which calls `getTypeAugmentedStructure()` recursively, starting again at a deeper point in the node tree
   1. `convertTypeNode`
1. It returns the root structure, the root node, and all conversion failures it accumulated.

## What does this project export?

- `getTypeAugmentedStructures()`
  - `type RootStructureWithConvertFailures`
  - `type TypedNodeToTypeStructureConsole`
- All structure classes
  - `TypeParameterConstraintMode` for a rule on printing type parameters (`foo extends object` versus `key in type`)
- Factory support types for `MethodDeclarationImpl`
  - `MethodDeclarationEnableFlags`
  - `MethodDeclarationAppendContext`
- Structure classes maps (structures, statements, type structures) for cloning support
- All type structure classes
  - `TypeStructureKind`
  - `type KindedTypeStructure`
- `createCodeBlockWriter()`

## The Future

### Porting to `ts-morph` upstream?

This is the most desirable outcome: adding these structure and type structure classes directly into the ts-morph project.  Bootstrapping is less efficient than having ts-morph just provide the type-augmented structures directly... and it would be easier to catch and fix bugs in one project rather than two.

If this is not acceptable, then as I stated in [the README file](./README.md), I would like to publish this as a separate npm project with a more unique name... after I am more confident that it works correctly.  (See "More tests, please" below.)

### Factory constructors and methods

I started building this out for `MethodDeclarationImpl`.  I think it's still a very good idea, just not as urgent as getting a working set of structure classes.

### Write access to type array proxies

When my es-membrane library is more mature, I might bring forward the write-access methods of arrays.  I haven't decided yet, and I won't until I have reached that point.

### More tests, please

My testing plan right now is "use it, and when it breaks, fix it and write tests for what broke."  

Of course, I would prefer explicit tests of every structure class.  Normally, I'd write those tests up front.  I didn't this time, because (a) these classes do compile against the ts-morph structure interfaces, and (b) most of the time, the structure fields are dumb objects, not needing any special treatment.  

Augmenting structures with type structures, and cloning structures, was really the only part where I'm adding intelligence.  [The type structures _do_ have unit tests](./spec/TypeStructure.mts).  

### What's not in the future plan?

- All statements as structures.  Statements typically appear as `(string | WriterFunction | StatementStructures)[] | string | WriterFunction`.  Statements can be as simple as `const x = true;` or a really complicated `for` loop with child statements.  Unlike the type arrays, ordering matters, so replacing this with a simple `Set` won't work.  Type arrays are complicated enough, and not that user-friendly.  A complete statement structures set and support for a generic statements array would be an order of magnitude worse.
  - Likewise, "all nodes as structures".  I'm not doing that.  The maintenance alone as TypeScript evolves...
- Printing methods for structures in general.  The ts-morph project already supports that.  To do so here would be to duplicate work.
  - Printing methods for type structures are an exception to this, because this is _not_ duplicating features ts-morph already has.

### Checklist for creating a new class decorator

- [ ] Import `RightExtendsLeft`, `StaticAndInstance`, `SubclassDecorator`, `StructureBase`, and `MixinDecorator`
- [ ] `declare const YourStructureKey: unique symbol;` (this is to ensure decorators appear in the right order)
- [ ] `export type YourStructureFields = RightExtendsLeft<StaticAndInstance<YourStructureKey>, {}>`;
  - [ ] `staticFields` for static class fields
  - [ ] `instanceFields` for class instance fields
  - [ ] `symbolKey: typeof YourStructureKey`
- [ ] `export default function YourDecoratorNode`
  - [ ] Follow the pattern of existing decorators, including especially `satisfies SubclassDecorator<...>`
- [ ] Write whatever tests and/or documentation you feel is appropriate

### Checklist for adding a new structure class

- [ ] Import what you need:
  - [ ] from ts-morph: `StructureKind`, `type OptionalKind`, your structure type
  - [ ] `MultiMixinBuilder`
  - [ ] existing structure and type structure class dependencies from `exports.mjs`
  - [ ] `StructureClassesMap`, `CloneableStructure` for cloneable classes support
  - [ ] Decorators and their structure fields type
- [ ] Define a mixin class using `MultiMixinBuilder`
- [ ] Implement your structure class as extending the mixin class
  - [ ] `readonly kind: StructureKind<Foo> = StructureKind<Foo>;`
  - [ ] References to other structures should be instances of existing structure classes
  - [ ] References to types should have matching type structure references, and have a private `TypeAccessors` or `TypeStructureSet` backing them
  - [ ] Export your structure class as the default export.
  - [ ] Implement `public static clone`
    - [ ] The source parameter should be of type `OptionalKind<StructureKind.Foo>`
    - [ ] Use `StructureClassesMap.clone()` and your decorators' `cloneFoo(source, target)` functions where practical
  - [ ] Add a `satisfies` constraint for your class for the static clone method:  `ClassDeclarationImpl satisfies CloneableStructure<ClassDeclarationStructure>;` for example
  - [ ] Add your class to the `StructureClassesMap`, with the key being your `StructureKind`.
  - [ ] Add your class as an export from `exports.mts`
  - [ ] Write whatever tests and/or documentation you feel is appropriate

### Checklist for adding a new type structure class

- In [source/base/TypeStructureKind.mts](./source/base/TypeStructureKind.mts), append a new enum member of `TypeStructureKind`
- In [TypeStructures.mts](./source/typeStructures/TypeStructures.mts), define the type alias your type structure class will implement
  - Include `KindedStructure<TypeStructureKind.YourNewType>`
  - Wrap the alias's type in the `Simplify` type, to make it easier to read when someone hovers over it in an IDE
  - Append your new type to `TypeStructures`
- Import what you need:
  - from ts-morph: `CodeBlockWriter`
  - from `TypeStructures`, your new structure's type alias, and `TypeStructures`
  - `TypeStructureKind` from `TypeStructureKind.mjs`
  - `registerCallbackForTypeStructure` from `callbackToTypeStructureRegistry`
  - `TypeStructureClassesMap`, `CloneableStructure` for cloneable classes support
- Implement your type structure class.
  - `implements YourTypeStructureTypeAlias`
  - `readonly kind: TypeStructureKind<Foo> = TypeStructureKind<Foo>`
  - `constructor()` must call `registerCallbackForTypeStructure(this)`
  - References to other type structures should be instances of existing type structure classes
  - References to regular structures should be instances of existing structure classes
  - `#writerFunction(writer: CodeBlockWriter): void`
  - `readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);`
  - Implement `public static clone()`
    - The source parameter should be of the same type as your type alias
    - [ ] Use `TypeStructureClassesMap.clone()` and your decorators' `cloneFoo(source, target)` functions where practical
  - [ ] Add a `satisfies` constraint for your class for the static clone method:  `ConditionalTypedStructureImpl satisfies CloneableStructure<ConditionalTypedStructure>;` for example
  - [ ] Add your class to the `TypeStructureClassesMap`, with your key being your `TypeStructureKind`
  - [ ] Add your class as an export from `exports.mts`
  - [ ] Write whatever tests and/or documentation you feel is appropriate
- Update [convertTypeNode.mts](./source/bootstrap/convertTypeNode.mts) and its corresponding [test file](./spec/bootstrap/convertTypeNode.mts) for the new structure and its matching type node.
- Update the [README.md](./README.md) file for the new type structure.
