import type {
  SetReturnType,
} from "type-fest";

import type {
  MethodsOnly
} from "./MethodsOnly.mjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrependReturn<M extends ((this: object, ...args: any[]) => any)> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CallableFunction & ((this: object, __rv__: ReturnType<M>, ...args: any[]) => any)
);

export type MethodsPrependReturn<T> = T extends MethodsOnly ? {
  [key in keyof T]: SetReturnType<PrependReturn<T[key]>, void>
} : never;
