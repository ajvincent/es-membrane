/**
 * @remarks
 * This file is generated.  Do not edit.
 * @see {@link "/_03a_aspects_dictionary_build/source/Aspects-Dictionary-base.mts.in"}
 * @see {@link "/_03a_aspects_dictionary_build/source/buildAspectsDictionary.mts"}
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
  IndeterminateClass,
  MethodsOnly,
  VoidMethodsOnly,
} from "#stub_classes/source/types/export-types.mjs";

type PushableArray<T> = ReadonlyArray<T> & Pick<T[], "push">;
type UnshiftableArray<T> = ReadonlyArray<T> & Pick<T[], "push" | "unshift">;

// #endregion preamble

// #region AspectsBuilder

class AspectsBuilder<Type extends MethodsOnly> {
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
  MethodsOnly, // prototype of the class
  AspectsBuilder<MethodsOnly>
>;

/** @internal */
export function hasAspectBuilderForClass<Type extends MethodsOnly>(
  _class: Class<Type>
): boolean {
  return PrototypeToAspectBuilderMap.has(_class.prototype as Type);
}

/** @internal */
export function getAspectBuilderForClass<Type extends MethodsOnly>(
  _class: Class<Type>
): AspectsBuilder<Type>
{
  return PrototypeToAspectBuilderMap.getDefault(
    _class.prototype as Type,
    (): AspectsBuilder<MethodsOnly> => {
      const proto = Reflect.getPrototypeOf(_class.prototype as Type) as Type;

      const baseBuilder: AspectsBuilder<MethodsOnly> | null =
        PrototypeToAspectBuilderMap.get(proto) ?? null;

      return new AspectsBuilder<MethodsOnly>(baseBuilder);
    }
  ) as AspectsBuilder<Type>;
}

// #endregion AspectsBuilder

// #region AspectsDictionary

/** @internal */
export class AspectsDictionary<Type extends MethodsOnly>
{
  readonly classInvariants: PushableArray<VoidMethodsOnly<Type>> = [];
  readonly bodyComponents: PushableArray<IndeterminateClass<Type>> = [];

}

const InstanceToAspectDictionaryMap = new WeakMap<
  MethodsOnly,
  AspectsDictionary<MethodsOnly>
>;

/** @internal */
export function buildAspectDictionaryForDriver<
  Type extends MethodsOnly
>
(
  __driver__: Type,
  __wrapped__: Type,
): AspectsDictionary<Type>
{
  if (InstanceToAspectDictionaryMap.has(__driver__)) {
    throw new Error("Aspect dictionary for driver already exists!");
  }

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

/** @internal */
export function getAspectDictionaryForDriver<
  Type extends MethodsOnly
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

interface AspectDecoratorsInterface<Type extends MethodsOnly> {
  classInvariants: ClassDecoratorFunction<
    Class<Type>, false, [callback: new (thisObj: Type) => VoidMethodsOnly<Type>]
  >;

  bodyComponents: ClassDecoratorFunction<
    Class<Type>, false, [callback: new (thisObj: Type) => IndeterminateClass<Type>]
  >;


}

class AspectDecoratorsClass<Type extends MethodsOnly>
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

const AspectDecorators = new AspectDecoratorsClass<MethodsOnly>;

export function getAspectDecorators<
  Type extends MethodsOnly
>(): AspectDecoratorsClass<Type>
{
  return AspectDecorators as AspectDecoratorsClass<Type>;
}

// #endregion Aspect decorators

export const AspectsBuilderKeys: ReadonlyArray<string> = [
  "classInvariants",
  "bodyComponents",

];
