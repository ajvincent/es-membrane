# Mixin classes via decorators

TypeScript 5.0 introduces us to [ECMAScript decorators](https://github.com/tc39/proposal-decorators), which are quite different from the experimental decorators of the past.  With a little bit of wiring, and some _very_ specific constraints, we can build a new kind of [mix-in class](https://www.typescriptlang.org/docs/handbook/mixins.html).

## Type definitions

1. A class decorator type which is aware of the new context argument.  [TypeScript 5.0's built-in `ClassDecorator` type won't work.](https://github.com/microsoft/TypeScript/issues/53790).  [`ClassDecoratorFunction`](./source/types/ClassDecoratorFunction.d.mts) fills the bill.
1. Classes have [static fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static), which means a special type to define the static and instance fields of a subclass.  [`StaticAndInstance`](./source/types/StaticAndInstance.d.mts) defines this.
1. Without depending on `StaticAndInstance`, we need a type to define how a mix-in class joins the base class and its subclass's static and instance fields.  [`MixinClass`](./source/types/MixinClass.d.mts) is a little convoluted, but works well.
1. Combining `MixinBase` (below) with `StaticAndInstance` and `ClassDecoratorFunction` offers a [`SubclassDecorator`](./source/types/SubclassDecorator.d.mts) type.  An array of `StaticAndInstance` types gives rise to a `SubclassDecoratorSequence` type in the same file.
1. [MultiMixinClass](./source/types/MultiMixinClass.d.mts) defines a `MixinClass` type from an array of `StaticAndInstance` objects.
1. For method decorators, I have added [`ClassMethodDecorator`](./source/types/ClassMethodDecorator.d.mts).
1. [MethodsOnlyType](./source/types/MethodsOnlyType.d.mts) is for types which I expect have only methods.  It's not the Right Way to do things, but for now it will suffice.

How do I use these types?

## Classes

- [`MixinBase`](./source/MixinBase.mts) is a specific base class for crafting mix-ins.
  - Very specifically, `MixinBase` has a constructor with `(...args: any[])`, and nothing else.  Subclasses decorators can't provide a constructor with different arguments, for reasons I explain in the `MixinBase` inline documentation.
- [`MultiMixinBuilder`](./source/MultiMixinBuilder.mts) combines all of the above:
  - It takes a type parameter, `Interfaces`, which is an ordered array of `StaticAndInstance` types.
  - It takes a parameter, `decorators`, which is a `SubclassDecoratorSequence` mapping the `Interfaces` to `SubclassDecorator` instances.
  - It also takes a parameter, `baseClass`, which must be an subclass of `MixinBase`.
  - It returns a `MultiMixinClass` from the base class and invoking all the `SubclassDecorator` functions.

## Rules to follow

- Subclass constructors _must_ have spread arguments `unknown[]`, to allow further subclassing.
- Subclass constructors _may_ call `getRequiredInitializers(this).add(key)` to define a key.
- Subclass methods _must_ resolve required keys they are responsible for via `getRequiredInitializers(this).resolve(key)`, and _may_ check for a previously resolved key with `getRequiredInitializers(this).mayResolve(key)`.
  - This is how methods emulate the behavior a constructor normally imposes.
- Subclass methods _may_ ensure all required keys are resolved with the `getRequiredInitializers(this).check()` call.
- The ordering of decorators in `MultiMixinBuilder` determines the chain of derived-to-base classes.
