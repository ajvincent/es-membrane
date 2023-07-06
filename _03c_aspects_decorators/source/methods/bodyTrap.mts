// #region preamble

import type {
  ClassMethodDecoratorFunction
} from "#mixin_decorators/source/types/ClassMethodDecoratorFunction.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

import getReplacementMethodAndAspects from "./replacementMethod.mjs";

import type {
  SharedVariablesDictionary
} from "../types/SharedVariablesDictionary.mjs";

// #endregion preamble

import type {
  PrependedIndeterminate
} from "../types/SharedVariablesDictionary.mjs";

/**
 * A class method decorator which returns a resolved value in place of the original value, or INDETERMINATE to fall through.
 * @typeParam This - the base type we're working with.
 * @typeParam Key - the method name.
 * @typeParam SharedVariables - a object type for holding intra-trap variables.
 * @param trapMethod - the body trap to add.
 *
 * @internal
 * @remarks
 *
 * Import AspectsDecorators instead of this file directly.
 */
export default function bodyTrap<
  This extends MethodsOnlyType,
  Key extends keyof This,
  SharedVariables extends SharedVariablesDictionary<This>[Key]
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
    const replacement = getReplacementMethodAndAspects<This, Key, SharedVariables>(method);
    const { bodyTraps } = replacement.userContext;
    bodyTraps.unshift(trapMethod as PrependedIndeterminate<This, Key, object>);
    return replacement.source as This[Key];
  }
}

bodyTrap satisfies ClassMethodDecoratorFunction<
  MethodsOnlyType, keyof MethodsOnlyType, true, [
    PrependedIndeterminate<MethodsOnlyType, keyof MethodsOnlyType, object>
  ]
>;
