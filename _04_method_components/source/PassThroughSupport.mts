// #region PassThroughType type

import type { AnyFunction } from "./AnyFunction.mjs";

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

// #endregion PassThroughType type

// This converts the method to another call signature, prepends the pass-through argument,
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

export type ComponentPassThroughMap<
  ClassType extends object
> = Map<string | symbol, ComponentPassThroughClass<ClassType>>;

// #region class implementing PassThroughType

export class PassThroughArgument<MethodType extends AnyFunction> implements PassThroughType<MethodType>
{
  [PassThroughSymbol] = true;
  modifiedArguments: Parameters<MethodType>;

  #initialTarget: string | symbol;
  #callbackMap: Map<string | symbol, MaybePassThrough<MethodType>>;

  #visitedTargets: Set<string | symbol> = new Set;

  constructor(
    initialTarget: string | symbol,
    callbacks: [string | symbol, MaybePassThrough<MethodType>][],
    initialArguments: Parameters<MethodType>
  )
  {
    this.#initialTarget = initialTarget;
    this.#callbackMap = new Map(callbacks);

    if (!this.#callbackMap.has(this.#initialTarget))
      throw new Error("Missing initial target!");

    this.modifiedArguments = initialArguments;
  }

  callTarget(key: string | symbol) : ReturnOrPassThroughType<MethodType>
  {
    if (this.#visitedTargets.has(key))
      throw new Error(`Visited target "${String(key)}"!`)
    this.#visitedTargets.add(key);

    const target = this.#callbackMap.get(key);
    if (!target)
      throw new Error(`Missing target "${String(key)}"!`);
    return target(this, ...this.modifiedArguments);
  }

  run(): ReturnType<MethodType>
  {
    const result = this.callTarget(this.#initialTarget);
    if (result instanceof PassThroughArgument)
      throw new Error("No resolved result!");
    return result as ReturnType<MethodType>;
  }
}

// #endregion class implementing PassThroughType
