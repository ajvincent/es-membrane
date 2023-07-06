import type {
  SetReturnType,
} from "type-fest";

import type {
  PrependArgumentsMethod,
} from "./PrependArguments.mjs";

import type {
  SharedVariablesDictionary
} from "./SharedVariablesDictionary.mjs";

import {
  RETURN_NOT_REPLACED,
} from "../symbol-keys.mjs";

/** `(this: This, __variables__: SharedVariables, __rv__: ReturnType<This[Key]>, ...parameters) => ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED;` */
export type ReturnTrapMayOverride<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
> = SetReturnType<
  PrependArgumentsMethod<This, Key, true, [SharedVariables]>,
  ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED
>;
