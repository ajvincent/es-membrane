/**
 * @remarks
 * This file is generated.  Do not edit.
 * @see {@link "../../build/Aspects-Dictionary-base.mts.in"}
 * @see {@link "../../build/buildAspectsDictionary.mts"}
 */
import type { Class } from "type-fest";
import type { ClassDecoratorFunction } from "#stage_utilities/source/types/ClassDecoratorFunction.mjs";
import type { IndeterminateClass, MethodsOnly, VoidMethodsOnly } from "#stub_classes/source/types/export-types.mjs";
type PushableArray<T> = ReadonlyArray<T> & Pick<T[], "push">;
type UnshiftableArray<T> = ReadonlyArray<T> & Pick<T[], "push" | "unshift">;
declare class AspectsBuilder<Type extends MethodsOnly> {
    readonly classInvariants: UnshiftableArray<(new (thisObj: Type) => VoidMethodsOnly<Type>)>;
    readonly bodyComponents: UnshiftableArray<(new (thisObj: Type) => IndeterminateClass<Type>)>;
    constructor(baseBuilder: AspectsBuilder<Type> | null);
}
/** @internal */
export declare function hasAspectBuilderForClass<Type extends MethodsOnly>(_class: Class<Type>): boolean;
/** @internal */
export declare function getAspectBuilderForClass<Type extends MethodsOnly>(_class: Class<Type>): AspectsBuilder<Type>;
/** @internal */
export declare class AspectsDictionary<Type extends MethodsOnly> {
    readonly classInvariants: PushableArray<VoidMethodsOnly<Type>>;
    readonly bodyComponents: PushableArray<IndeterminateClass<Type>>;
}
/** @internal */
export declare function buildAspectDictionaryForDriver<Type extends MethodsOnly>(__driver__: Type, __wrapped__: Type): AspectsDictionary<Type>;
/** @internal */
export declare function getAspectDictionaryForDriver<Type extends MethodsOnly>(__driver__: Type): AspectsDictionary<Type>;
interface AspectDecoratorsInterface<Type extends MethodsOnly> {
    classInvariants: ClassDecoratorFunction<Class<Type>, false, [callback: new (thisObj: Type) => VoidMethodsOnly<Type>]>;
    bodyComponents: ClassDecoratorFunction<Class<Type>, false, [callback: new (thisObj: Type) => IndeterminateClass<Type>]>;
}
declare class AspectDecoratorsClass<Type extends MethodsOnly> implements AspectDecoratorsInterface<Type> {
    classInvariants(this: void, callback: Class<VoidMethodsOnly<Type>, [Type]>): ClassDecoratorFunction<Class<Type>, false, false>;
    bodyComponents(this: void, callback: Class<IndeterminateClass<Type>, [Type]>): ClassDecoratorFunction<Class<Type>, false, false>;
}
export declare function getAspectDecorators<Type extends MethodsOnly>(): AspectDecoratorsClass<Type>;
export declare const AspectsBuilderKeys: ReadonlyArray<string>;
export {};
