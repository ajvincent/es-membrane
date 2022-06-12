// #region PassThroughType type

import type { AnyFunction } from "./AnyFunction.mjs";

const PassThroughSymbol = Symbol("Indeterminate return");

export type PassThroughType<MethodType extends AnyFunction> = {
  modifiedArguments: Parameters<MethodType>;
  [PassThroughSymbol]: boolean;

  callTarget(key: string) : ReturnOrPassThroughType<MethodType>;

  run(): ReturnType<MethodType>;
}

export type ReturnOrPassThroughType<MethodType extends AnyFunction> = ReturnType<MethodType> | PassThroughType<MethodType>;

// #endregion PassThroughType type

// This converts the method to another call signature, prepends the pass-through argument,
// and alters the return type to possibly return another pass-through.
export type MaybePassThrough<MethodType extends AnyFunction> = (
  __previousResults__: PassThroughType<MethodType>,
  ...args: Parameters<MethodType>
) => ReturnOrPassThroughType<MethodType>;

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
  modifiedArguments: Parameters<MethodType>;
  [PassThroughSymbol] = true;

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
