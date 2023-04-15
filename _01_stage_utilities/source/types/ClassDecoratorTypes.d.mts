/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Class } from "type-fest"

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
  BaseClass extends Class<unknown>,
  Returns extends BaseClass
> = (
  baseClass: BaseClass,
  context: ClassDecoratorContext,
) => Returns;
