# Stage utilities

This directory is an infrastructure grab-bag:  it provides common classes to support specialized tasks.

## Generic tools

- [DefaultMap](./source/DefaultMap.mts) extends `Map` and `WeakMap`, to provide a `getDefault()` method where the user can set a value for a key if there isn't an existing value.
- [PromiseTypes](./source/PromiseTypes.mts) is a set of utilities relating directly to basic promises.
  - `TimeoutPromise` for promises rejecting after a delay.  Useful with `Promise.race()` to ensure a task finishes in a certain length of time.
  - `SingletonPromise` for wrapping a Promise-returning method so it only runs once.
  - `PromiseAllParallel` and its sibling `PromiseAllSequence`, for mapping an array of objects into an array of promises, and then waiting for all the promises to resolve.
- [PropertyKeySorter](./source/PropertyKeySorter.mts) is a simple utility for sorting:
  1. strings by JavaScript's default sort ordering,
  2. symbols in the order the PropertyKeySorter sees them.
- [ReplaceableValue](./source/ReplaceableValue.mts) lets you define a value you want to subsitute for another, and a shared object for that replaced value to use.  This is useful for decorators which replace and/or extend the original value repeatedly.
- [RequiredInitializers](./source/RequiredInitializers.mts) is a very simple state machine for defining and resolving prerequisites, when you can't use constructors.  [See mix-in decorators](../_02_mixin_decorators/README.md).
- [`maybeDefined.mts`](./source/maybeDefined.mts) provides some utilities for making sure we've filled in some fields.  This may not have been my best idea... but it works.
- [types/Utility.d.mts](./source/types/Utility.d.mts) provides utility types, many of which I don't use but I thought I might need.

## Internal build tools

- [AsyncSpecModules](./source/AsyncSpecModules.mts) is for Jasmine test specifications to load modules dynamically.  Think of this as wrapping [the import() function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) in TypeScript.
- [getTS_SourceFile.mts](./source/getTS_SourceFile.mts) uses [ts-morph](https://ts-morph.com) to parse TypeScript source files.
- [SpyBase](./source/SpyBase.mts) provides a helper class for Jasmine spies.
