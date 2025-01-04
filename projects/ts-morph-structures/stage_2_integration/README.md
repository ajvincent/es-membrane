# Integrating hand-written code with generated code for stage 2

Here, we host [source code](./source/) and [snapshot build tools](./build/) to generate a final snapshot.

## Philosophy of this design

- Type structures map to type nodes.
- Every type attribute on a structure class has a backing type structure.
- Recursive design for creating type structures.
- Each type structure class does only one thing, but does it well.
- Each type structure class is _cloneable_.
- The source code should be readable.
- Don't be beholden to the stage 1 prototype.  Yes, there will be a lot of similarities, but this is the shipping code.

## Source files

Note: The TypeScript language service (via Visual Studio Code) often complains about errors in the source files, usually in referring to external types.  This is because they're in a slightly different location, and refer to the snapshot... but the snapshot is the canonical, generated code.

If you're editing these source files, be aware of that.  It's not me shipping broken code.  It's me writing code which will be combined with the generated code, and _that_ code should work.

### `StructureBase`

All ts-morph structure classes inherit from [`StructureBase`](./source/base/StructureBase.ts).

### Classes maps

There are two class maps for this project:

```typescript
const StructureClassesMap = new Map<
  StructureKind,
  CloneableStructure<Structures> & Class<KindedStructure<StructureKind>>
>;

// with a couple additional utility methods
const TypeStructureClassesMap = new Map<
  TypeStructureKind,
  CloneableStructure<TypeStructures> & Class<KindedTypeStructure<TypeStructureKind>>
>;

export type CloneableStructure<
  Base extends Structure,
  Result extends StructureImpls,
> = Class<Base> & {
  clone(other: OptionalKind<Base> | Base): Result;
};

export type CloneableTypeStructure<Base extends TypeStructures> =
  Class<Base> & {
    clone(other: Base): Base;
  };
```

These provide a common API for cloning a structure or type structure:  get the class from the map, then invoke the class's static `clone()` method.

The source files are [StructureClassesMap](./source/base/StructureClassesMap.ts) and [TypeStructureClassesMap](./source/base/TypeStructureClassesMap.ts).

## Type structures overview

I have built these type structures in a tree pattern.  These maintain a one-to-one correspondence to type nodes in TypeScript.

**Important**: These are _not_ the same type structures that were in stage 1's prototype.  They are _similar_, but there are some important differences, mostly from me learning from my mistakes in building the early prototype.

### `TypeStructureKind`

Each type structure has a `kind` property which comes from a [`TypeStructureKind`](./source/base/TypeStructureKind.ts) enum.  The values for this enum start at 1,000,000,000.  Since there's less than 100 type structure kinds, there should be no conflict with ts-morph.

There is also a `KindedTypeStructure` type, similar to `KindedStructure`.

By using a similar enum to `StructureKind`, perhaps I can make a future migration into ts-morph easier, if it ever happens.

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

Here's an excerpt from the `@ReturnTypedNodeStructureMixin` decorator:

```typescript
class ReturnTypedNodeStructureMixin extends baseClass {
  readonly #returnTypeManager = new TypeAccessors();

  get returnType(): stringOrWriterFunction | undefined {
    return this.#returnTypeManager.type;
  }

  set returnType(value: stringOrWriterFunction | undefined) {
    this.#returnTypeManager.type = value;
  }

  get returnTypeStructure(): TypeStructures | undefined {
    return this.#returnTypeManager.typeStructure;
  }

  set returnTypeStructure(value: TypeStructures | undefined) {
    this.#returnTypeManager.typeStructure = value;
  }

  // ...
}
```

Other cases where we need to provide a type and a type structure follow the same pattern... with one exception, arrays of types.

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

[`ReadonlyProxyArrayHandler.ts`](./source/array-utilities/ReadonlyArrayProxyHandler.ts) provides a minimalist proxy handler for reading index properties, and getting readonly methods (and the length) of a backing array of real strings and writer functions.

When the user tries to set a property through the array, or access a method which would modify the array, the proxy handler throws an exception with a specific message.  The message comes from the proxy handler constructor.  The idea is the creator of the proxy handler will tell the user about the safe alternative for setting values.

The backing array is the `target` parameter of each proxy trap.  It is very specifically _not_ a property of the proxy handler.  This means the same proxy handler is reusable for many backing arrays.

### `TypeStructureSet`

The [`TypeStructureSet`](./source/base/TypeStructureSet.ts) class extends `Set<string | WriterFunction | TypeStructures>`.  It overrides the `add`, `clear`, `has` and `delete` methods to update a backing array of strings and writer functions which it shares with the readonly array proxy.

### Example implementation of a types array

```typescript
export default class ClassDeclarationImpl
  extends ClassDeclarationStructureBase
  implements ClassDeclarationStructureClassIfc
{
  static readonly #implementsArrayReadonlyHandler =
    new ReadonlyArrayProxyHandler(
      "The implements array is read-only.  Please use this.implementsSet to set strings and type structures.",
    );

  readonly #implements_ShadowArray: stringOrWriterFunction[] = [];
  readonly #implementsProxyArray = new Proxy<stringOrWriterFunction[]>(
    this.#implements_ShadowArray,
    ClassDeclarationImpl.#implementsArrayReadonlyHandler,
  );

  readonly implementsSet = new TypeStructureSet(this.#implements_ShadowArray);

  get implements(): stringOrWriterFunction[] {
    return this.#implementsProxyArray;
  }
}
```

## Bootstrapping: from `ts-morph` nodes and structures to type-augmented structures

We get structures from ts-morph's `getStructures()` method, which ts-morph defines on `SourceFile` and several other node classes.  Given any node with a `getStructures()` method, and ts-morph's utilities for traversing structure trees and node trees, I can build the rest.

The source code for these lives in the [source/bootstrap](./source/bootstrap/) directory.  (Also, these largely _do_ follow the format from the stage 1 prototype, simply because it works.)

### Structure-to-node map

First I have to match [ts-morph structures to ts-morph nodes](./source/bootstrap/structureToNodeMap.ts).  This involves a multi-step process:

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

Failures here are fatal exceptions.  The structure-to-node map code _must_ work flawlessly.  (Which is a high bar, I know.)  Unlike the type structures, these structures directly reflect the ts-morph nodes they come from - and in theory, we can pass any of them back to ts-morph.  Any failures in building the Map destabilize the rest of the code.

For this reason, we have to assert that for every `Structure`, we can refer back to a `Node` where it came from.  It's an internal assertion, but absolutely critical.

### Finding the type nodes for a given node

Next we need to [find where the type nodes are](./source/bootstrap/buildTypesForStructures.ts) for each structure we care about.  This takes a `Map<Structures, Node>`, and a special type node converter (which I describe in the next section) and for each structure-node pair, runs the following algorithm:

1. Check the structure's kind property for structure-specific interfaces.
1. Assert the node is of the same type as the structure.  If it isn't, throw an exception.
1. Pass each type node belonging to the node to the type node converter.  Ignore undefined nodes.

At the end of the run, it returns all the failures the type node converter reports.

### Convert one type node to a type structure

Once we have a type node, we need to create a type structure for it.  [This is the purpose of `convertTypeNode()`](./source/bootstrap/convertTypeNode.ts).

1. Check what kind of type node it is.
2. Gather child type nodes belonging to the type node.
3. Call itself recursively for each child type node to get a child type structure.
4. Create the type structure and assign the child structures to it.
5. Return the type structure.

This function may not throw any exceptions.  It fails gracefully by calling the `consoleTrap()` callback at the point of failure and returning null up the call stack.

### Console traps I provide

```typescript
export function VoidTypeNodeToTypeStructureConsole(
  message: string,
  failingTypeNode: TypeNode,
): void
```

This is in [source/bootstrap/typeNodeConsoles.ts](./source/bootstrap/typeNodeConsoles.ts), to save some trouble.

### Discovering nodes with structures within type nodes

Occasionally, a type structure will require a structure as one of its properties.  This is because, deep within the type node's descendants, there is a node with structures we haven't resolved yet.  (This most often happens with type parameter declaration nodes.)

The `subStructureResolver()` callback exists for this purpose.  We pass it down from `buildTypesForStructures()` to `convertTypeNode()` function.

### Allowing for failures (or "this code probably doesn't cover everything")

The `convertTypeNode()` function may fail to build a matching structure.  When it does, the failure may be deep within a tree of type nodes.  

The `consoleTrap()` callback of `convertTypeNode()` exists for this purpose: to report which type node we failed on, and why.  After calling it, we return null.  Only the node which the failure occurred on (not its ancestors) will have the `consoleTrap()` invocation.  When a child call to `convertTypeNode()` returns null, we return null as well, passing it all the way up.

The `buildTypesForStructures()` function handles a null return from `convertTypeNode()` gracefully: if it gets null back, it does nothing to the type field and rolls on to the next.  Thus, a failure will leave you with a string or writer function you can still use, and (courtesy of the `TypeAccessor`) a type structure reflecting the original type field, just unparsed.

### Driving with `getTypeAugmentedStructure()`

[The `getTypeAugmentedStructure()` function](./source/bootstrap/getTypeAugmentedStructure.ts) integrates all the above together.

1. It takes a callback function for type-to-type-structure conversion failures.
1. It calls `structureToNodeMap()` to get a `Map<Structures, Node>`.
1. It calls `buildTypesForStructures()` with:
   1. The map from `structureToNodeMap()`
   1. The user's failures callback
   1. A sub-structures callback which calls `getTypeAugmentedStructure()` recursively, starting again at a deeper point in the node tree
   1. `convertTypeNode`
1. It returns the root structure, the root node, and all conversion failures it accumulated.

### Checklist for adding a new type structure class

- [ ] In [source/base/TypeStructureKind.ts](./source/base/TypeStructureKind.ts), append a new enum member of `TypeStructureKind`
- [ ] Import what you need:
  - [ ] from ts-morph:
    - [ ] `type CodeBlockWriter`,
    - [ ] `type WriterFunction`
  - [ ] From `../../../snapshot/source/exports.js`:
    - [ ] `type TypeStructureKind`
    - [ ] `type StructureImpls`
    - [ ] `type TypeStructures`
  - [ ] From `../../../snapshot/source/internal-exports.js`:
    - [ ] `type CloneableTypeStructure`
    - [ ] `STRUCTURE_AND_TYPES_CHILDREN`
    - [ ] one of the type structure bases from `internal-exports.js`:
      - `TypeStructuresBase`
      - `TypeStructuresWithChildren`
      - `TypeStructuresWithTypeParameters`
- [ ] Implement your type structure class
  - [ ] `@example` TSDoc tag above the type structure class to describe its output
  - [ ] extending your type structure base
  - [ ] `readonly kind: TypeStructureKind<Foo> = TypeStructureKind<Foo>;`
  - [ ] References to other type structures should be instances of existing type structure classes
  - [ ] References to regular structures should be instances of existing structure classes
  - [ ] `#writerFunction(writer: CodeBlockWriter): void;`
  - [ ] `readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);`
  - [ ] Implement `public static clone()`
    - [ ] The source parameter should be of the same type as your type alias
    - [ ] Use `TypeStructureClassesMap.clone()` (or `cloneArray()`) and your decorators' `cloneFoo(source, target)` functions where practical
  - [ ] Implement `[STRUCTURE_AND_TYPES_CHILDREN]` to iterate over type structures you own
    - [ ] `/** @internal */`
- [ ] Add a `satisfies` constraint for your class for the static clone method:  `ConditionalTypedStructureImpl satisfies CloneableTypeStructure<ConditionalTypedStructure>;` for example
- [ ] Add your class to the `TypeStructureClassesMap`, with your key being your `TypeStructureKind`
- [ ] Add your class to the [`TypeStructures` union](./source/structures/type/TypeStructures.ts)
- [ ] Update [convertTypeNode.ts](./source/bootstrap/convertTypeNode.ts) for the new structure and its matching type node.
- [ ] Do a build, so the new type structure class arrives in the final snapshot
- [ ] Update [the type structures test file in the final snapshot directory](../stage_2_snapshot/spec-snapshot/source/structures/TypeStructures.ts) as you see fit.
- [ ] Update [docs/guides/TypeStructures.md](/docs/guides/TypeStructures.md) to include the new type structure.
