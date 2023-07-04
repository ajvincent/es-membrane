// #region preamble
import type {
  UnshiftableArray,
} from "#stage_utilities/source/types/Utility.mjs";

import ReplaceableValueMap from "#stage_utilities/source/ReplaceableValueMap.mjs";

import type {
  Class
} from "#mixin_decorators/source/types/Class.mjs";

import type {
  ClassDecoratorFunction
} from "#mixin_decorators/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

// #endregion preamble

export type Invariant = (this: MethodsOnlyType) => void;
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
