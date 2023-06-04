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
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  VoidMethodsOnly,
  WrapThisAndParameters,
} from "#stub_classes/source/base/types/export-types.mjs";

import {
  ASPECTS_BUILDER,
} from "../symbol-keys.mjs";

import type {
  IndeterminateClass
} from "../stub-decorators/IndeterminateReturn.mjs";

// #endregion preamble

export type AspectBuilderField<Type extends MethodsOnlyInternal> = {
  [ASPECTS_BUILDER]: AspectsBuilder<Type>
};

export type ClassWithAspects<T extends MethodsOnlyInternal> = Class<T> & AspectBuilderField<T>;

export class AspectsDictionary<T extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<VoidMethodsOnly<WrapThisAndParameters<T>>> = [];
  readonly bodyComponents: PushableArray<IndeterminateClass<T>> = [];

}

export class AspectsBuilder<T extends MethodsOnlyInternal> {
  readonly classInvariants: PushableArray<(thisObj: T) => VoidMethodsOnly<WrapThisAndParameters<T>>> = [];
  readonly bodyComponents: PushableArray<(thisObj: T) => IndeterminateClass<T>> = [];

  constructor(baseBuilder: AspectsBuilder<T> | null) {
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

export const AspectsBuilderKeys: ReadonlyArray<string> = [
  "classInvariants",
  "bodyComponents",

];
