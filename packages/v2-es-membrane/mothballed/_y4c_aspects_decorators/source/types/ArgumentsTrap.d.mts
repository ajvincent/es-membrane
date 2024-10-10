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

/** `(this: This, __variables__: SharedVariables, ...parameters) => void` */
export type ArgumentsTrap<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface, Key, false, [SharedVariables]>,
  void
>;
