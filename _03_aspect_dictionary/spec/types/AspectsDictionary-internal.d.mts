import type {
  Class
} from "type-fest";

import type {
  ClassWithPrototype
} from "#stage_utilities/source/types/Utility.mjs";

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

type AspectsBuilderClassWithPrototype<Type extends MethodsOnly> = ClassWithPrototype<{
  readonly classInvariants: UnshiftableArray<(new (thisObj: Type) => VoidMethodsOnly<Type>)>;
  readonly bodyComponents: UnshiftableArray<(new (thisObj: Type) => IndeterminateClass<Type>)>;
}, [baseBuilder: AspectsBuilder<Type> | null]>;

export type AspectBuilderGetter<Type extends MethodsOnly> = (
  _class: ClassWithPrototype<Type>
) => AspectsBuilderPrototype<Type>;

export type AspectDictionaryBuilder<Type extends MethodsOnly> = (
  __driver__: Type, __wrapped__: Type
) => AspectsDictionary<Type>;

export type AspectDictionaryGetter<Type extends MethodsOnly> = (
  __driver__: Type
) => AspectsDictionary<Type>;

type AspectDecoratorsPrototype<Type extends MethodsOnly> = {
  classInvariants(
    this: void,
    callback: Class<VoidMethodsOnly<Type>, [Type]>
  ): ClassDecoratorFunction<ClassWithPrototype<Type>, false, false>;

  bodyComponents(
    this: void,
    callback: Class<IndeterminateClass<Type>, [Type]>
  ): ClassDecoratorFunction<ClassWithPrototype<Type>, false, false>;
};

export type AspectDecoratorsGetter<
  Type extends MethodsOnly
> = () => AspectDecoratorsClassWithPrototype<Type>;
