import type {
  SetReturnType
} from "type-fest";

import type {
  AssertInterface
} from "#stage_utilities/source/types/assert.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  GenericFunction
} from "./GenericFunction.d.mts";

import type {
  PrependArgumentsMethod
} from "./PrependArguments.d.mts";

import { INDETERMINATE } from "../symbol-keys.mts";

/**
 * @typeParam This - the base type we're working with.
 */
export type SharedVariablesDictionary<
  This extends MethodsOnlyType
> = {
  [key in keyof This]: object
};

export type GenericFunctionWithIndeterminate<Method extends GenericFunction> =
  SetReturnType<Method, ReturnType<Method> | typeof INDETERMINATE>;

/**
 * `(this: This, __variables__: SharedVariables, ...parameters: Parameters<This[Key]>) => (ReturnType<This[Key]> | typeof INDETERMINATE)`
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @typeParam SharedVariables - a object type for holding intra-trap variables.
 */
export type PrependedIndeterminate<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
> = GenericFunctionWithIndeterminate<PrependArgumentsMethod<
  This & AssertInterface, Key, false, [SharedVariables]
>>;
