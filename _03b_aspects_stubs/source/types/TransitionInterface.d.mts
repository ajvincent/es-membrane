import type {
  MethodsOnly
} from "./MethodsOnly.mjs";

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
  Interface extends object,
  MiddleArguments extends unknown[],
> = MethodsOnly<Interface> extends never ? never :
  {
    [key in keyof Interface]: TransitionMethod<
      Parameters<Interface[key]>,
      MiddleArguments,
      ReturnType<Interface[key]>
    >
  };
