import type {
  SetReturnType,
} from "type-fest";

import type {
  AssertInterface
} from "#stage_utilities/source/types/assert.mjs";

import type {
  PrependArgumentsMethod,
} from "./PrependArguments.d.mts";

import type {
  SharedVariablesDictionary
} from "./SharedVariablesDictionary.d.mts";

import {
  RETURN_NOT_REPLACED,
} from "../symbol-keys.mts";

/** `(this: This, __variables__: SharedVariables, __rv__: ReturnType<This[Key]>, ...parameters) => ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED;` */
export type ReturnTrapMayOverride<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface, Key, true, [SharedVariables]>,
  ReturnType<This[Key]> | typeof RETURN_NOT_REPLACED
>;
