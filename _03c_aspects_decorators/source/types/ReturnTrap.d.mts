import type {
  SetReturnType,
} from "type-fest";

import type {
  PrependArgumentsMethod,
} from "./PrependArguments.mjs";

import {
  RETURN_NOT_REPLACED,
} from "../symbol-keys.mjs";

export type ReturnTrapMayOverride<
  This extends MethodsOnlyType,
  Key extends keyof This
> = SetReturnType<
  PrependArgumentsMethod<This, Key, true, []>,
  ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED
>;
