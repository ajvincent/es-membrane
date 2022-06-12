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

## Realistic example code

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

## Aspect oriented programming for TypeScript: rewriting method types

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

So here's a new mockup, from existing code:

```typescript

// A sample type I want to rewrite.
export type NumberStringType = {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
};

type AugmentedNumberStringType = {
  repeatForward(__inserted__: PassThroughType, s: string, n: number): string | PassThroughType;
  repeatBack(__inserted__: PassThroughType, n: number, s: string): string | PassThroughType;
}
```

This "augmented" type is very similar:  the "PassThroughType" is a helper type.  It provides a few things:

```typescript

const PassThroughSymbol = Symbol("Indeterminate return");

export type PassThroughType<MethodType extends AnyFunction> = {
  // This marks the type as unique.
  [PassThroughSymbol]: boolean;

  // We can replace the arguments from one step to the next, using modifiedArguments.
  modifiedArguments: Parameters<MethodType>;

  // This allows us to call another method with the modifiedArguments.
  // ReturnOrPassThroughType I'll explain in a moment.
  callTarget(key: string) : ReturnOrPassThroughType<MethodType>;

  // Call the default target.  (Think of this as the entry point.)
  run(): ReturnType<MethodType>;
}

// So we can return the actual return value to exit out of the component tree,
// or we can return the pass-through type to signal "go on to the next" to
// the caller.  We can also execute `return __inserted__.callTarget(nextKey)`
// to pass off to another component.
export type ReturnOrPassThroughType<
  MethodType extends AnyFunction
> = ReturnType<MethodType> | PassThroughType<MethodType>;

```

So how do we go from `NumberStringType` to `AugmentedNumberStringType`?

```typescript
// This converts one method to another call signature, prepends the pass-through argument,
// and alters the return type to possibly return another pass-through.
export type MaybePassThrough<MethodType extends AnyFunction> = (
  __previousResults__: PassThroughType<MethodType>,
  ...args: Parameters<MethodType>
) => ReturnOrPassThroughType<MethodType>;

// This converts all methods of a class to the MaybePassThrough type.
// Properties we simply copy the type.
export type ComponentPassThroughClass<ClassType extends object> = {
  [Property in keyof ClassType]: ClassType[Property] extends AnyFunction ?
    MaybePassThrough<ClassType[Property]> :
    ClassType[Property];
}
```

In other words:

```typescript
export type NumberStringType = {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
};

type AugmentedNumberStringType = ComponentPassThroughClass<NumberStringType>;
```

This defines one component type.  To weave multiple components together via `.callTarget()` above, there's one more fundamental type:

```typescript
export type ComponentPassThroughMap<
  ClassType extends object
> = Map<string | symbol, ComponentPassThroughClass<ClassType>>;
```

The pass-through argument class, which I won't document here:

```typescript
export class PassThroughArgument<MethodType extends AnyFunction> implements PassThroughType<MethodType>
{
  // ...
}
```

## Generating TypeScript and invoking the method components

This takes us a lot of the way:

- I can return a final value from a rewritten method.
- I can return the pass-through argument to signify "go on to the next step".
- I can throw an exception, and it will propagate out.
- I can change the arguments going into the next step by setting `passThrough.modifiedArguments`.
- I can call other component methods via `passThrough.callTarget(_targetName_)`.

Unfortunately this still leaves two key parts out:

- Creating the pass-through argument in the first place.
- Invoking a non-augmented class to call into the augmented component classes.

Alas, this requires a bit more work.  In particular, TypeScript allows us to redefine _types_, but not _implementations_.  The good news is we have the original types in files.  The bad news is we have to generate the implementations to match.

So, how do we solve this?

1. Create shared base classes, abstracting away the common code in _protected_ methods with unique symbol names (so they don't conflict with string names).
2. Parse the types we want to create.
3. Generate classes which inherit from the shared base classes, and implement the original types.

### Shared base classes

For the single-root-component case, where other components _may_ be invoked by the root,
we have `ForwardTo_Base`.  This gets... hairy.

```typescript
// A key for derived classes to use.  A symbol to prevent conflicts with existing types.
export const INVOKE_SYMBOL = Symbol("protected invoke");

/**
 * The entry point from a non-augmented type into pass-through-augmented components.
 */
export class ForwardTo_Base {
  constructor() {
    if (new.target === ForwardTo_Base)
      throw new Error("Do not construct this class directly: subclass it!");
  }

  /**
   * @typeParam TargetMethodType - The type of the original method.
   * @typeParam TargetClassType  - The type of the original class holding the method.
   * @param initialTarget  - The starting target name in passThroughMap.
   * @param passThroughMap - The map of component classes.
   * @param methodName - The name of the method we want to call, which we get from each component via Reflect.
   * @param initialArguments       - The initial arguments to pass to the starting target.
   * @returns The original target method's type.
   */
  protected [INVOKE_SYMBOL]<
    TargetMethodType extends AnyFunction,
    TargetClassType extends object
  >
  (
    initialTarget: string | symbol,
    passThroughMap: ComponentPassThroughMap<TargetClassType>,
    methodName: string,
    initialArguments: Parameters<TargetMethodType>
  ): ReturnType<TargetMethodType>
  {
    // Convenience types we'll use a few times.
    type PassThroughMethodType         = PassThroughType<TargetMethodType>;
    type MaybePassThroughMethodType    = MaybePassThrough<TargetMethodType>;
    type ReturnOrPassThroughMethodType = ReturnOrPassThroughType<TargetMethodType>;

    // Map from a set of classes to the specifie method in each class.
    // This will go into a `new Map(__keyAndCallbackArray)`.
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map#parameters}
    const __keyAndCallbackArray__: [string | symbol, MaybePassThroughMethodType][] = [];

    passThroughMap.forEach((component, key) => {
      const __method__ = Reflect.get(component, methodName) as MaybePassThroughMethodType;

      // A convenience callback to bind the method to its parent component and key.
      type Callback = (
        passThrough: PassThroughMethodType,
        ... __args__: Parameters<TargetMethodType>
      ) => ReturnOrPassThroughMethodType;

      const __callback__: Callback = (passThrough, ...__args__) => {
        __args__ = passThrough.modifiedArguments;
        return __method__.apply(
          component,
          [passThrough, ...__args__]
        );
      };

      __keyAndCallbackArray__.push([key, __callback__]);
    });

    if (!passThroughMap.has(initialTarget)) {
      throw new Error("No initial target?");
    }

    // Create our pass-through argument.
    const __passThrough__ = new PassThroughArgument<TargetMethodType>(
      initialTarget, __keyAndCallbackArray__, initialArguments
    )

    // Let it take over.
    return __passThrough__.run();
  }
}
```

For the sequence-of-component-classes case, I combine the above helper class, which provides a generic callback for the original types, with another helper class providing a generic callback for the augmented types.  I'll explain why in a bit.

```typescript
/**
 * A base class for a sequence of augmented components.
 *
 * Create a subclass of ForwardTo_Base first,
 */
export class ForwardToSequence_Base<ClassType extends object>
{
  #subkeys: ReadonlyArray<string | symbol>;
  readonly #map: ComponentPassThroughMap<ClassType>;

  /**
   * @param key     - A root key to define to track the subkeys.
   * @param subkeys - The sequence of subkeys to run for this class.
   * @param map     - The map of keys to component classes.
   */
  constructor(
    key: string | symbol,
    subkeys: (string | symbol)[],
    map: ComponentPassThroughMap<ClassType>,
  )
  {
    if (new.target === ForwardToSequence_Base)
      throw new Error("Do not construct this class directly: subclass it!");

    if ((new Set(subkeys)).size !== subkeys.length)
      throw new Error("Duplicate key among the subkeys!");

    if (map.has(key))
      throw new Error(`The key "${String(key)}" is already in the map!`);

    this.#subkeys = subkeys;
    this.#map = map;

    // Cache this in the map as a defined component.
    map.set(key, this as unknown as ComponentPassThroughClass<ClassType>);
  }

  /**
   * Invoke each method of the sequence of components, until we get a definite result.
   * @typeParam TargetMethodType - The type of the method we will call.
   * @param methodName           - The name of the method we will call on each component.
   * @param passThroughArgument  - The pass-through argument from ForwardTo_Base.
   * @param __args__             - The original arguments.
   * @returns The first definitive result.
   */
  protected [INVOKE_SYMBOL]<
    TargetMethodType extends AnyFunction
  >
  (
    methodName: string,
    passThroughArgument: PassThroughType<TargetMethodType>,
  ): ReturnOrPassThroughType<TargetMethodType>
  {
    // Sanity check.
    for (const key of this.#subkeys)
    {
      if (!this.#map.has(key))
        throw new Error(`No component pass through for key "${String(key)}"!`);
    }

    let result: ReturnOrPassThroughType<TargetMethodType> = passThroughArgument;

    for (const key of this.#subkeys)
    {
      const entry = this.#map.get(key);
      if (!entry) {
        // In some situations, we may not have a component for a given key.
        // Thimk of this as handling debugging code, which we simply don't enable.
        continue;
      }

      // Call the augmented method of the component.
      const callback = Reflect.get(entry, methodName) as MaybePassThrough<TargetMethodType>;
      result = callback(passThroughArgument, ...passThroughArgument.modifiedArguments);

      if (result !== passThroughArgument) {
        // We're done.
        break;
      }
    }

    return result;
  }
}
```

This gives us half of what we need.  The generic `[INVOKE_SYMBOL]` method of each class has the `protected` attribute, meaning subclasses which implement
the specific types should call them.  This is also why the `new.target` check in the constructors is there:  these must be base classes.

We still have the problem of replicating the typed API's for both the entry point class (`ForwardTo_Base`) and the augmented sequence class (`ForwardToSequence_Base`).

### Parsing TypeScript type modules into an abstract syntax tree

Let's assume you've implemented the augmented types in component classes.  To recap:

```typescript

// A sample type I want to rewrite.
export type NumberStringType = {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
};

type AugmentedNumberStringType = ComponentPassThroughClass<NumberStringType>;
/*
type AugmentedNumberStringType = {
  repeatForward(
    __inserted__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string,
    n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>;
  repeatBack(
    __inserted__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>;
}
*/
```

However, entering your component still requires implementing the original type in a helper class.

```typescript
export class NumberString_ForwardTo
       extends ForwardTo_Base
       implements NumberStringType
{
  #initialTarget: string | symbol;
  #passThroughMap: ComponentPassThroughMap<NumberStringType>;

  constructor(
    initialTarget: string | symbol,
    passThroughMap: ComponentPassThroughMap<NumberStringType>
  )
  {
    super();
    this.#initialTarget = initialTarget;
    this.#passThroughMap = passThroughMap;
  }

  repeatBack(
    ...__args__: Parameters<NumberStringType["repeatBack"]>
  ): ReturnType<NumberStringType["repeatBack"]>
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatBack"],
      NumberStringType
    >
    (
      this.#initialTarget,
      this.#passThroughMap,
      "repeatBack",
       __args__
    );
  }

  repeatForward(
    ...__args__: Parameters<NumberStringType["repeatForward"]>
  ): ReturnType<NumberStringType["repeatForward"]>
  {
    return this[INVOKE_SYMBOL]<
      NumberStringType["repeatForward"],
      NumberStringType
    >
    (
      this.#initialTarget,
      this.#passThroughMap,
        "repeatForward",
        __args__
    );
  }
}
```

This is a __lot__ of boilerplate code.  No one wants to write that by hand, especially for classes with many methods.  Too bad we can't just ask TypeScript to generate this class for us.  (If we can, I haven't found the right incantation to.)

But... if we can parse the original type ourselves into an abstract syntax tree, we should be able to walk that tree and generate this code automatically.  Then we simply ask TypeScript to transpile it at a later stage in our build.

So, let's do that.

### Generating subclass modules from the abstract syntax tree

## Decorators implementing aspects

[ECMAScript decorators (currently a stage 3 proposal)](https://github.com/tc39/proposal-decorators) offer the
beginnings of a solution: transforming a function into another function is something JavaScript is very good at,
and decorators provide enough metadata to make that happen.

## Exiting from a component trap without exiting from the integrated trap

Component classes also have to be aware that they might not provide the final value to return
