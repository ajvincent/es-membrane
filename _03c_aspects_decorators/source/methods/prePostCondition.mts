// #region preamble
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

// #endregion preamble

/**
 * A shared object for passing values from a precondition to a postcondition.
 * @internal
 */
export class PrePostConditionsContext<ConditionsContext>
implements PreconditionContext<ConditionsContext>, PostconditionContext<ConditionsContext>
{
  #context?: ConditionsContext;
  #hasBeenSet = false;

  set(
    conditionsContext: ConditionsContext,
  ): void
  {
    this.#context = conditionsContext;
    this.#hasBeenSet = true;
  }

  get(): ConditionsContext
  {
    if (!this.#hasBeenSet)
      throw new Error("not reachable");

    return this.#context as ConditionsContext;
  }
}

/**
 * Apply a paired pre-condition and post-condition simultaneously.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @typeParam ConditionsContext - a type to apply to the context object.
 * @param preTrapMethod - `(this: This, { set(context: ConditionsContext) }, ...parameters) => void`
 * @param postTrapMethod - `(this: This, { get(): ConditionsContext }, __rv__: ReturnType<This[Key]>, ...parameters) => void`
 *
 * @internal
 * @remarks
 *
 * Import AspectsDecorators instead of this file directly.
 */
export function prePostCondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
  ConditionsContext,
>
(
  preTrapMethod:  PreconditionWithContext< This, Key, ConditionsContext>,
  postTrapMethod: PostconditionWithContext<This, Key, ConditionsContext>,
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  return function(
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ): This[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects(method);
    replacement.userContext.preconditionTraps.unshift(
      preTrapMethod
    );
    replacement.userContext.postconditionTraps.unshift(
      postTrapMethod as PostconditionWithContext<This, Key, unknown>
    );

    return replacement.source as This[Key];
  }
}

prePostCondition satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    preTrapMethod:  PreconditionWithContext< MethodsOnlyType, keyof MethodsOnlyType, unknown>,
    postTrapMethod: PostconditionWithContext<MethodsOnlyType, keyof MethodsOnlyType, unknown>,
  ]
>;

// #region wrapped and void conditions

/**
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param trapWithoutContext - a precondition trap which doesn't provide a context.
 * @returns a precondition with an unreachable context.
 *
 * @internal
 */
function wrapPrecondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  trapWithoutContext: PreconditionWithoutContext<This, Key>,
): PreconditionWithContext<This, Key, never>
{
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

/**
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param trapWithoutContext - a postcondition trap which doesn't provide a context.
 * @returns a postcondition with an unreachable context.
 *
 * @internal
 */
function wrapPostcondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  trapWithoutContext: PostconditionWithoutContext<This, Key>,
): PostconditionWithContext<This, Key, never>
{
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

/**
 * A precondition which never does anything.
 * @internal
 */
function voidPrecondition<
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

voidPrecondition satisfies PreconditionWithContext<MethodsOnlyType, keyof MethodsOnlyType, never>;

/**
 * A postcondition which never does anything.
 * @internal
 */
function voidPostcondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  this: This,
  context: PostconditionContext<never>,
  returnValue: ReturnType<This[Key]>,
  ...parameters: Parameters<This[Key]>
): void
{
  void(context);
  void(returnValue);
  void(parameters);
}

voidPostcondition satisfies PostconditionWithContext<MethodsOnlyType, keyof MethodsOnlyType, never>;

// #endregion wrapped and void conditions

/**
 * Apply a precondition to a method.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param preTrapMethodWithoutContext - `(this: This, ...parameters) => void`
 *
 * @internal
 * @remarks
 *
 * Import AspectsDecorators instead of this file directly.
 */
export function preCondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  preTrapMethodWithoutContext: PreconditionWithoutContext<This, Key>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  const preTrapMethod = wrapPrecondition<This, Key>(preTrapMethodWithoutContext);
  return prePostCondition<This, Key, never>(
    preTrapMethod, voidPostcondition
  );
}

preCondition satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    preTrapMethod:  PreconditionWithoutContext<MethodsOnlyType, keyof MethodsOnlyType>,
  ]
>;

/**
 * Apply a postcondition to a method.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param postTrapMethodWithoutContext - `(this: This, __rv__: ReturnType<This[Key]>, ...parameters) => void`
 *
 * @internal
 * @remarks
 *
 * Import AspectsDecorators instead of this file directly.
 */
export function postCondition<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  postTrapMethodWithoutContext: PostconditionWithoutContext<This, Key>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  const postTrapMethod = wrapPostcondition<This, Key>(postTrapMethodWithoutContext);
  return prePostCondition<This, Key, never>(
    voidPrecondition, postTrapMethod
  );
}

postCondition satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    postTrapMethod:  PostconditionWithoutContext<MethodsOnlyType, keyof MethodsOnlyType>,
  ]
>;
