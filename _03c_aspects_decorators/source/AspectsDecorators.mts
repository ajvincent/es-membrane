// #region preamble

import type {
  SetReturnType,
} from "type-fest";

import type {
  Class
} from "#mixin_decorators/source/types/Class.mjs";

import type {
  ClassDecoratorFunction
} from "#mixin_decorators/source/types/ClassDecoratorFunction.mjs";

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import classInvariant, {
  type InvariantWrapper,
} from "./classes/classInvariant.mjs";

import argumentsTrap from "./methods/argumentsTrap.mjs";
import bodyTrap from "./methods/bodyTrap.mjs";
import returnTrap from "./methods/returnTrap.mjs";
import {
  prePostCondition,
  preCondition,
  postCondition,
} from "./methods/prePostCondition.mjs";

import type {
  PreconditionWithContext,
  PostconditionWithContext,
  PreconditionWithoutContext,
  PostconditionWithoutContext,
} from "./types/PrePostConditionsContext.mjs";

import type {
  SharedVariablesDictionary,
  PrependedIndeterminate,
} from "./types/SharedVariablesDictionary.mjs";

import type {
  ReturnTrapMayOverride,
} from "./types/ReturnTrap.mjs";

// #endregion preamble

/**
 * @typeParam This - the base type we're working with.
 * @typeParam BodyTrapTypes - shared argument dictionary types for body traps.
 */
export default class AspectsDecorators<
  This extends MethodsOnlyType,
  BodyTrapTypes extends SharedVariablesDictionary<This>,
>
{
  /** a class-invariant wrapper stub from aspects/decorators. */
  readonly #invariantWrapper: InvariantWrapper<This>;

  /**
   * @param invariantWrapper - a class-invariant wrapper stub from aspects/decorators.
   */
  constructor(
    invariantWrapper: InvariantWrapper<This>,
  )
  {
    this.#invariantWrapper = invariantWrapper;
    this.classInvariant = this.classInvariant.bind(this);
  }

  /**
   * Add a class invariant.
   * @param invariant - the invariant to add.
   * @returns a directly invokable class decorator.
   */
  classInvariant(
    invariant: (this: This) => void,
  ): ClassDecoratorFunction<Class<This>, true, false>
  {
    return classInvariant<This>(
      this.#invariantWrapper,
      invariant as (this: MethodsOnlyType) => void,
    );
  }

  /**
   * Add a trap for working with arguments before the body of a function.
   * @typeParam Key - the method name.
   * @param trapMethod - the argument trap to add.
   * @returns a directly invokable class method decorator.
   */
  argumentsTrap<Key extends keyof This>(
    this: void,
    trapMethod: SetReturnType<This[Key], void>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return argumentsTrap<This, Key>(trapMethod);
  }

  /**
   * Add a trap for the body of a function, which may return an early value, or INDETERMINATE to fall through.
   * @typeParam Key - the method name.
   * @typeParam SharedVariables - a object type for holding intra-trap variables.
   * @param trapMethod - `(this: This, __variables__: SharedVariables, ...parameters: Parameters<This[Key]>) => (ReturnType<This[Key]> | typeof INDETERMINATE)`
   */
  bodyTrap<Key extends keyof This>(
    this: void,
    trapMethod: PrependedIndeterminate<This, Key, BodyTrapTypes[Key]>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return bodyTrap<This, Key, BodyTrapTypes[Key]>(trapMethod);
  }

  /**
   * Add a trap for working with arguments and the return value after the body of a function.
   * @typeParam Key - the method name.
   * @param trapMethod - the return trap to add.
   * @returns a directly invokable class method decorator.
   */
  returnTrap<Key extends keyof This>(
    this: void,
    trapMethod: ReturnTrapMayOverride<This, Key>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return returnTrap<This, Key>(trapMethod);
  }

  /**
   * Apply a paired pre-condition and post-condition simultaneously.
   * @typeParam Key - the method name.
   * @typeParam ConditionsContext - a type to apply to the context object.
   * @param preTrapMethod - `(this: This, { set(context: ConditionsContext) }, ...parameters) => void`
   * @param postTrapMethod - `(this: This, { get(): ConditionsContext }, __rv__: ReturnType<This[Key]>, ...parameters) => void`
   */
  prePostCondition<Key extends keyof This, ConditionsContext>(
    this: void,
    preTrapMethod: PreconditionWithContext<This, Key, ConditionsContext>,
    postTrapMethod: PostconditionWithContext<This, Key, ConditionsContext>,
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return prePostCondition<This, Key, ConditionsContext>(preTrapMethod, postTrapMethod);
  }

  /**
   * Apply a precondition to a method.
   * @typeParam Key - the method name.
   * @param preTrapMethod - `(this: This, ...parameters) => void`
   */
  preCondition<Key extends keyof This>(
    this: void,
    preTrapMethod: PreconditionWithoutContext<This, Key>,
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return preCondition<This, Key>(preTrapMethod);
  }

  /**
   * Apply a postcondition to a method.
   * @typeParam Key - the method name.
   * @param postTrapMethod - `(this: This, __rv__: ReturnType<This[Key]>, ...parameters) => void`
   */
  postCondition<Key extends keyof This>(
    this: void,
    postTrapMethod: PostconditionWithoutContext<This, Key>
  ): ClassMethodDecoratorFunction<This, Key, true, false>
  {
    return postCondition<This, Key>(postTrapMethod);
  }
}
