# Stage utilities

This directory is an infrastructure grab-bag:  it provides common classes to support specialized tasks.

## Generic tools
- Collections:
  - [AwaitedMap](./source/collections/AwaitedMap.ts) for `Promise<Map<Key, Value>>` support.
  - [OneToOneStrongMap](./source/collections/) defines 1:1 relationships between objects: if we hold one object, we can look up the other by the first object and a key representing the second object's graph.
  - [WeakRefSet](./source/collections/WeakRefSet.ts) is basically a iterable `WeakSet`: it stores weak references and allows you to retrieve them later.
  - [WeakStrongMap](./source/collections/WeakStrongMap.ts) is a two-keyed Map, where the first key is a `WeakMap` key and the second key is a `Map` key.
- [PromiseTypes](./source/PromiseTypes.ts) is a set of utilities relating directly to basic promises.
  - `SingletonPromise` for wrapping a Promise-returning method so it only runs once.
  - `PromiseAllParallel` and its sibling `PromiseAllSequence`, for mapping an array of objects into an array of promises, and then waiting for all the promises to resolve.
- [PropertyKeySorter](./source/PropertyKeySorter.ts) is a simple utility for sorting:
  1. strings by JavaScript's default sort ordering,
  2. symbols in the order the PropertyKeySorter sees them.
- [ReplaceableValueMap](./source/ReplaceableValueMap.ts) lets you define a value you want to subsitute for another, and a shared object for that replaced value to use.  This is useful for decorators which want to have a _single_ replacement for an original value (i.e. the same class decorator run more than once won't subclass more than once).
- [types/Utility.d.ts](./source/types/Utility.d.ts) provides utility types, many of which I don't use but I thought I might need.

## Internal build tools

- [AsyncSpecModules](./source/AsyncSpecModules.ts) is for Jasmine test specifications to load modules dynamically.  Think of this as wrapping [the import() function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) in TypeScript.
- [getTS_SourceFile.ts](./source/getTS_SourceFile.ts) uses [ts-morph](https://ts-morph.com) to parse TypeScript source files.
- [SpyBase](./source/SpyBase.ts) provides a helper class for Jasmine spies.
