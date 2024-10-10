# Stage utilities

This directory is an infrastructure grab-bag:  it provides common classes to support specialized tasks.

## Generic tools

- [DefaultMap](./source/DefaultMap.ts) extends `Map` and `WeakMap`, to provide a `getDefault()` method where the user can set a value for a key if there isn't an existing value.
- [PromiseTypes](./source/PromiseTypes.ts) is a set of utilities relating directly to basic promises.
  - `TimeoutPromise` for promises rejecting after a delay.  Useful with `Promise.race()` to ensure a task finishes in a certain length of time.
  - `SingletonPromise` for wrapping a Promise-returning method so it only runs once.
  - `PromiseAllParallel` and its sibling `PromiseAllSequence`, for mapping an array of objects into an array of promises, and then waiting for all the promises to resolve.
  - `PromiseDictionary` for converting a dictionary of promises (`{ [key in keyof T]: Promise<T[key]> }`) into a promise of a dictionary (`Promise<T>`).  See [the proposal-await-dictionary](https://github.com/tc39/proposal-await-dictionary) repository, which I originally started.
- [PropertyKeySorter](./source/PropertyKeySorter.ts) is a simple utility for sorting:
  1. strings by JavaScript's default sort ordering,
  2. symbols in the order the PropertyKeySorter sees them.
- [ReplaceableValueMap](./source/ReplaceableValueMap.ts) lets you define a value you want to subsitute for another, and a shared object for that replaced value to use.  This is useful for decorators which want to have a _single_ replacement for an original value (i.e. the same class decorator run more than once won't subclass more than once).
- [WeakRefSet](./source/WeakRefSet.ts) is basically a `Set<WeakRef<T>>`: it stores weak references and allows you to retrieve them later.
- [SharedAssertSet](./source/SharedAssertSet.ts): assertion failures in one object, notifying other objects of the failure so all of them can shut down.  Membranes have several proxy handlers which the user should never see, so an assertion failure in one proxy handler can terminate an entire membrane.
  - [types/assert.d.ts](./source/types/assert.d.ts) defines common assertion interfaces and types.
- [RequiredInitializers](./source/RequiredInitializers.ts) is a very simple state machine for defining and resolving prerequisites, when you can't use constructors.  [See mix-in decorators](../_02_mixin_decorators/README.md).
- [`maybeDefined.ts`](./source/maybeDefined.ts) provides some utilities for making sure we've filled in some fields.  This may not have been my best idea... but it works.
- [types/Utility.d.ts](./source/types/Utility.d.ts) provides utility types, many of which I don't use but I thought I might need.

## Internal build tools

- [AsyncSpecModules](./source/AsyncSpecModules.ts) is for Jasmine test specifications to load modules dynamically.  Think of this as wrapping [the import() function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) in TypeScript.
- [getTS_SourceFile.ts](./source/getTS_SourceFile.ts) uses [ts-morph](https://ts-morph.com) to parse TypeScript source files.
- [SpyBase](./source/SpyBase.ts) provides a helper class for Jasmine spies.
- [StateMachine_DFA](./source/stateMachines/dfa-states.ts) is a very bare-bones state machine implementation.
- [holdsArgument](./source/gc/holdsArgument.ts) and [holdsReturn](./source/gc/holdsReturn.ts) are for Jasmine test specifications to use, testing whether a particular function holds a reference to an argument or its return value, respectively.  They use two NodeJS-specific functions, `gc()` and `setImmediatePromise()`, for tests involving garbage collection.
