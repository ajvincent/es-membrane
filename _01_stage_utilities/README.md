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

## Mixin classes via decorators

TypeScript 5.0 introduces us to [ECMAScript decorators](https://github.com/tc39/proposal-decorators), which are quite different from the experimental decorators of the past.  With a little bit of wiring, and some _very_ specific constraints, we can build a new kind of [mix-in class](https://www.typescriptlang.org/docs/handbook/mixins.html).

### Type definitions

1. A class decorator type which is aware of the new context argument.  [TypeScript 5.0's built-in `ClassDecorator` type won't work.](https://github.com/microsoft/TypeScript/issues/53790).  [`ClassDecoratorFunction`](./source/types/ClassDecoratorFunction.d.mts) fills the bill.
2. Classes have [static fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static), which means a special type to define the static and instance fields of a subclass.  [`StaticAndInstance`](./source/types/StaticAndInstance.d.mts) defines this.
3. Without depending on `StaticAndInstance`, we need a type to define how a mix-in class joins the base class and its subclass's static and instance fields.  [`MixinClass`](./source/types/MixinClass.d.mts) is a little convoluted, but works well.
4. Combining `MixinBase` (below) with `StaticAndInstance` and `ClassDecoratorFunction` offers a [`SubclassDecorator`](./source/types/SubclassDecorator.d.mts) type.  An array of `StaticAndInstance` types gives rise to a `SubclassDecoratorSequence` type in the same file.
5. [MultiMixinClass](./source/types/MultiMixinClass.d.mts) defines a `MixinClass` type from an array of `StaticAndInstance` objects.

How do I use these types?

### Classes

- [`MixinBase`](./source/MixinBase.mts) is a specific base class for crafting mix-ins, with a protected [`requiredInitializers`](./source/RequiredInitializers.mts) field.
  - Very specifically, `MixinBase` has a constructor with `(...args: any[])`, and nothing else.  Subclasses decorators can't provide a constructor with different arguments, for reasons I explain in the `MixinBase` inline documentation.
- [`MultiMixinBuilder`](./source/MultiMixinBuilder.mts) combines all of the above:
  - It takes a type parameter, `Interfaces`, which is an ordered array of `StaticAndInstance` types.
  - It takes a parameter, `decorators`, which is a `SubclassDecoratorSequence` mapping the `Interfaces` to `SubclassDecorator` instances.
  - It also takes a parameter, `baseClass`, which must be an subclass of `MixinBase`.
  - It returns a `MultiMixinClass` from the base class and invoking all the `SubclassDecorator` functions.
- [`maybeDefined.mts`](./source/maybeDefined.mts) provides some utilities for making sure we've filled in some fields.  This may not have been my best idea... but it works.

### Rules to follow

- Subclass constructors _must_ have arguments `unknown[]`, to allow further subclassing.
- Subclass constructors _may_ call `this.requiredInitializers.add(key)` to define a key.
- Subclass methods _must_ resolve required keys they are responsible for via `this.requiredInitializers.resolve(key)`, and _may_ check for a previously resolved key with `this.requiredInitializers.mayResolve(key)`.
  - This is how methods emulate the behavior a constructor normally imposes.
- Subclass methods _may_ ensure all required keys are resolved with the `this.requiredInitializers.check()` call.
- The ordering of decorators in `MultiMixinBuilder` determines the chain of derived-to-base classes.

## Internal build tools

- [AsyncSpecModules](./source/AsyncSpecModules.mts) is for Jasmine test specifications to load modules dynamically.  Think of this as wrapping [the import() function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) in TypeScript.
- [getTS_SourceFile.mts](./source/getTS_SourceFile.mts) uses [ts-morph](https://ts-morph.com) to parse TypeScript source files.
- [SpyBase](./source/SpyBase.mts) provides a helper class for Jasmine spies.
