import type {
  SetReturnType,
} from "type-fest";

import type {
  AssertInterface
} from "#stage_utilities/source/SharedAssertSet.mjs";

import type {
  PrependArgumentsMethod,
} from "./PrependArguments.mjs";

import type {
  SharedVariablesDictionary
} from "./SharedVariablesDictionary.mjs";

/** `(this: This, __variables__: SharedVariables, ...parameters) => void` */
export type ArgumentsTrap<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
> = SetReturnType<
  PrependArgumentsMethod<This & AssertInterface, Key, false, [SharedVariables]>,
  void
>;
