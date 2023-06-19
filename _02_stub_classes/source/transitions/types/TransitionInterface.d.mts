import type {
  MethodsOnly
} from "../../../source/base/types/MethodsOnly.mjs";

type TransitionMethod<
  BaseArguments extends unknown[],
  MiddleArguments extends unknown[],
  Result,
> = (...args: [
  ...BaseArguments,
  ...MiddleArguments,
  ...BaseArguments
]) => Result;

export type TransitionInterface<
  Interface extends MethodsOnly,
  MiddleArguments extends unknown[],
> = {
  [key in keyof Interface]: TransitionMethod<
    Parameters<Interface[key]>,
    MiddleArguments,
    ReturnType<Interface[key]>
  >
};
