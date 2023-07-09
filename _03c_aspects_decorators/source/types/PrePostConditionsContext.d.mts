// #region preamble
import type {
  SetReturnType
} from "type-fest";

import type {
  AssertInterface
} from "#stage_utilities/source/SharedAssertSet.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  PrependArgumentsMethod,
} from "./PrependArguments.mjs";
// #endregion preamble

export interface PreconditionContext<T> {
  set(conditionsContext: T): void;
}

export interface PostconditionContext<T> {
  get(): T;
}

/** `(this: This, { set(context: ConditionsContext) }, ...parameters) => void` */
export type PreconditionWithContext<
  This extends MethodsOnlyType,
  Key extends keyof This,
  Context,
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface , Key, false, [PreconditionContext<Context>]>,
  void
>;

/** `(this: This, { get(): ConditionsContext }, __rv__: ReturnType<This[Key]>, ...parameters) => void` */
export type PostconditionWithContext<
  This extends MethodsOnlyType,
  Key extends keyof This,
  Context,
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface, Key, true, [PostconditionContext<Context>]>,
  void
>;

/** `(this: This, ...parameters) => void` */
export type PreconditionWithoutContext<
  This extends MethodsOnlyType,
  Key extends keyof This
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface, Key, false, []>,
  void
>;

/** `(this: This, __rv__: ReturnType<This[Key]>, ...parameters) => void` */
export type PostconditionWithoutContext<
  This extends MethodsOnlyType,
  Key extends keyof This
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface, Key, true, []>,
  void
>;
