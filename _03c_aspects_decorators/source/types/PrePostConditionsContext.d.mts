// #region preamble
import type {
  SetReturnType
} from "type-fest";

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

export type PreconditionWithContext<
  This extends MethodsOnlyType,
  Key extends keyof This,
  Context,
> = SetReturnType<
  PrependArgumentsMethod<This, Key, false, [PreconditionContext<Context>]>,
  void
>;

export type PostconditionWithContext<
  This extends MethodsOnlyType,
  Key extends keyof This,
  Context,
> = SetReturnType<
  PrependArgumentsMethod<This, Key, true, [PostconditionContext<Context>]>,
  void
>;

export type PreconditionWithoutContext<
  This extends MethodsOnlyType,
  Key extends keyof This
> = SetReturnType<This[Key], void>;

export type PostconditionWithoutContext<
  This extends MethodsOnlyType,
  Key extends keyof This
> = SetReturnType<
  PrependArgumentsMethod<This, Key, true, []>,
  void
>;
