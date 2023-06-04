import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrependArguments<M extends ((this: object, ...args: any[]) => any), Arguments extends unknown[]> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CallableFunction & ((this: object, ...prependedArgs: Arguments, ...args: Parameters<M>) => ReturnType<M>)
);

/**
 * @internal - this is untested code!
 */
export type MethodsPrependArguments<T, Arguments> = T extends MethodsOnlyInternal ? {
  [key in keyof T]: PrependArguments<T[key], Arguments>
} : never;
