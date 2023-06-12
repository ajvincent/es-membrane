import {
  INDETERMINATE
} from "../../symbol-keys.mjs";

import type {
  MethodsOnly
} from "./MethodsOnly.mjs";

import type {
  MethodReturnRewrite
} from "./MethodReturnRewrite.d.mts";

export type IndeterminateClass<
  Type extends MethodsOnly
> = MethodReturnRewrite<Type, typeof INDETERMINATE, true>;
