import type {
  SetReturnType,
} from "type-fest";

import type {
  MethodsOnly
} from "./MethodsOnly.mjs";

export type MethodReturnRewrite<T, R, Extends extends boolean> = T extends MethodsOnly ?
  {
    [key in keyof T]: SetReturnType<
      T[key],
      Extends extends true ? ReturnType<T[key]> | R : R
    >
  } :
  never;
