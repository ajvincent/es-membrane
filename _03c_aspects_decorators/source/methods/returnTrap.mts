// #region preamble

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import getReplacementMethodAndAspects from "./replacementMethod.mjs";

import type {
  ReturnTrapMayOverride
} from "../types/ReturnTrap.mjs";

// #endregion preamble

/**
 * A class method decorator for working with arguments and the return value after the body of a function.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @param trapMethod - the return trap to add.
 *
 * @internal
 * @remarks
 *
 * Import AspectsDecorators instead of this file directly.
 */
export default function returnTrap<
  This extends MethodsOnlyType,
  Key extends keyof This
>
(
  trapMethod: ReturnTrapMayOverride<This, Key>,
): ClassMethodDecoratorFunction<This, Key, true, false>
{
  return function(
    method: This[Key],
    context: ClassMethodDecoratorContext<This, This[Key]>
  ): This[Key]
  {
    void(context);
    const replacement = getReplacementMethodAndAspects<This, Key>(method);
    const { returnTraps } = replacement.userContext;
    returnTraps.unshift(trapMethod);
    return replacement.source as This[Key];
  }
}

returnTrap satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    ReturnType<MethodsOnlyType[keyof MethodsOnlyType]>
  ]
>;
