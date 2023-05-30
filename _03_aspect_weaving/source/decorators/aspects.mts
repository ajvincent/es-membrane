import type {
  ClassDecoratorFunction
} from "#stage_utilities/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  WrapThisAndParameters
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ASPECTS_KEY,
  ClassWithAspects,
} from "../AspectsDictionary.mjs";

interface AspectDecoratorsInterface<T extends MethodsOnlyInternal> {
  classInvariants: ClassDecoratorFunction<
    ClassWithAspects<T>, false, [invariant: WrapThisAndParameters<T>]
  >;
}

export default
class AspectDecorators<T extends MethodsOnlyInternal>
implements AspectDecoratorsInterface<T>
{
  classInvariants(
    this: void,
    invariant: WrapThisAndParameters<T>
  ): ClassDecoratorFunction<ClassWithAspects<T>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_KEY].classInvariants.push(invariant);
    }
  }
}
