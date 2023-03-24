import type {
  SetReturnType,
} from "type-fest";

import { CONTINUE } from "./componentSymbols.mjs";

type MethodsOnlyInternal = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: CallableFunction & ((this: object, ...args: any[]) => any)
};

export type MethodsOnly<T> = T extends MethodsOnlyInternal ? T : never;

type MethodReturnRewrite<T, R, Extends extends boolean> = T extends MethodsOnlyInternal ? {
  [key in keyof T]: SetReturnType<
    T[key],
    Extends extends true ? ReturnType<T[key]> | R : R
  >
} : never;

export type VoidMethodsOnly<T>     = MethodReturnRewrite<T, void, false>;
export type NotImplementedOnly<T>  = MethodReturnRewrite<T, never, false>;
export type BodyContinuableOnly<T> = MethodReturnRewrite<T, typeof CONTINUE, true>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrependReturn<M extends ((this: object, ...args: any[]) => any)> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CallableFunction & ((this: object, __rv__: ReturnType<M>, ...args: any[]) => any)
);

export type MethodsPrependReturn<T> = T extends MethodsOnlyInternal ? {
  [key in keyof T]: SetReturnType<PrependReturn<T[key]>, void>
} : never;
