import type {
  MethodsOnlyType
} from "./MethodsOnlyType.mts";

type TransitionMethod<
  IncludeHeadParameters extends boolean,
  BaseArguments extends unknown[],
  MiddleArguments extends unknown[],
  Result,
> =
  boolean extends IncludeHeadParameters ? never :
  (...args: [
    ...(true extends IncludeHeadParameters ? BaseArguments : []),
    ...MiddleArguments,
    ...BaseArguments
  ]) => Result;

export type TransitionInterface<
  IncludeHeadParameters extends boolean,
  Interface extends MethodsOnlyType,
  MiddleArguments extends unknown[],
> = {
  [key in keyof Interface]: TransitionMethod<
    IncludeHeadParameters,
    Parameters<Interface[key]>,
    MiddleArguments,
    ReturnType<Interface[key]>
  >
};
