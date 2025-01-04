# Structure and Type Structure Classes for `ts-morph`

In [`ts-morph`](https://ts-morph.com), structures represent the abstract syntax trees of source files and their descendant nodes... at least partially.  If you have a structure, you can create an equivalent node from it.

Structures themselves are somewhat opaque in `ts-morph`.  The documentation on them is sparse.  If you don't have one to start with, you can read the documentation on the ts-morph website (hardly complete) or the `ts-morph` source code to figure out how to create one.  There are lots of little details to get right.

One not-so-little detail: types don't have structures in `ts-morph`.  Instead, the `ts-morph` structures present them as serialized strings or writer functions.  This means, unless you happen to like writing parsers, your best tool for manipulating types is a regular expression...  not a good fit for the job.

I solve this with a completely independent structure classes set, and a new set of "type structure" classes.  Where regular structure interfaces specify a `type?: string | WriterFunction` field, I add a `typeStructure: TypeStructures` field.  Similarly, `returnType?: string | WriterFunction` has a corresponding `returnTypeStructure: TypeStructures` field.

## Guides

- [Structure Classes](./guides/StructureClasses.md)
- [Type Structures](./guides/TypeStructures.md)
- [Navigating Structures](./guides/NavigatingStructures.md)
- [Import and Export Managers](./guides/ImportsAndExports.md)
- ["Membered Type To Class" Primer](./guides/MemberedTypeToClass.md)
  - includes tools such as `ClassMembersMap` and `TypeMembersMap`
- [When to use this library, versus direct ts-morph interaction](./guides/when-to-use.md)

## Use cases

- [`Two-string keyed map`](./use-cases/TwoKeyedMap.md)

## References

- [ts-morph Structures Reference](./reference/structure-types.md)
- [Auto-generated documentation](./api/ts-morph-structures.md) (courtesy of [API Extractor](https://api-extractor.com/) and [API Documenter](https://api-extractor.com/pages/setup/generating_docs/))
