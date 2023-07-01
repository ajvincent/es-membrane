import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

import getReplacementMethodAndAspects from "./replacementMethod.mjs";

import type {
  PreconditionContext,
  PostconditionContext,
  PreconditionWithContext,
  PostconditionWithContext,
  PreconditionWithoutContext,
  PostconditionWithoutContext,
} from "../types/PrePostConditionsContext.mjs";

export class PrePostConditionsContext<T>
implements PreconditionContext<T>, PostconditionContext<T>
{
  #context?: T;
  #hasBeenSet = false;

  set(conditionsContext: T): void {
    this.#context = conditionsContext;
    this.#hasBeenSet = true;
  }

  get(): T
  {
    if (!this.#hasBeenSet)
      throw new Error("not reachable");

    return this.#context as T;
  }
}

export function prePostCondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
  ConditionsContext,
>
(
  preTrapMethod: PreconditionWithContext<This, Key, ConditionsContext>,
  postTrapMethod: PostconditionWithContext<This, Key, ConditionsContext>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  return function(
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ): This[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects(method);
    replacement.userContext.preconditionTraps.unshift(preTrapMethod);
    replacement.userContext.postconditionTraps.unshift(
      postTrapMethod as PostconditionWithContext<This, Key, unknown>
    );

    return replacement.source as This[Key];
  }
}

function wrapPrecondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  trapWithoutContext: PreconditionWithoutContext<This, Key>,
): PreconditionWithContext<This, Key, never> {
  return function(
    this: This,
    conditionContext: PreconditionContext<never>,
    ...parameters: Parameters<This[Key]>
  ): void
  {
    void(conditionContext);
    return trapWithoutContext.apply(this, parameters);
  }
}

function wrapPostcondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  trapWithoutContext: PostconditionWithoutContext<This, Key>,
): PostconditionWithContext<This, Key, never> {
  return function(
    this: This,
    conditionContext: PostconditionContext<never>,
    rv: ReturnType<This[Key]>,
    ...parameters: Parameters<This[Key]>
  ): void {
    void(conditionContext);
    return trapWithoutContext.apply(this, [rv, ...parameters]);
  }
}

function voidPrecondtion<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  this: This,
  context: PreconditionContext<never>,
  ...parameters: Parameters<This[Key]>
): void
{
  void(context);
  void(parameters);
}

function voidPostcondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  this: This,
  context: PostconditionContext<never>,
  ...parameters: Parameters<This[Key]>
): void
{
  void(context);
  void(parameters);
}

export function preCondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  preTrapMethodWithoutContext: PreconditionWithoutContext<This, Key>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  const preTrapMethod = wrapPrecondition<This, Key>(preTrapMethodWithoutContext);
  return prePostCondition<This, Key, never>(preTrapMethod, voidPostcondition);
}

export function postCondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  postTrapMethodWithoutContext: PostconditionWithoutContext<This, Key>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  const postTrapMethod = wrapPostcondition<This, Key>(postTrapMethodWithoutContext);
  return prePostCondition<This, Key, never>(voidPrecondtion, postTrapMethod);
}
