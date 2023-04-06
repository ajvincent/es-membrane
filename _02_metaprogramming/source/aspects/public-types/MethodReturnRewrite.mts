import type {
  SetReturnType,
} from "type-fest";

import type {
  MethodsOnlyInternal
} from "../private-types/MethodsOnlyInternal.mjs";

export type MethodReturnRewrite<T, R, Extends extends boolean> = T extends MethodsOnlyInternal ?
  {
    [key in keyof T]: SetReturnType<
      T[key],
      Extends extends true ? ReturnType<T[key]> | R : R
    >
  } :
  never;

