/**
 * @remarks
 * This file is generated.  Do not edit.
 * @see {@link "../../build/Aspects-Dictionary-base.mts.in"}
 * @see {@link "../../build/buildAspectsDictionary.mts"}
 */

// #region preamble
import type { Class } from "type-fest";


import type {
  ClassDecoratorFunction
} from "#stage_utilities/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  VoidMethodsOnly,
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ASPECTS_BUILDER,
  ASPECTS_DICTIONARY,
} from "../stubs/symbol-keys.mjs";

import type {
  IndeterminateClass
} from "../stubs/decorators/IndeterminateReturn.mjs";

export type PushableArray<T> = ReadonlyArray<T> & Pick<T[], "push">;
export type UnshiftableArray<T> = ReadonlyArray<T> & Pick<T[], "push" | "unshift">;

// #endregion preamble

export type AspectBuilderField<Type extends MethodsOnlyInternal> = {
  [ASPECTS_DICTIONARY]: AspectsDictionary<Type>;
  get [ASPECTS_BUILDER](): AspectsBuilder<Type>;
};

export type ClassWithAspects<Type extends MethodsOnlyInternal> = (
  Class<Type & AspectBuilderField<Type>, [Type]> &
  {
    [ASPECTS_BUILDER]: AspectsBuilder<Type>;
  }
);

export class AspectsDictionary<Type extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<VoidMethodsOnly<Type>> = [];
  readonly bodyComponents: PushableArray<IndeterminateClass<Type>> = [];

}

export class AspectsBuilder<Type extends MethodsOnlyInternal> {
  readonly classInvariants: UnshiftableArray<(new (thisObj: Type) => VoidMethodsOnly<Type>)> = [];
  readonly bodyComponents: UnshiftableArray<(new (thisObj: Type) => IndeterminateClass<Type>)> = [];

  constructor(baseBuilder: AspectsBuilder<Type> | null) {
    if (baseBuilder) {
      this.classInvariants.push(...baseBuilder.classInvariants);
      this.bodyComponents.push(...baseBuilder.bodyComponents);

    }
  }
}

export function buildAspectDictionary<
  Type extends MethodsOnlyInternal,
  AspectInstance extends Type & AspectBuilderField<Type>
>
(
  __wrapped__: Type,
  __instance__: AspectInstance
) : AspectsDictionary<Type>
{
  const __dictionary__ = new AspectsDictionary<Type>;
  const __builder__: AspectsBuilder<Type> = __instance__[ASPECTS_BUILDER];

  __builder__.classInvariants.forEach(__subBuilder__ => {
    __dictionary__.classInvariants.push(new __subBuilder__(__wrapped__));
  });
  __builder__.bodyComponents.forEach(__subBuilder__ => {
    __dictionary__.bodyComponents.push(new __subBuilder__(__wrapped__));
  });

  return __dictionary__;
}

interface AspectDecoratorsInterface<Type extends MethodsOnlyInternal> {
  classInvariants: ClassDecoratorFunction<
    ClassWithAspects<Type>, false, [callback: new (thisObj: Type) => VoidMethodsOnly<Type>]
  >;
  bodyComponents: ClassDecoratorFunction<
    ClassWithAspects<Type>, false, [callback: new (thisObj: Type) => IndeterminateClass<Type>]
  >;

}

export class AspectDecorators<Type extends MethodsOnlyInternal>
implements AspectDecoratorsInterface<Type>
{
  classInvariants(
    this: void,
    callback: Class<VoidMethodsOnly<Type>, [Type]>
  ): ClassDecoratorFunction<ClassWithAspects<Type>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_BUILDER].classInvariants.unshift(callback);
    }
  }
  bodyComponents(
    this: void,
    callback: Class<IndeterminateClass<Type>, [Type]>
  ): ClassDecoratorFunction<ClassWithAspects<Type>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      baseClass[ASPECTS_BUILDER].bodyComponents.unshift(callback);
    }
  }

}

export const AspectsBuilderKeys: ReadonlyArray<string> = [
  "classInvariants",
  "bodyComponents",

];
