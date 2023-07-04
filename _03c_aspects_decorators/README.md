# Aspect-oriented programming: class and method decorators

Membranes can be complicated beasts, with many moving parts in each of the thirteen proxy traps.  Unit-testing then becomes impossible, unless:

1. I create smaller components which do one thing well
1. I weave them together at run-time
1. I figure out some way to generate integrated classes from them.

This isn't easy.  I tried building [cross-stitch](https://github.com/ajvincent/cross-stitch) to solve this problem, but it turned out to be _far_ more expensive, time-wise and complexity-wise, than I can afford.

Thanks to the arrival of [ECMAScript decorators](https://github.com/tc39/proposal-decorators) in [TypeScript 5.0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/), I can establish a code model for [aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming).

## Aspect decorators as a set

To reduce overhead, [AspectsDecorators.mts](./source/AspectsDecorators.mts) provides a convenience class wrapping each of the following decorators.  This is mainly to save on shared type parameters.

Example:

```typescript
const NST_Aspects = new AspectsDecorators<NumberStringType, BodyTrapTypes>(ClassInvariantsWrapper);
const { argumentsTrap } = NST_Aspects;
```

## Production code

- [`argumentsTrap`](./source/methods/argumentsTrap.mts) lets you examine arguments of a function before actually executing it.
- [`bodyTrap`](./source/methods/bodyTrap.mts) is for the function's body, allowing early returns (and traps to decide they won't return early, via an [`INDETERMINATE` return symbol](./source/symbol-keys.mts).)
- [`returnTrap`](./source/methods/returnTrap.mts) is for after the function's main body, allowing modifying arguments and the return value as necessary.  (This will be useful for updating [shadow targets on proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) after we know the return value.)

## Debug-only code

- [`preCondition`](./source/methods/prePostCondition.mts) allows for asserting certain conditions before a method runs.  (Not for argument validation - see argumentsTrap above.)
- [`postCondition`](./source/methods/prePostCondition.mts) allows for asserting certain conditions before a method completes.
- [`prePostCondition`](./source/methods/prePostCondition.mts) combines `preCondition` and `postCondition` with a context argument you can pass from the precondition to the postcondition, if you desire.  (Say, you have a given state before an operation and want to assert a particular state after the operation.)
- [`classInvariant`](./source/classes/classInvariant.mts) provides for asserting state before and after a method runs.

## Hang on, what's the difference?

You may be wondering why `preCondition` and `argumentsTrap` exist simultaneously, or `returnTrap` and `postCondition`.  The pre- and post-conditions are explicitly for internal use, asserting we haven't done anything stupid.  The traps are for actually working with the parameters and return values of methods.

In particular, I hope to follow this pattern:

```typescript
import NST_Aspects from "#aspects/decorators/fixtures/AspectsDecorators.mjs";
const {
  argumentsTrap,
  classInvariant,
  preCondition,
  postCondition,
} = NST_Aspects;

function ProductionClass(
  baseClass: Class<NumberStringType>
): Class<NumberStringType>
{
  return class NST_Production extends baseClass
  {
    @argumentsTrap<"repeatForward">(numberIsNonNegativeIntegerForward)
    repeatForward(s: string, n: number): string
    {
      return super.repeatForward(s, n);
    }

    @argumentsTrap<"repeatBack">(numberIsNonNegativeIntegerBack)
    repeatBack(n: number, s: string): string
    {
      return super.repeatBack(s, n);
    }
  }
}

function DebugClass(
  baseClass: Class<NumberStringType>
): Class<NumberStringType>
{
  @classInvariant(instanceIsActive)
  class Debug_NST extends ProductionClass(baseClass)
  {
    @preCondition<"repeatForward">(firstArgumentIsAValueWeOwn)
    @postCondition<"repeatForward">(returnsAValueWeOwn)
    repeatForward(s: string, n: number): string
    {
      return super.repeatForward(s, n);
    }
  }

  return Debug_NST;
}
```

The debugging class above is simply asserting whatever the production class does was correct.  Now, these debug examples aren't right for a simple "repeat-a-string" class, but they're illustrations of the intent.

## Other source files

- [`replacementMethod.mts`](./source/methods/replacementMethod.mts) is what actually drives aspects on each method, except for class invariants.

### Type definitions

- [BodyTrapTypesBase](./source/types/BodyTrapTypesBase.d.mts) determine the shape of body trap functions.
- [MethodAspects](./source/types/MethodAspects.d.mts) determines the shape of method traps, pre- and post-conditions.
- [PrependArguments](./source/types/PrependArguments.d.mts) is for rewriting interfaces so methods have additional arguments.
- [PrePostConditionsContext](./source/types/PrePostConditionsContext.d.mts) defines pre-condition and post-condition method trap signatures.
