// #region preamble
import type {
  SetReturnType
} from "type-fest";

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import getReplacementMethodAndAspects, {
  type MethodAspectsDictionary
} from "./replacementMethod.mjs";

import type {
  GenericFunction
} from "../types/GenericFunction.mjs";

import type {
  PrependArgumentsMethod
} from "../types/PrependArguments.mjs";

import type {
  BodyTrapTypesBase
} from "../types/BodyTrapTypesBase.mjs";

// #endregion preamble

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

export default function bodyTrap<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends BodyTrapTypesBase<This>[Key]
>
(
  trapMethod: PrependedIndeterminate<This, Key, SharedVariables>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  return function(
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ): This[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects(method);
    const { bodyTraps } = replacement.userContext as MethodAspectsDictionary<This, Key>;
    bodyTraps.unshift(trapMethod as PrependedIndeterminate<This, Key, object>);
    return replacement.source as This[Key];
  }
}

bodyTrap satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    PrependedIndeterminate<MethodsOnlyType, keyof MethodsOnlyType, object>
  ]
>;
