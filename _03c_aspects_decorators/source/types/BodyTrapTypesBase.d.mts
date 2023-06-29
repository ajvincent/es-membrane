import type {
  SetReturnType
} from "type-fest";

import type {
  MethodsOnlyType
} from "#aspects/stubs/source/types/MethodsOnlyType.mjs";

import type {
  PrependArgumentsMethod
} from "./PrependArguments.mjs";

export type BodyTrapTypesBase<This extends MethodsOnlyType> = {
  [Key in keyof This]: object
}

import { INDETERMINATE } from "../symbol-keys.mjs";

export type GenericFunctionWithIndeterminate<Method extends GenericFunction> =
  SetReturnType<Method, ReturnType<Method> | typeof INDETERMINATE>;

export type PrependedIndeterminate<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends BodyTrapTypesBase<This>[Key]
> = GenericFunctionWithIndeterminate<PrependArgumentsMethod<
  This, Key, false, [SharedVariables]
>>;
