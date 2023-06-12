import {
  INDETERMINATE
} from "../../symbol-keys.mjs";

import type {
  MethodsOnlyInternal
} from "./MethodsOnlyInternal.mjs";

import type {
  MethodReturnRewrite
} from "./MethodReturnRewrite.d.mts";

export type IndeterminateClass<
  Type extends MethodsOnlyInternal
> = MethodReturnRewrite<Type, typeof INDETERMINATE, true>;
