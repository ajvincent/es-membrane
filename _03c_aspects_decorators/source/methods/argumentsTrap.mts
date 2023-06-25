// #region preamble
import type {
  SetReturnType
} from "type-fest";

import type {
  ClassMethodDecorator
} from "#mixin_decorators/source/types/ClassMethodDecorator.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import type {
  GenericFunction
} from "../types/GenericFunction.mjs";

// #endregion preamble

import getReplacementMethodAndAspects from "./replacementMethod.mjs";

export default function argumentsTrap<
  Type extends MethodsOnlyType,
  Key extends keyof Type,
>
(
  trapMethod: SetReturnType<Type[Key], void>
): ClassMethodDecorator<Type, Key, true, false>
{
  return function(
    method: Type[Key],
    context: ClassMethodDecoratorContext<Type, Type[Key]>
  ): Type[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects(method);
    replacement.userContext.argumentTraps.push(trapMethod);
    return replacement.source as Type[Key];
  }
}

argumentsTrap satisfies ClassMethodDecorator<
  MethodsOnlyType, keyof MethodsOnlyType, true, [SetReturnType<GenericFunction, void>]
>;
