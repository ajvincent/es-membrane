import type {
  ClassDecoratorFunction
} from "#stage_utilities/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  VoidMethodsOnly,
  WrapThisAndParameters
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ClassWithAspects,
} from "../generated/AspectsDictionary.mjs";

import type {
  IndeterminateClass
} from "../stubs/decorators/IndeterminateReturn.mjs";

import {
  ASPECTS_BUILDER
} from "../symbol-keys.mjs";

interface AspectDecoratorsInterface<T extends MethodsOnlyInternal> {
  classInvariants: ClassDecoratorFunction<
    ClassWithAspects<T>, false, [invariant: (thisObj: T) => VoidMethodsOnly<WrapThisAndParameters<T>>]
  >;
  bodyComponents: ClassDecoratorFunction<
    ClassWithAspects<T>, false, [component: (thisObj: T) => IndeterminateClass<T>]
  >;
}

export default
class AspectDecorators<T extends MethodsOnlyInternal>
implements AspectDecoratorsInterface<T>
{
  classInvariants(
    this: void,
    invariant: (thisObj: T) => VoidMethodsOnly<WrapThisAndParameters<T>>
  ): ClassDecoratorFunction<ClassWithAspects<T>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_BUILDER].classInvariants.push(invariant);
    }
  }

  bodyComponents(
    this: void,
    component: (thisObj: T) => IndeterminateClass<T>
  ): ClassDecoratorFunction<ClassWithAspects<T>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_BUILDER].bodyComponents.push(component);
    }
  }
}
