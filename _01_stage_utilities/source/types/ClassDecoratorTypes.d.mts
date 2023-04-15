/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Class } from "type-fest"

/**
 * A class decorator which does not modify the class it receives.
 *
 * @typeParam BaseClassType - the user's class type.  Usually `typeof UserClass`.
 * @param baseClass - the user's class.
 * @param context - the decorator context from the JavaScript engine.
 *
 * @see {@link https://github.com/tc39/proposal-decorators#classes}
 */
export type ClassDecoratorVoid<
  BaseClassType extends Class
> = (
  baseClass: BaseClassType,
  context: ClassDecoratorContext,
) => void;

/**
 * A class decorator which does not modify the class it receives.
 *
 * @typeParam BaseClassType - the user's class type.  Usually `typeof UserClass`.
 * @typeParam Arguments - arguments to pass into the decorator.
 * @param baseClass - the user's class.
 * @param context - the decorator context from the JavaScript engine.
 *
 * @see {@link https://github.com/tc39/proposal-decorators#classes}
 */
export type ClassDecoratorVoid<
  BaseClassType extends Class,
  Arguments extends any[]
> = (...args: Arguments) => ObservesVoidClass<BaseClassType>;

/**
 * A class decorator which does returns a class to replace the class it receives.
 *
 * @typeParam BaseClassType - the user's class type.  Usually `typeof UserClass`.
 * @typeParam Returns - the modified class type.
 * @param baseClass - the user's class.
 * @param context - the decorator context from the JavaScript engine.
 *
 * @see {@link https://github.com/tc39/proposal-decorators#classes}
 */
export type ClassDecoratorReplaces<
  BaseClass extends Class,
  Returns extends BaseClass
> = (
  baseClass: BaseClass,
  context: ClassDecoratorContext,
) => Returns;

/**
 * A class decorator which does returns a class to replace the class it receives.
 *
 * @typeParam BaseClassType - the user's class type.  Usually `typeof UserClass`.
 * @typeParam Returns - the modified class type.
 * @typeParam Arguments - arguments to pass into the decorator.
 * @param baseClass - the user's class.
 * @param context - the decorator context from the JavaScript engine.
 *
 * @see {@link https://github.com/tc39/proposal-decorators#classes}
 */
export type ClassDecoratorReplaces<
  BaseClassType extends Class,
  Returns extends BaseClassType,
  Arguments extends any[]
> =
  (...args: Arguments) => ClassDecoratorReplaces<BaseClassType, Returns>;
