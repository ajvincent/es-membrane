/**
 * @remarks
 * This file is generated.  Do not edit.
 * @see {@link "../../build/Aspects-Dictionary-base.mts.in"}
 * @see {@link "../../build/buildAspectsDictionary.mts"}
 */

// #region preamble
import type { Class } from "type-fest";

import {
  DefaultWeakMap
} from "#stage_utilities/source/DefaultMap.mjs"

import type {
  ClassDecoratorFunction
} from "#stage_utilities/source/types/ClassDecoratorFunction.mjs";

import type {
  MethodsOnlyInternal
} from "#stub_classes/source/base/types/MethodsOnlyInternal.mjs";

import type {
  VoidMethodsOnly,
} from "#stub_classes/source/base/types/export-types.mjs";

import type {
  IndeterminateClass
} from "../../source/stubs/decorators/IndeterminateReturn.mjs";

type PushableArray<T> = ReadonlyArray<T> & Pick<T[], "push">;
type UnshiftableArray<T> = ReadonlyArray<T> & Pick<T[], "push" | "unshift">;

// #endregion preamble

// #region AspectsBuilder

class AspectsBuilder<Type extends MethodsOnlyInternal> {
  readonly classInvariants: UnshiftableArray<(new (thisObj: Type) => VoidMethodsOnly<Type>)> = [];
  readonly bodyComponents: UnshiftableArray<(new (thisObj: Type) => IndeterminateClass<Type>)> = [];


  constructor(baseBuilder: AspectsBuilder<Type> | null) {
    if (baseBuilder) {
      this.classInvariants.push(...baseBuilder.classInvariants);
      this.bodyComponents.push(...baseBuilder.bodyComponents);

    }
  }
}

const PrototypeToAspectBuilderMap = new DefaultWeakMap<
  MethodsOnlyInternal, // prototype of the class
  AspectsBuilder<MethodsOnlyInternal>
>;

export function getAspectBuilderForClass<Type extends MethodsOnlyInternal>(
  _class: Class<Type>
): AspectsBuilder<Type>
{
  return PrototypeToAspectBuilderMap.getDefault(
    _class.prototype as Type,
    (): AspectsBuilder<MethodsOnlyInternal> => {
      const proto = Reflect.getPrototypeOf(_class.prototype as Type) as Type;

      const baseBuilder: AspectsBuilder<MethodsOnlyInternal> | null =
        PrototypeToAspectBuilderMap.get(proto) ?? null;

      return new AspectsBuilder<MethodsOnlyInternal>(baseBuilder);
    }
  ) as AspectsBuilder<Type>;
}

// #endregion AspectsBuilder

// #region AspectsDictionary

export class AspectsDictionary<Type extends MethodsOnlyInternal>
{
  readonly classInvariants: PushableArray<VoidMethodsOnly<Type>> = [];
  readonly bodyComponents: PushableArray<IndeterminateClass<Type>> = [];

}

const InstanceToAspectDictionaryMap = new WeakMap<
  MethodsOnlyInternal,
  AspectsDictionary<MethodsOnlyInternal>
>;

export function buildAspectDictionaryForDriver<
  Type extends MethodsOnlyInternal
>
(
  __driver__: Type,
  __wrapped__: Type,
): AspectsDictionary<Type>
{
  const __proto__ = Reflect.getPrototypeOf(__driver__) as Type & { constructor: Class<Type>}
  const __builder__: AspectsBuilder<Type> = getAspectBuilderForClass<Type>(
    __proto__.constructor
  );

  const __dictionary__ = new AspectsDictionary<Type>;

  __builder__.classInvariants.forEach(__subBuilder__ => {
    __dictionary__.classInvariants.push(new __subBuilder__(__wrapped__));
  });
  __builder__.bodyComponents.forEach(__subBuilder__ => {
    __dictionary__.bodyComponents.push(new __subBuilder__(__wrapped__));
  });


  InstanceToAspectDictionaryMap.set(__driver__, __dictionary__);
  return __dictionary__;
}

export function getAspectDictionaryForDriver<
  Type extends MethodsOnlyInternal
>
(
  __driver__: Type,
): AspectsDictionary<Type>
{
  const __dictionary__ = InstanceToAspectDictionaryMap.get(__driver__);
  if (!__dictionary__) {
    throw new Error("Unknown driver for aspect dictionary!");
  }
  return __dictionary__;
}

// #endregion AspectsDictionary

// #region Aspect decorators

interface AspectDecoratorsInterface<Type extends MethodsOnlyInternal> {
  classInvariants: ClassDecoratorFunction<
    Class<Type>, false, [callback: new (thisObj: Type) => VoidMethodsOnly<Type>]
  >;
  bodyComponents: ClassDecoratorFunction<
    Class<Type>, false, [callback: new (thisObj: Type) => IndeterminateClass<Type>]
  >;

}

class AspectDecoratorsClass<Type extends MethodsOnlyInternal>
implements AspectDecoratorsInterface<Type>
{
  classInvariants(
    this: void,
    callback: Class<VoidMethodsOnly<Type>, [Type]>
  ): ClassDecoratorFunction<Class<Type>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      const builder = getAspectBuilderForClass<Type>(baseClass);
      builder.classInvariants.unshift(callback);
    }
  }
  bodyComponents(
    this: void,
    callback: Class<IndeterminateClass<Type>, [Type]>
  ): ClassDecoratorFunction<Class<Type>, false, false>
  {
    return function(baseClass, context): void {
      void(context);
      const builder = getAspectBuilderForClass<Type>(baseClass);
      builder.bodyComponents.unshift(callback);
    }
  }

}

const AspectDecorators = new AspectDecoratorsClass<MethodsOnlyInternal>;

export function getAspectDecorators<
  Type extends MethodsOnlyInternal
>(): AspectDecoratorsClass<Type>
{
  return AspectDecorators as AspectDecoratorsClass<Type>;
}

// #endregion Aspect decorators

export const AspectsBuilderKeys: ReadonlyArray<string> = [
  "classInvariants",
  "bodyComponents",

];
