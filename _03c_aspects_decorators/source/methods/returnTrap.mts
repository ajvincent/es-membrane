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

// #endregion preamble

export default function returnTrap<
  This extends MethodsOnlyType,
  Key extends keyof This
>
(
  trapMethod: SetReturnType<PrependArgumentsMethod<This, Key, true, []>, void>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  return function(
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ): This[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects(method);
    const { returnTraps } = replacement.userContext as MethodAspectsDictionary<This, Key>;
    returnTraps.push(trapMethod);
    return replacement.source as This[Key];
  }
}

returnTrap satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    SetReturnType<GenericFunction, void>
  ]
>;
