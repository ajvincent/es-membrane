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

import type {
  GenericFunction
} from "../types/GenericFunction.mjs";

// #endregion preamble

import getReplacementMethodAndAspects from "./replacementMethod.mjs";

export default function argumentsTrap<
  This extends MethodsOnlyType,
  Key extends keyof This,
>
(
  trapMethod: SetReturnType<This[Key], void>
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  return function(
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ): This[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects(method);
    replacement.userContext.argumentTraps.push(trapMethod);
    return replacement.source as This[Key];
  }
}

argumentsTrap satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [SetReturnType<GenericFunction, void>]
>;
