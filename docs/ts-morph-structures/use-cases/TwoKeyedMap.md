# Use Case: Two-string keyed Map

Very often, I find myself needing a map with two keys for each value.  Instead of writing `Map<string, Map<string, object>>`, though, I want a simple class I generate from existing `Map` objects and the `Map` interface.

To do this, I'll have to bootstrap from existing `Map`, hashing the keys into a combined key... but I also have to generate a new type and then build a class for it, using [`MemberedTypeToClass`](../guides/MemberedTypeToClass.md).

## Design requirements

- There will be a private `#hashMap: Map<string, V>`, which every method will forward operations to.
- We must hash two keys into one, and we must be able to extract two keys from every hashed key.
- Otherwise, it should resemble the `Map` class very closely.

## Starting source code

```typescript
interface StringStringKey {
  readonly firstKey: string,
  readonly secondKey: string
}

class StringStringMap<V> {
  static #hashKeys(firstKey: string, secondKey: string): string {
    return JSON.stringify({firstKey, secondKey});
  }

  static #parseKeys(hashedKey: string): [string, string]
  {
    const { firstKey, secondKey } = JSON.parse(hashedKey) as StringStringKey;
    return [firstKey, secondKey];
  }

  readonly #hashMap = new Map<string, V>;
}
```

This lays the foundation for `StringStringMap`, but obviously it's nowhere near complete.  

## Getting the `Map` interfaces from TypeScript

Because the `Map` is a built-in type for TypeScript, we have to look up interfaces from TypeScript's own files.

```typescript
  /* What are we dealing with? */
  const MapInterfaceNodes = getTypeScriptNodes<InterfaceDeclaration>(
    sourceFile => sourceFile.getInterfaces().filter(ifc => ifc.getName() === "Map")
  ).map(entry => entry[1]);
  for (const node of MapInterfaceNodes) {
    console.log(node.print());
  }
```

What is this `getTypeScriptNodes` function?  I wrote this utility function in a separate module:

```typescript
import fs from "fs/promises";
import path from "path";

import {
  type SourceFile
} from "ts-morph";

import {
  NodeWithStructures,
  project,
  projectDir,
} from "./sharedProject.js";

/*
export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}
*/

const TYPESCRIPT_LIBS = path.join(projectDir, "node_modules/typescript/lib");
const fileNames = (await fs.readdir(TYPESCRIPT_LIBS)).filter(f => /^lib\..*\.d.ts$/.test(f)).map(f => path.join(TYPESCRIPT_LIBS, f));
const sourceFiles: readonly SourceFile[] = project.addSourceFilesAtPaths(fileNames);

export default function getTypeScriptNodes<
  NodeKind extends NodeWithStructures
>
(
  callback: (sourceFile: SourceFile) => NodeKind[]
): [string, NodeKind][]
{
  return sourceFiles.map(
    sourceFile => processSourceFile(sourceFile, callback)
  ).flat();
}

function processSourceFile<
  NodeKind extends NodeWithStructures
>
(
  sourceFile: SourceFile,
  callback: (sourceFile: SourceFile) => NodeKind[]
): [string, NodeKind][]
{
  const nodes = callback(sourceFile);
  const pathToSourceFile = sourceFile.getFilePath();
  return nodes.map(node => [pathToSourceFile, node]);
}
```

## What do the interfaces specify?

So before this, I asked to log the interfaces, stringified.  Some snippets:

```typescript
interface Map<K, V> {
  // ...
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
  // ...
  get(key: K): V | undefined;
  // ...
}

interface Map<K, V> {
  [Symbol.iterator](): IterableIterator<[
      K,
      V
  ]>;
  // ...
  keys(): IterableIterator<K>;
  // ...
}

interface Map<K, V> {
  readonly [Symbol.toStringTag]: string;
}
```

The first of these interfaces is not too bad.  K doesn't appear as a stand-alone type parameter, only as a type for a parameter `key`.  So I can replace `key: K` with `firstKey: string, secondKey: string` (two parameters).

The second interface is more challenging.  [`[Symbol.iterator]`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) isn't so bad: we can replace K with `string, string` in the return type.  But `keys` is a genuine problem.  `IterableIterator` is a type taking only one type parameter.  To support this, I need to turn the return type into `IterableIterator<[string, string]>`.

For the third interface, I just have to look up the documentation on [`Symbol.toStringTag`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag).

## Creating a [`TypeMembersMap`](../guides/MemberedTypeToClass.md#typemembersmap) from the interface nodes

This is relatively easy, and is necessary for `MemberedTypeToClass` to work:

```typescript
  // Create the initial type members map
  const typeMembers = new TypeMembersMap();
  MapInterfaceNodes.forEach(node => {
    const structure = getTypeAugmentedStructure(
      node, VoidTypeNodeToTypeStructureConsole, true, StructureKind.Interface
    ).rootStructure;
    typeMembers.addMembers([
      // no getters or setters to worry about
      ...structure.properties,
      ...structure.methods
    ]);
  });
```

- [TypeMembersMap API documentation](../api/ts-morph-structures.typemembersmap.md)
- [getTypeAugmentedStructure API documentation](../api/ts-morph-structures.gettypeaugmentedstructure.md) with [overload](../api/ts-morph-structures.gettypeaugmentedstructure_1.md)

## Analyzing the interfaces for type-to-class requirements

There are a few properties, but mostly methods:

### Properties

- `readonly size: number`
- `readonly [Symbol.toStringTag]: string`

### Methods

- clear
- delete
- forEach
- get
- has
- set
- `[Symbol.iterator]`
- entries
- keys
- values

I need to think of these as tables, for method statements.  Properties have their own table for initializers:

| Property name          | Initializer       |
|------------------------|-------------------|
| size                   | 0                 |
| `[Symbol.toStringTag]` | "StringStringMap" |

The methods table primarily deals with properties (the columns) and the statemented nodes (rows).

| Method name | (header) | `size` | `toStringTag` | (footer) |
|-------------|----------|--------|---------------|----------|
| clear       | | | | |
| delete      | | | | |
| forEach     | | | | |
| get         | | | | |
| has         | | | | |
| set         | | | | |
| `[Symbol.Iterator]` | | | | |
| entries     | | | | |
| keys        | | | | |
| values      | | | | |

There are two key pieces missing from these tables.  First, I know each of these methods will refer to `this.#hashMap`, but there's no interface property for private members.  (The reason for this should be obvious.)  I specified the property directly in the class stub earlier, but this now appears to be a mistake.

The second missing piece is "constructor".  The interfaces don't tell you this, but [the `Map` class has a constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map) which takes an optional argument:

```typescript
interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
    readonly prototype: Map<any, any>;
}
declare var Map: MapConstructor;
```

Our `StringStringMap` class _will_ emulate this, but for now we just need to be aware of it and adjust our method-property statements table accordingly.

To solve the first, I need to create a property signature for the property, and add the signature to the type members map.  To save myself some trouble, I'm going to remove this line from earlier:

```typescript
  readonly #hashMap = new Map<string, V>;
```

Instead, I need to create a new property signature:

```typescript
{
  const hashMap = new PropertySignatureImpl("#hashMap");
  hashMap.isReadonly = true;
  typeMembers.addMembers([hashMap]);
}
```

There's one more problem we have to solve before we can move on.  The size property should actually be a _getter_, returning our private hash map's size.

```typescript
typeMembers.convertPropertyToAccessors("size", true, false);
```

With this, I can adjust the above tables:

| Property name          | Initializer          |
|------------------------|----------------------|
| `[Symbol.toStringTag]` | "StringStringMap"    |
| `#hashMap`             | `new Map<string, V>` |

| Method name | (header) | `toStringTag` | `#hashMap` | (footer) |
|-------------|----------|---------------|------------|----------|
| clear       | | | | |
| delete      | | | | |
| forEach     | | | | |
| get         | | | | |
| has         | | | | |
| set         | | | | |
| `[Symbol.Iterator]` | | | | |
| entries     | | | | |
| keys        | | | | |
| values      | | | | |
| constructor(...?) | | | | |
| get size() | | | | |

## Adjusting method types in the `TypeMembersMap`

Most methods need _some_ adjustment.  So I'm going to call `arrayOfKind` to get the method signatures.  (Method _signatures_ in interfaces are the type definitions for the equivalent method _declarations_ in classes.)

```typescript
{
  const methods: readonly MethodSignatureImpl[] = typeMembers.arrayOfKind(StructureKind.MethodSignature);
  for (const method of methods) {
    // ...
  }
}
```

- [MethodSignatureImpl documentation](../api/ts-morph-structures.methodsignatureimpl.md)

### The `keys` method

I've already called out the `keys` method as needing special attention.  What I want is a return type of `IterableIterator<[string, string]>`.  What I have is a return type of `IterableIterator<K>`.

Here, I'm going to use NodeJS's `assert` function for a couple reasons.  (1) I wish to _assert_ the existing definition of `keys` from TypeScript doesn't change in the future.  (The odds of this are not quite infinitesimal, but if it does change, I want to know.)  (2) The [assert function allows TypeScript to _know_](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) the shape of a particular type structure.

It helps to look up the [type structures table](../guides/TypeStructures.md#table-of-type-structure-classes).  I also need to be familiar with the following properties of `MethodSignatureImpl` objects:

- name
- parameters
- returnTypeStructure

For the `keys` case, I'll skip the research and present the solution:

```typescript
if (method.name === "keys") {
  const { returnTypeStructure } = method;
  assert.equal(returnTypeStructure?.kind, TypeStructureKind.TypeArgumented, "Expected a type-argumented type.");
  assert.equal(returnTypeStructure.objectType, LiteralTypeStructureImpl.get("IterableIterator"), "Expected an IterableIterator");
  assert.equal(returnTypeStructure.childTypes.length, 1);
  assert.equal(returnTypeStructure.childTypes[0], LiteralTypeStructureImpl.get("K"));

  returnTypeStructure.childTypes[0] = new TupleTypeStructureImpl([
    LiteralTypeStructureImpl.get("string"),
    LiteralTypeStructureImpl.get("string"),
  ]);
  continue;
}
```

- [LiteralTypeStructureImpl documentation](../api/ts-morph-structures.literaltypestructureimpl.md)
- [TupleTypeStructure documentation](../api/ts-morph-structures.tupletypestructureimpl.md)
- [TypeStructureKind documentation](../api/ts-morph-structures.typestructurekind.md)

Note I probably could've gotten away with replacing the `K` with `{ firstKey: string, secondKey: string }`.

### Other iterator methods

The `[Symbol.iterator]()` and `entries()` methods already specify `IterableIterator<[K, V]>`.  I want `IterableIterator<[string, string, V]>`.  I think, from the keys example above, the solution for this should be obvious.

The `values` method I don't need to adjust at all: `IterableIterator<V>`.  

### The `forEach` method

Here the adjustments are to the _arguments_ of `forEach` - and they're a little deeper for the first argument, which is a callback function.  So we'll be dealing with the `parameters` array property of the method signature.

```typescript
if (method.name === "forEach") {
  // forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
  const callbackFn: ParameterDeclarationImpl = method.parameters[0];

  const { typeStructure } = callbackFn;
  assert.equal(typeStructure?.kind, TypeStructureKind.Function, "the callback should be a function");

  const firstKeyParam = new ParameterTypeStructureImpl("firstKey", LiteralTypeStructureImpl.get("string"));
  const secondKeyParam = new ParameterTypeStructureImpl("secondKey", LiteralTypeStructureImpl.get("string"));

  typeStructure.parameters.splice(1, 1, firstKeyParam, secondKeyParam);
  typeStructure.parameters[3].typeStructure = new TypeArgumentedTypeStructureImpl(
    LiteralTypeStructureImpl.get("StringStringMap"),
    [LiteralTypeStructureImpl.get("V")]
  );
  continue;
}
```

- [FunctionTypeStructureImpl](../api/ts-morph-structures.functiontypestructureimpl.md)
- [ParameterDeclarationImpl](../api/ts-morph-structures.parameterdeclarationimpl.md)
- [ParameterTypeStructureImpl](../api/ts-morph-structures.parametertypestructureimpl.md)

### Other methods taking arguments

At this point, the only methods we haven't touched are those with simple parameters, where one of the parameters may be the `key` parameter.  A simple parameter replacement should suffice.

```typescript
const { parameters } = method;
const keyIndex = parameters.findIndex(param => param.name === "key");
if (keyIndex > -1) {
  const firstParam = new ParameterDeclarationImpl("firstKey");
  firstParam.typeStructure = LiteralTypeStructureImpl.get("string");

  const secondParam = new ParameterDeclarationImpl("secondKey");
  secondParam.typeStructure = LiteralTypeStructureImpl.get("string");

  parameters.splice(keyIndex, 1, firstParam, secondParam);
}
```

### Checkpoint

We should print the existing type members as an interface, to make sure we're on track.  Looking over the `TypeMembersMap`, there is a `moveMembersToType` method, but the documentation says "clear this map" after doing so.  That could be a problem.

Fortunately, there's also a `clone()` method.  We'll also need to feed an interface declaration to ts-morph to use its printing capability.

```typescript
const interfaceTemp = new InterfaceDeclarationImpl("StringStringMapInterface");
typeMembers.clone().moveMembersToType(interfaceTemp);
const interfaceNode: InterfaceDeclaration = moduleFile.addInterface(interfaceTemp);
console.log(interfaceNode.print());
interfaceNode.remove();
```

- [InterfaceDeclarationImpl API documentation](../api/ts-morph-structures.interfacedeclarationimpl.md)

The resulting output:

```typescript
interface StringStringMapInterface {
    /** @returns the number of elements in the Map. */
    get size(): number;
    readonly [Symbol.toStringTag]: string;
    readonly #hashMap;
    clear(): void;
    /** @returns true if an element in the Map existed and has been removed, or false if the element does not exist. */
    delete(firstKey: string, secondKey: string): boolean;
    /**
     * Executes a provided function once per each key/value pair in the Map, in insertion order.
     */
    forEach(callbackfn: (value: V, firstKey: string, secondKey: string, map: StringStringMap) => void, thisArg?: any): void;
    /**
     * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
     * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
     */
    get(firstKey: string, secondKey: string): V | undefined;
    /** @returns boolean indicating whether an element with the specified key exists or not. */
    has(firstKey: string, secondKey: string): boolean;
    /**
     * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
     */
    set(firstKey: string, secondKey: string, value: V): this;
    /** Returns an iterable of entries in the map. */
    [Symbol.iterator](): IterableIterator<[
        string,
        string,
        V
    ]>;
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    entries(): IterableIterator<[
        string,
        string,
        V
    ]>;
    /**
     * Returns an iterable of keys in the map
     */
    keys(): IterableIterator<[
        string,
        string
    ]>;
    /**
     * Returns an iterable of values in the map
     */
    values(): IterableIterator<V>;
}
```

The `readonly #hashMap;` part is clearly illegal for an interface.  But that's okay, because this is just a check point.  I can ignore that.  The rest of this pseudo-interface is correct.

We are ready to start on the _hard_ part.

## Using `MemberedTypeToClass` to build the class

### Properties, headers and footers affecting methods and getters

Now that we know the shape of what we're trying to implement, we can fill out the rest of our properties / methods tables.

| Property name          | Initializer          |
|------------------------|----------------------|
| `[Symbol.toStringTag]` | "StringStringMap"    |
| `#hashMap`             | `new Map<string, V>` |

| Method name         | (header) | `toStringTag` | `#hashMap` | (footer) |
|---------------------|----------|---------------|------------|----------|
| clear               |          |               | &#x2713;   |          |
| delete              | &#x2713; |               |            | &#x2713; |
| forEach             |          |               | &#x2713;   |          |
| get                 | &#x2713; |               | &#x2713;   | &#x2713; |
| has                 | &#x2713; |               | &#x2713;   | &#x2713; |
| set                 | &#x2713; |               | &#x2713;   | &#x2713; |
| `[Symbol.Iterator]` |          |               | &#x2713;   |          |
| entries             |          |               |            | &#x2713; |
| keys                |          |               | &#x2713;   |          |
| values              |          |               |            | &#x2713; |
| constructor(...?)   |          |               | &#x2713;   |          |
| get size()          |          |               |            | &#x2713; |

These require a bit of explanation, and the decisions are partially arbitrary.  

1. We hash the keys coming in or parse the keys from the map.  I will use the `(header)` traps for this.
2. Most methods require we do something with the hash map.
3. Several methods require returning a value.  I will use the `(footer)` traps for this.

`entries` is a special case, in that it can just call `return this[Symbol.iterator]()`.

For the `keys` iterator, I am making a conscious decision to keep statements in the `#hashMap` property column.  This is because I know I will be iterating over the hash map, and using [generator syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator).  I follow the same pattern for `[Symbol.iterator]`.

For the `values` iterator, I simply need to return `this.#hashMap.values()`.  The `size` getter is equally simple.

You may have noticed `toStringTag` didn't have any checkmarks in its column here.  This property has zero impact on the methods, so I don't need to do anything with it.

### Initializing the class builder

Following the `MemberedTypeToClass` guide, there are certain steps we need to take:

- Adding the type members
- Defining the constructor's parameters
- Defining which methods are generators
- Adding a statement purpose

```typescript
const typeToClass = new MemberedTypeToClass();
typeToClass.importFromTypeMembersMap(false, typeMembers);
{
  const param = new ParameterDeclarationImpl("entries");
  param.typeStructure = parseLiteralType(`[string, string, V][]`);
  param.initializer = "[]";
  typeToClass.constructorParameters.push(param);
}

typeToClass.isGeneratorCallback = {
  isGenerator: function(isStatic, methodName): boolean {
    return methodName === "[Symbol.iterator]" || methodName === "keys";
  }
};
typeToClass.defineStatementsByPurpose("main body", false);
```

- [parseLiteralType API documentation](../api/ts-morph-structures.parseliteraltype.md)

I use `parseLiteralType` here because it's more human-readable.  It's less efficient to be sure, but I've already illustrated building type structures manually.  Since this is the last complex type I expect to define directly, it's fine here.

### Registering statement getters

Our tables above indicate what statement getters we need.  First, the `toStringTag` property.  We need to initialize its value in the class.  This means an object which implements `ClassStatmentsGetter` and `PropertyInitialzierGetter`.

```typescript
const toStringTagGetter: ClassStatementsGetter & PropertyInitializerGetter = {
  keyword: "Symbol.toStringTag",
  supportsStatementsFlags: ClassSupportsStatementsFlags.PropertyInitializer,

  filterPropertyInitializer: function (key: MemberedStatementsKey): boolean {
    return key.fieldKey === "[Symbol.toStringTag]";
  },

  getPropertyInitializer: function (key: MemberedStatementsKey): string {
    void(key);
    return `"StringStringMap"`;
  }
};
```

- [ClassStatementsGetter interface](../api/ts-morph-structures.classstatementsgetter.md)
- [ClassSupportsStatementsFlags enum](../api/ts-morph-structures.classsupportsstatementsflags.md)
- [MemberedStatementsKey interface](../api/ts-morph-structures.memberedstatementskey.md)
- [PropertyInitializerGetter interface](../api/ts-morph-structures.propertyinitializergetter.md)

We will need a property initializer for the `#hashMap` property as well.  I'll skip past the boilerplate here.

The iterators are complex enough to go next.  Our table above indicates for `keys`, `values`, `entries` and `Symbol.iterator`, we need the `ClassBodyStatementsGetter` and `ClassTailStatementsGetter` interfaces.

```typescript
const iteratorStatements: ClassStatementsGetter & ClassBodyStatementsGetter & ClassTailStatementsGetter = {
  keyword: "iterators",
  supportsStatementsFlags: ClassSupportsStatementsFlags.BodyStatements | ClassSupportsStatementsFlags.TailStatements,

  filterBodyStatements: function(key: MemberedStatementsKey): boolean {
    if (key.fieldKey !== "#hashMap")
      return false;
    return key.statementGroupKey === "keys" || key.statementGroupKey === "[Symbol.iterator]";
  },
  getBodyStatements: function(key: MemberedStatementsKey): string[] {
    return [`
      for (const x of this.#hashMap${key.statementGroupKey === "keys" ? "." + key.statementGroupKey : key.statementGroupKey}()) {
        const [ firstKey, secondKey ] = StringStringMap.#parseKeys(${key.fieldKey === "keys" ? "x" : "x[0]"});
        yield [firstKey, secondKey${key.statementGroupKey === "[Symbol.iterator]" ? ", x[1]" : ""}];
      }
    `.trim()];
  },

  filterTailStatements: function(key: MemberedStatementsKey): boolean {
    return key.statementGroupKey === "values" || key.statementGroupKey === "entries";
  },

  getTailStatements: function(key: MemberedStatementsKey): string[] {
    if (key.statementGroupKey === "values") {
      return [`return this.#hashMap.values()`];
    }

    return [`return this[Symbol.iterator]();`]
  }
};
```

- [ClassBodyStatementsGetter interface](../api/ts-morph-structures.classbodystatementsgetter.md)
- [ClassTailStatementsGetter interface](../api/ts-morph-structures.classtailstatementsgetter.md)

Then there's `forEach()`.  There's no elegance here, just brute force.

```typescript
const forEachStatements: ClassStatementsGetter & ClassBodyStatementsGetter = {
  keyword: "forEach",
  supportsStatementsFlags: ClassSupportsStatementsFlags.BodyStatements,

  filterBodyStatements: function(key: MemberedStatementsKey): boolean {
    return key.fieldKey === "#hashMap" && key.statementGroupKey === "forEach";
  },

  getBodyStatements: function(key: MemberedStatementsKey): string[] {
    void(key);
    return [`
      this.#hashMap.forEach((value, key): void => {
        const [ firstKey, secondKey ] = StringStringMap.#parseKeys(key);
        callbackfn.call(thisArg, value, firstKey, secondKey, this);
      }, thisArg);
    `.trim()];
  }
};
```

At this point we've dealt with the hard cases, and we can start doing simpler forwarding code.  These all depend on `#hashMap`, but only some of them have the `firstKey` and `secondKey` parameters.  This time, instead of relying on the statement group key, I'll rely on the method's type signature.

```typescript
const forwardToMapMethods: (
  ClassStatementsGetter & ClassHeadStatementsGetter &
  ClassBodyStatementsGetter & ClassTailStatementsGetter
) = {
  keyword: "forward-to-map",
  supportsStatementsFlags:
    ClassSupportsStatementsFlags.HeadStatements |
    ClassSupportsStatementsFlags.BodyStatements |
    ClassSupportsStatementsFlags.TailStatements,

  filterHeadStatements: function(key: MemberedStatementsKey): boolean {
    if (key.groupType?.kind !== StructureKind.MethodSignature)
      return false;
    return Boolean(key.groupType.parameters.find(param => param.name === "firstKey"));
  },

  getHeadStatements: function(key: MemberedStatementsKey): string[] {
    void(key);
    return [`
      const key = StringStringMap.#hashKeys(firstKey, secondKey);
    `.trim()];
  },

  filterBodyStatements: function(key: MemberedStatementsKey): boolean {
    return this.filterHeadStatements(key) && key.fieldKey === "#hashMap";
  },

  getBodyStatements: function(key: MemberedStatementsKey): string[] {
    return [`
    ${
      key.statementGroupKey !== "set" ? "const rv = " : ""
    }this.#hashMap.${key.statementGroupKey}(key${
      key.statementGroupKey === "set" ? ", value" : ""
    });
    `.trim()]
  },

  filterTailStatements: function(key: MemberedStatementsKey): boolean {
    return this.filterHeadStatements(key);
  },

  getTailStatements: function(key: MemberedStatementsKey): string[] {
    if (key.statementGroupKey === "set")
      return [`return this;`];
    return [`return rv;`];
  }
};
```

- [ClassHeadStatementsGetter interface](../api/ts-morph-structures.classheadstatementsgetter.md)

You may be wondering why `set` has special treatment inside the `getBodyStatements()` and `getTailStatements()` methods.  The reason is `Map.set()` returns the `Map` instance, and `StringStringMap.prototype.set()` returns `this` as well.

There's only three class members left:  `clear` and `get size()`, and the constructor.

```typescript
const noKeyMembers: ClassStatementsGetter & ClassTailStatementsGetter & ConstructorBodyStatementsGetter = {
  keyword: "no-key-members",
  supportsStatementsFlags: ClassSupportsStatementsFlags.TailStatements | ClassSupportsStatementsFlags.ConstructorBodyStatements,

  filterTailStatements: function(key: MemberedStatementsKey): boolean {
    return key.statementGroupKey === "get size" || key.statementGroupKey === "clear";
  },

  getTailStatements: function(key: MemberedStatementsKey): string[] {
    if (key.statementGroupKey === "get size")
      return [`return this.#hashMap.size;`];
    return [
      `return this.#hashMap.clear();
    `.trim()];
  },

  filterCtorBodyStatements: function(key: MemberedStatementsKey): boolean {
    return key.fieldKey === "#hashMap";
  },

  getCtorBodyStatements: function(key: MemberedStatementsKey): string[] {
    void(key);
    return [`
      entries.forEach(([firstKey, secondKey, value]) => this.set(firstKey, secondKey, value));
    `.trim()];
  }
};
```

- [ConstructorBodyStatementsGetter interface](../api/ts-morph-structures.constructorbodystatementsgetter.md)

We have all these statement getters.  Now we need to register them.

```typescript
typeToClass.addStatementGetters(0, [
  toStringTagGetter, hashMapInitializer, iteratorStatements,
  forEachStatements, forwardToMapMethods, noKeyMembers,
]);
```

### Actually building the class

```typescript
// getting the class with its static methods defined
const classDecl = moduleFile.getClassOrThrow("StringStringMap");
const classStructure = ClassDeclarationImpl.clone(classDecl.getStructure());

// build the class!
const classMembers = typeToClass.buildClassMembersMap();
classMembers.moveMembersToClass(classStructure);

/*
This doesn't work due to a bug in ts-morph:
classDecl.set(classStructure);

Instead, I do this, which is almost as good:
*/
classDecl.remove();
moduleFile.addClass(classStructure);

await moduleFile.save();
```

- [ClassDeclarationImpl API documentation](../api/ts-morph-structures.classdeclarationimpl.md)

## The final code and after-thoughts

- [Source code to build the StringStringMap module](https://github.com/ajvincent/ts-morph-structures/blob/main/use-cases/build/StringStringMap.ts)
- [The actual StringStringMap generated module](https://github.com/ajvincent/ts-morph-structures/blob/main/use-cases/dist/StringStringMap.ts)

First, the `StringStringMap` class is potentially useful, but limited.  I run into situations quite often where I have a two- or three-part key I need to use in a map or weak-map scenario, and the keys aren't always strings.  This is one reason why I created the [`composite-collection`](https://www.npmjs.com/package/composite-collection) package.

Second, this class, while _probably_ usable or close to it, is not polished for production use.

- ESLint rejects it for an `any` type in the `forEach` method
- The code is very ugly in its whitespace formatting.  [Prettier](https://prettier.io/playground/) would clean it up nicely, and it's not hard to [write a script to invoke Prettier](https://github.com/ajvincent/ts-morph-structures/blob/main/utilities/source/runPrettify.ts).
- I have written precisely _zero_ tests for this.
- The [tsdoc comments](https://tsdoc.org) comments are insufficient.
- I haven't written general purpose documentation for it either.

Both of these concerns are beside the point.  You _can_ build a realistic class from nothing but the interfaces and existing classes, using ts-morph.  The ts-morph-structures package's tools make it somewhat easier... but there's still a fair bit of complexity to writing (and maintaining) code which generates other code.  There's really no getting around that.
