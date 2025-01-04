# Structure and Type Structure Classes for `ts-morph`

In [`ts-morph`](https://ts-morph.com), structures represent the abstract syntax trees of source files and their descendant nodes... at least partially.  If you have a structure, you can create an equivalent node from it.

Structures themselves are somewhat opaque in `ts-morph`.  The documentation on them is sparse.  If you don't have one to start with, you can read the documentation on the ts-morph website (hardly complete) or the `ts-morph` source code to figure out how to create one.  There are lots of little details to get right.

One not-so-little detail: types don't have structures in `ts-morph`.  Instead, the `ts-morph` structures present them as serialized strings or writer functions.  This means, unless you happen to like writing parsers, your best tool for manipulating types is a regular expression...  not a good fit for the job.

I solve this with a completely independent (but not complete) [structure classes set](./prototype-snapshot/structures/), and a new [set of "type structure" classes](./prototype-snapshot/typeStructures/).  Where regular structure interfaces specify a `type?: string | WriterFunction` field, I add a `typeStructure: TypeStructures` field.  Similarly, `returnType?: string | WriterFunction` has a corresponding `returnTypeStructure: TypeStructures` field.

## What are type structures?

Type structures are instances of classes, representing type nodes in the TypeScript AST.  There are four fundamental type structures (meaning they can't get any simpler, and thus they have no children):

- `LiteralTypedStructure`, representing literal values (boolean, string, null, object, void, etc.) and identifiers (Foo, NumberStringType, etc.), which I print as-is.
- `StringTypedStructure`, which represents strings in double quotes.
- `SymbolKeyTypedStructure`, which represents [ECMAScript symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), and prints them in square brackets.
- `WriterFunctionTypedStructure`, for wrapping writer functions, if we get them.  (These are rare.)

The first three of these have a read-only `stringValue` property.  Their constructors take a single string as the string value.

From these, I provide more complex type structures, which a table below illustrates.

## Why does this project exist?

I originally envisioned a "interface-to-class" helper library, with an API for constructing classes out of existing types.  As my requirements grew more complex, my code became harder and harder to work with because I was creating objects which mimicked what structures (and types) do...

Eventually I realized my foundation was too rigid.  I'd locked myself into a pattern I couldn't get out of.

On the other hand, building a set of structure classes, and support for types as structures, is not trivial.  If there were an existing, "official" set of structure classes I would've used it.

Support for type structures [already has an open issue](https://github.com/dsherret/ts-morph/issues/683) with `ts-morph`, so I know other people need it.  Since no one else had written it...

### What is the long-term plan?

Ideally, I would contribute these structure classes to become part of `ts-morph` itself.  As I write this (mid-August 2023), I am preparing to pitch the `ts-morph` maintainers on precisely this.

One thing I will _not_ do is fork `ts-morph` to release my own version of it.  I do not want the maintenance headaches that would ensue, particularly as TypeScript and `ts-morph` continue to evolve.

Depending on community feedback, I may publish an independent package on `npmjs.com` as a support library for `ts-morph`.

## Features

- Compatible with `ts-morph` API's
- A nearly complete set of structure classes
- Static `clone` methods on every structure class and type structure class
- A complete (or nearly so) set of type structures
  - Each type structure has a `WriterFunction` for feeding into `ts-morph`
- Failures to create type structures fall back gracefully to the original type strings or writer functions
- Type structures matching one-to-one with type fields on all structures
  - For arrays of types, there's `TypeStructureSet`: `ClassDeclarationStructure::implementsSet`, `InterfaceDeclarationStructure::extendsSet`
- Arrays for structure fields where arrays are an option in the structure interface (so less guessing)
- Whitespace formatting for types

## Generating structures from existing code

```typescript
import { getTypeAugmentedStructure } from "#ts-morph_structures/exports.ts";
const { rootStructure, failures } = getTypeAugmentedStructure(nodeWithGetStructures);
```

That's it.  The `rootStructure` is a structure matching the root node.  It and its descendants will have type structures whenever possible.  Where it isn't possible, `failures` will tell you which nodes this project did not support.

## Creating structures from these classes

Each structure class matches the structure interface name: `s/Structure$/Impl/g`.  For instance, a `ClassDeclarationStructure` has a matching class named `ClassDeclarationImpl`, which you can import from `#ts-morph-structures/exports.mjs`.

Similarly, the type structure classes end in `TypedStructureImpl`, and you can import them from `#ts-morph-structures/exports.mjs`.  There is also a `TypeStructureKind` enum available for the new type structures.

## Whitespace formatting for types

Most type structures support a `printSettings` field, which is a `TypePrinterSettingsBase` instance:

```typescript
export class TypePrinterSettingsBase {
  indentChildren = false;
  newLinesAroundChildren = false;
  oneLinePerChild = false;
}
```

- `indentChildren` means wrap child nodes in a `CodeBlockWriter`'s `.indent()` call
- `newLinesAroundChildren` means the children as a whole have a preceding and a following new line
- `oneLinePerChild` means each child has its own line

`FunctionTypedStructureImpl` is a special case:

```typescript
  readonly typeParameterPrinterSettings = new TypePrinterSettingsBase;
  readonly parameterPrinterSettings = new TypePrinterSettingsBase;
```

## Table of type structure classes

| Class name | Examples | Key properties |
|------------|----------|----------------|
| [LiteralTypedStructureImpl](./prototype-snapshot/typeStructures/LiteralTypedStructureImpl.ts) | `string`, `number`, identifiers, etc. | stringValue |
| [StringTypedStructureImpl](./prototype-snapshot/typeStructures/StringTypedStructureImpl.ts)  | `"Hello World"` | stringValue |
| [SymbolKeyTypedStructureImpl](./prototype-snapshot/typeStructures/SymbolKeyTypedStructureImpl.ts) | `{ [YourSymbol]: boolean; }` | stringValue |
| [WriterTypedStructureImpl](./prototype-snapshot/typeStructures/WriterTypedStructureImpl.ts) | Wrapper for `(writer: CodeBlockWriter) => void` | writerFunction |
| [ParenthesesTypedStructureImpl](./prototype-snapshot/typeStructures/ParenthesesTypedStructureImpl.ts) | `(string)` | childTypes (only one) |
| [PrefixOperatorsTypedStructureImpl](./prototype-snapshot/typeStructures/PrefixOperatorsTypedStructureImpl.ts) | `keyof typeof MyClass` | operators, childTypes (only one) |
| [ArrayTypedStructureImpl](./prototype-snapshot/typeStructures/ArrayTypedStructureImpl.ts) | `string[]` | objectType |
| [TupleTypedStructureImpl](./prototype-snapshot/typeStructures/TupleTypedStructureImpl.ts) | `[string, number]` | childTypes |
| [IndexedAccessStructureImpl](./prototype-snapshot/typeStructures/IndexedAccessTypedStructureImpl.ts) | `NumberStringType["repeatForward"]` | objectType, indexType |
| [UnionTypedStructureImpl](./prototype-snapshot/typeStructures/UnionTypedStructureImpl.ts) | "one" &#x7c; "two" &#x7c; "three" | childTypes |
| [IntersectionTypedStructureImpl](./prototype-snapshot/typeStructures/IntersectionTypedStructureImpl.ts) | `Foo & Bar` | childTypes |
| [QualifiedNameTypedStructureImpl](./prototype-snapshot/typeStructures//QualifiedNameTypedStructureImpl.ts) | `SyntaxKind.SourceFile` | childTypes |
| [TypeArgumentedTypedStructureImpl](./prototype-snapshot/typeStructures/TypeArgumentedTypedStructureImpl.ts) | `Pick<Array, "slice">` | objectType, childTypes |
| [ConditionalTypedStructureImpl](./prototype-snapshot/typeStructures/ConditionalTypedStructureImpl.ts) | `foo extends true ? string : never` | checkType, extendsType, trueType, falseType |
| [MappedTypeTypedStructureImpl](./prototype-snapshot/typeStructures/MappedTypeTypedStructureImpl.ts) | `{ readonly [key in keyof Foo]: boolean }` | parameter, type |
| [FunctionTypedStructureImpl](./prototype-snapshot/typeStructures/FunctionTypedStructureImpl.ts) | `("new" or "get" or "set" or "") name&lt;typeParameters&gt;(parameters, ...restParameter) ("=>" or ":" ) returnType` | name, typeParameters, parameters, restParameter, returnType, writerStyle |
| [ParameterTypedStructureImpl](./prototype-snapshot/typeStructures/ParameterTypedStructureImpl.ts) | `foo: boolean` | name, typeStructure |
| [TemplateLiteralTypedStructureImpl](./prototype-snapshot/typeStructures/TemplateLiteralTypedStructureImpl.ts) | &#x60;`one${"A"}two${"C"}three`&#x60; | childTypes |
| [ObjectLiteralTypedStructureImpl](./prototype-snapshot/typeStructures/ObjectLiteralTypedStructureImpl.ts) | See below | callSignatures, constructSignatures, indexSignatures, methods, properties |
| [InferTypedStructureImpl](./prototype-snapshot/typeStructures/InferTypedStructureImpl.ts) | `Elements extends [infer Head, ...infer Tail]` | typeParameter |
| [ImportTypedStructureImpl](./prototype-snapshot/typeStructures/ImportTypedStructureImpl.ts) | `import("bar").NumberStringType<foo>` | argument, qualifier, childTypes |

### Object literals

```typescript
class Foo {}
type FooAlias = {
  readonly value: string;
  doSomething(): number;

  // call signature
  (...args: unknown[]): Foo;

  // construct signature
  new (...args): Foo;
}

type BarAlias = {
  // index signature
  [foo: string]: number;
}
```

Note ts-morph does not support get and set accessors on interfaces or object literals.

If there is something missing, please let me know!

## Development notes

See [the design documentation](./DESIGN.md) for details.
