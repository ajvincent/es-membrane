// #region preamble

import type {
  Class
} from "type-fest";

import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import ReplaceableValueMap from "#stage_utilities/source/ReplaceableValueMap.mjs";

import type {
  ClassDecoratorFunction,
} from "#mixin_decorators/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyType,
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

// #endregion preamble

export type Invariant = (this: MethodsOnlyType) => void;

/**
 * A class wrapper for invariants.
 * @typeParam Type - the base type we're working with.
 * @param baseClass - the original class (or a replaced class from this function, if we've already done so)
 * @param invariantArray - the array of invariants.
 *
 * @returns a replacement class which will invoke all invariants for all methods.
 */
export type InvariantWrapper<Type extends MethodsOnlyType> = (
  baseClass: Class<Type>,
  invariantArray: UnshiftableArray<Invariant>
) => Class<Type>;

const ReplaceableClassesMap = new ReplaceableValueMap<
  Class<MethodsOnlyType>,
  UnshiftableArray<Invariant>
>
(
  () => []
);

/**
 * A class decorator for adding a class invariant.
 * @typeParam Type - the base type we're working with.
 * @param wrapper - a callback to wrap the original class, if we need it.
 * @param invariant - the invariant to add.
 *
 * @internal
 * @remarks
 *
 * Import AspectsDecorators instead of this file directly.
 */
export default function classInvariant<Type extends MethodsOnlyType>
(
  wrapper: InvariantWrapper<Type>,
  invariant: Invariant
): ClassDecoratorFunction<Class<Type>, true, false>
{
  return function(
    baseClass: Class<Type>,
    context
  ): Class<Type>
  {
    void(context);
    const { source, userContext } = ReplaceableClassesMap.getDefault(
      baseClass,
      (baseClass, invariantsArray) => {
        return wrapper(baseClass as Class<Type>, invariantsArray);
      }
    );

    userContext.unshift(invariant);
    return source as Class<Type>;
  }
}

classInvariant satisfies ClassDecoratorFunction<
  Class<MethodsOnlyType>, true, [InvariantWrapper<MethodsOnlyType>, Invariant]
>;
