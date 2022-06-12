# Method components

A `ProxyHandler` for a membrane is a complicated beast, with several aspects to support:

- Converting arguments from the source object graph to the target object graph
- Invoking the target proxy handler (usually `Reflect`)
- Converting return values from the target object graph to the source object graph
- Populating the properties of the shadow target
- Optional assertions
  - Did we associate each argument with the right object graph?
  - Did we meet the requirements from the `Proxy` specification?

This presents an unit-testing conundrum.  How do we safely break up the the combined `ProxyHandler` into unit-testable component classes,
each of which implement traps differently, and later reintegrate them?

## Example code

```typescript
class GraphProxyHandler<T extends object> implements ShadowProxyHandler<T> {
  getOwnPropertyDescriptor(
    shadowTarget: T,
    p: propertyKey,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): PropertyDescriptor | undefined
  {
    // revoke the proxy if one of the target graphs has been revoked
    this.#checkIfGraphsRevoked(shadowTarget, nextTarget, nextHandler);

    // get the property descriptor from the target graph
    let desc = nextHandler.getOwnPropertyDescriptor(nextTarget, p);

    // apply distortions
    desc = this.#distortions.some(d => d.modifyPropertyDescriptor(p, desc));

    // wrap the descriptor for the return value
    if (desc) {
      desc = this.#currentGraph.convertDescriptor(desc);
    }

    // update the shadow target for bookkeeping
    if (desc) {
      this.#setOwnPropertyDescriptor(shadowTarget, p, desc);
    }

    return desc;
  }

  ownKeys(
    shadowTarget: T,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): ArrayLike<propertyKey>
  {
    // revoke the proxy if one of the target graphs has been revoked
    this.#checkIfGraphsRevoked(shadowTarget, nextTarget, nextHandler);

    // get the ownKeys listing from the target graph
    let keys = nextHandler.ownKeys(nextTarget);

    // apply distortions
    keys = this.#distortions.some(d => d.modifyOwnKeys(nextTarget, keys));

    // update the shadow target for bookkeeping
    this.#updateOwnKeys(shadowTarget, keys);

    return keys;
  }
}
```

That's at least five different aspects for the final `ShadowProxyHandler` to support on each trap.

## Aspect oriented programming for TypeScript: my model

[Aspect-oriented programming, according to Wikipedia](https://en.wikipedia.org/wiki/Aspect-oriented_programming)

It's not _that_ uncommon to write a function like this:

```typescript

type ComponentMethod = (arg0: type0, arg1: type1) => returnType

function runBefore(
  before: ComponentMethod,
  target: ComponentMethod
) : ComponentMethod
{
  return function(arg0: type0, arg1: type1) => returnType
  {
    before.apply(this, [arg0, arg1]);
    return target.apply(this, [arg0, arg1]);
  }
}
```

What's less common is to allow the "before" function to pass a value to the "target" function, or to modify the arguments going into "target", or to interrupt the flow and exit immediately.  In this situation, "before" takes on a different meaning than it does here.  It would be more accurate to refer to them as a _sequence_ of target functions.

This sequence has a few rules:

1. There's no limit to the number of callbacks in the sequence.
2. Each callback must have a different call signature:
  a. There must be an additional argument for handling return values from a previous callback
  b. The return signature must allow for signalling to execute the next callback.

[Array.prototype.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) gives a pretty good model for this.

So here's a new mockup:

```typescript

type ComponentMethod = (arg0: type0, arg1: type1) => returnType

const PassThroughSymbol: Symbol = Symbol("Indeterminate return");
type PASS_THROUGH_TYPE = {
  [PassThroughSymbol]: true
};

const PASS_THROUGH: PASS_THROUGH_TYPE = Object.freeze({
  [PassThroughSymbol]: true
});

// This is a prepended argument to each component method, transformed.
// I'd prefer it was appended instead, but this is easy to do with rest parameters.
class ReturnPassThrough<MethodType> {
  modifiedArguments: Parameters<MethodType>;
  returnValue: ReturnType<MethodType> | PASS_THROUGH_TYPE;

  [PassThroughSymbol] = true;

  constructor(modifiedArguments: Parameters<MethodType>)
  {
    this.modifiedArguments = modifiedArguments;
    this.returnValue = PASS_THROUGH;
  }
}

// This converts the method to another call signature, prepends the pass-through argument, and alters the return type to possibly return another pass-through.
type MaybePassThrough<MethodType extends (...args: any[]) => any> = (
    __previousResults__: ReturnPassThrough<MethodType>,
    ...args: Parameters<Method>
  ) => ReturnType<MethodType> | ReturnPassThrough<MethodType>;

function MethodSequence<MethodType>(
  ...__callbacks__: MaybePassThrough<MethodType>[]
) : MethodType
{
  return function(...args: Parameters<MethodType>) : ReturnType<MethodType>
  {
    let previousResult = new ReturnPassThrough<MethodType>(...args);
    const result = __callbacks__.reduce((previousResult, callback) => {
      if (previousResult.returnValue === PASS_THROUGH) {
        previousResult = callback(previousResult, ...previousResult.modifiedArguments);
      }

      return previousResult;
    }, previousResult);

    if (result.returnValue === PASS_THROUGH)
      throw new Error("No determined result");
    return result.returnValue;
  }
}

```

## Decorators implementing aspects

[ECMAScript decorators (currently a stage 3 proposal)](https://github.com/tc39/proposal-decorators) offer the
beginnings of a solution: transforming a function into another function is something JavaScript is very good at,
and decorators provide enough metadata to make that happen.

## Exiting from a component trap without exiting from the integrated trap

Component classes also have to be aware that they might not provide the final value to return
