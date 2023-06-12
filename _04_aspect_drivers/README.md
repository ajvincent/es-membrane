# Metaprogramming

I'm still figuring this out.

Membranes can be complicated beasts, with many moving parts in each of the thirteen proxy traps.  Unit-testing then becomes impossible, unless:

1. I create smaller components which do one thing well
1. I weave them together at run-time
1. I figure out some way to generate integrated classes from them.

This isn't easy.  I tried building [cross-stitch](https://github.com/ajvincent/cross-stitch) to solve this problem, but it turned out to be _far_ more expensive, time-wise and complexity-wise, than I can afford.

Thanks to the arrival of [ECMAScript decorators](https://github.com/tc39/proposal-decorators) in [TypeScript 5.0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/), I can establish a code model for [aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming).  With tools such as [ts-morph](https://ts-morph.com), I can use the source code to replace the decorators with code they reference.

Ideally, I'd produce code using a small set of decorators:

- `@classInvariants(keys: ReadonlyArray<string>)`, for invariants which must hold before and after public API access
- `@preconditions(keys: ReadonlyArray<string>)`, for debug-only precondition components
- `@postconditions(keys: ReadonlyArray<string>)`, for debug-only postcondition components
- `@checkArguments(keys: ReadonlyArray<string>)`, for argument validation beyond syntax checking
- `@checkReturn(keys: ReadonlyArray<string>)`, for ensuring the return value is correct
- `@bodySequence(keys: ReadonlyArray<string>)`, for function body blocks in sequence (including debug assertions)
  - the base class should be all "not implemented" traps.

## Internal details

1. Types will require rewriting [the basic ShadowProxyHandler type](../_04_shadowproxyhandler/source/ShadowProxyHandler.mts):
   1. Converting the return type to `void` for all but the body sequence aspects
   2. Modifying the return type for "body sequence" to allow a `CONTINUE` "on to the next component" symbol.
   3. Including a symbol-keyed static property for the type of rewriting we're doing.
   4. Supporting the `SELF` symbol in the body sequence.
   5. Core code should provide wrappers for invoking type-modified components.
2. I have to write tools to generate the run-time weaving code.
   1. This will require some "aspect map", to store the aspects we must run and in what order.
   2. Each trap needs its own implementation, as TypeScript fights back on using a shared method and `Function.prototype.apply`.
   3. Component classes must be in a direct subdirectory named "components".
   4. An additional ESLint rule for "no return" in a non-body component.
   5. Two classes deriving from the "not-implemented" base class: one for debug, one for optimized.
   6. Void-return base class for components to inherit from.
   7. Reuse the "body sequence" type (allowing returning the `CONTINUE` value) on the "not-implemented" base class.
3. Decorators need to do some sanity checks:
   1. Does the component class match the claimed type?
   2. Are we modifying the aspect map, or wrapping the original class multiple times?

### Approach: 2023-04-05

A better approach might be to break this up into smaller pieces.

I have to weld a standard `ProxyHandler` ("outer"), a transition interface like `ShadowProxyHandler` ("middle") and a standard `ProxyHandler` ("inner") together in such a way that code runs in the following order:

1. Outer entry condition for a method
2. Transition entry condition for the method
3. Inner method
4. Transition exit condition for the method with a prepended return value argument
5. Outer exit condition for the method, with a prepended return value argument

The transition methods have argument types which follow this pattern: [...original argument types, ...middle argument types, ...original argument types].

Outer, transition and inner are _composites_ of aspect-oriented types: the aspect decorators, etc. work on the same type.  For proxy handling, the innermost of the "outer" components should be a `ShadowHeadHandler` to convert into the outermost "transition" component.  Likewise, the innermost of the "transition" components should be a `TailHandler` to convert into the outermost "inner" component.

Then, for each of the composites, I can define `@nestedClass(beforeComponent | null, afterComponent | null, debug: boolean)`.

Pseudo-code:

```typescript
type BaseMethod<Arguments extends any[], Result extends any> = (...args: Arguments) => Result;

type TransitionMethod<
  BaseArguments extends any[],
  MiddleArguments extends any[],
  Result
> = (...args: [...BaseArguments, ...MiddleArguments, ...BaseArguments]) => Result;

type TransitionInterface<Interface extends object, MiddleArguments extends any[]> = {
  [key in keyof Interface]:
    Interface[key] extends BaseMethod<any[], any> ?
    TransitionMethod<Parameters<Interface[key]>, MiddleArguments, ReturnType<Interface[key]>> :
    Interface[key]
};
```

Ultimately, this will mean a file structure like this:

- source
  - types
    - NumberStringType.mts
  - generated
    - (stub classes)
  - components
    - outer
      - decorated.mts
    - transition
      - decorated.mts
    - inner
      - decorated.mts
    - stitch.mts
- source-build
  - support.mts
