/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Class
} from "type-fest";

/**
 * A class decorator which does returns a class to replace the class it receives.
 *
 * @typeParam BaseClassType - the user's class type.  Usually `typeof UserClass`.
 * @typeParam ReturnsModified - the modified class type, true for returning the base class, or false for returning void.
 * @typeParam Arguments - require arguments to execute the decorator.
 * @param baseClass - the user's class.
 * @param context - the decorator context from the JavaScript engine.
 *
 * @see {@link https://github.com/tc39/proposal-decorators#classes}
 */
export type ClassDecoratorFunction<
  BaseClassType extends Class<object>,
  ReturnsModified extends boolean | BaseClassType,
  Arguments extends any[] | false
> = (
  Arguments extends any[] ?
  (...args: Arguments) => ClassDecoratorFunction<BaseClassType, ReturnsModified, false> :
  (
    baseClass: BaseClassType,
    context: ClassDecoratorContext,
  ) => (
    ReturnsModified extends BaseClassType ? ReturnsModified :
    true extends ReturnsModified ? BaseClassType :
    void
  )
);
