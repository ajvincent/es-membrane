/**
 * @remarks
 * This file is generated.  Do not edit.
 * @see {@link "../../build/Aspects-Dictionary-base.mts.in"}
 * @see {@link "../../build/buildAspectsDictionary.mts"}
 */

// #region preamble
import type { Class } from "type-fest";

import type {
  PushableArray
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  ClassDecoratorFunction
} from "#stage_utilities/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  VoidMethodsOnly,
  WrapThisAndParameters,
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ASPECTS_BUILDER,
} from "../stubs/symbol-keys.mjs";

import type {
  IndeterminateClass
} from "../stubs/decorators/IndeterminateReturn.mjs";

// #endregion preamble

export type AspectBuilderField<Type extends MethodsOnlyInternal> = {
  [ASPECTS_BUILDER]: AspectsBuilder<Type>
};

export type ClassWithAspects<Type extends MethodsOnlyInternal> = Class<Type> & AspectBuilderField<Type>;

export class AspectsDictionary<Type extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<VoidMethodsOnly<WrapThisAndParameters<Type>>> = [];
  readonly bodyComponents: PushableArray<IndeterminateClass<Type>> = [];

}

export class AspectsBuilder<Type extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<(thisObj: Type) => VoidMethodsOnly<WrapThisAndParameters<Type>>> = [];
  readonly bodyComponents: PushableArray<(thisObj: Type) => IndeterminateClass<Type>> = [];

  constructor(baseBuilder: AspectsBuilder<Type> | null) {
    if (baseBuilder) {
      this.classInvariants.push(...baseBuilder.classInvariants);
      this.bodyComponents.push(...baseBuilder.bodyComponents);

    }
  }
}

export function buildAspectDictionary<
  Type extends MethodsOnlyInternal,
  Class extends Type & AspectBuilderField<Type>
>
(
  __instance__: Class
) : AspectsDictionary<Type>
{
  const __dictionary__ = new AspectsDictionary<Type>;
  const __builder__: AspectsBuilder<Type> = __instance__[ASPECTS_BUILDER];

  __builder__.classInvariants.forEach(__subBuilder__ => {
    __dictionary__.classInvariants.push(__subBuilder__(__instance__));
  });
  __builder__.bodyComponents.forEach(__subBuilder__ => {
    __dictionary__.bodyComponents.push(__subBuilder__(__instance__));
  });

  return __dictionary__;
}

interface AspectDecoratorsInterface<Type extends MethodsOnlyInternal> {
  classInvariants: ClassDecoratorFunction<
    ClassWithAspects<Type>, false, [callback: (thisObj: Type) => VoidMethodsOnly<WrapThisAndParameters<Type>>]
  >;
  bodyComponents: ClassDecoratorFunction<
    ClassWithAspects<Type>, false, [callback: (thisObj: Type) => IndeterminateClass<Type>]
  >;

}

export class AspectDecorators<Type extends MethodsOnlyInternal>
implements AspectDecoratorsInterface<Type>
{
  classInvariants(
    this: void,
    callback: (thisObj: Type) => VoidMethodsOnly<WrapThisAndParameters<Type>>
  ): ClassDecoratorFunction<ClassWithAspects<Type>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_BUILDER].classInvariants.push(callback);
    }
  }
  bodyComponents(
    this: void,
    callback: (thisObj: Type) => IndeterminateClass<Type>
  ): ClassDecoratorFunction<ClassWithAspects<Type>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_BUILDER].bodyComponents.push(callback);
    }
  }

}

export const AspectsBuilderKeys: ReadonlyArray<string> = [
  "classInvariants",
  "bodyComponents",

];
