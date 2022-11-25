// #region PassThroughType type

import type {
  AnyFunction,
  PropertyKey,
} from "./Common.mjs";

export const PassThroughSymbol = Symbol("Indeterminate return");

/**
 * @typeParam PublicClassType - The class type each component guarantees to implement
 * @typeParam MethodType      - A public member method of PublicClassType
 * @typeParam ThisClassType   - A type with helper methods for components to call on the entryPoint.
 *                              Think of this as holding "pseudo-private" methods, which should be private in
 *                              the final integrated class.
 * @see KeyToComponentMap_Base.mts for implementation of PassThroughType, in PassThroughArgument.
 */
export type PassThroughType<
  PublicClassType extends object,
  MethodType extends AnyFunction,
  ThisClassType extends PublicClassType
> =
{
  // This marks the type as unique.
  [PassThroughSymbol]: boolean;

  /*
  It's very tempting to try saying:
  type PassThroughType<
    ClassType extends AnyFunction, Key extends OnlyFunctionKeys<ClassType>
  > = {
    modifiedArguments: Parameters<ClassType[Key]>
    // ...
  };

  This *cannot work*, because Key is not restricted to one property.  It's
  technically a union of properties at the type definition level.  It can have
  any positive number of elements for Key.

  That's why I keep getting "Type 'Key' cannot be used to index type 'ClassType'. ts(2536)" errors.
  */

  // We can replace the arguments from one step to the next, using modifiedArguments.
  modifiedArguments: Parameters<MethodType>;

  /**
   * This allows us to call another method with the modifiedArguments.
   *
   * Think twice about using this in a Production environment.  Support for this will just
   * complicate the final target code.
   */
  callTarget(key: PropertyKey) : void;

  /**
   * Get the return value, if it's available.
   */
  getReturnValue() : [false, undefined] | [true, ReturnType<MethodType>];

  /**
   * Set the return value.  Write this as `return setReturnValue(...);`.
   *
   * @param value - The value to return.  Only callable once.
   *
   * @privateRemarks
   *
   * It is very tempting to extract this method into a new type specific to
   * body components.  After all, only body components can return a value, per
   * the schema.
   *
   * Don't do it.  At build time, the ProjectDriver doesn't scan any of the
   * referenced components against the JSON schema's definition of a component.
   * Doing so would prematurely complicate the implementation, when another
   * stage of pass-through support, the integration, is better suited to that
   * detection.  Run-time integration tests will have to suffice for now.
   */
  setReturnValue(value: ReturnType<MethodType>) : void;

  readonly entryPoint: ThisClassType;
};

// #endregion PassThroughType type

/**
 * This converts the method to another call signature, prepends the pass-through argument,
 * and alters the return type to possibly return another pass-through.
 *
 * @typeParam PublicClassType - The class type each component guarantees to implement
 * @typeParam MethodType      - A public member method of PublicClassType
 * @typeParam ThisClassType   - A type with helper methods for components to call on the entryPoint.
 *                              Think of this as holding "pseudo-private" methods, which should be private in
 *                              the final integrated class.
 */
export type MaybePassThrough<
  PublicClassType extends object,
  MethodType extends AnyFunction,
  ThisClassType extends PublicClassType
> = (
  __passThrough__: PassThroughType<PublicClassType, MethodType, ThisClassType>,
  ...args: Parameters<MethodType>
) => void;

/**
 * This converts all methods of a class to the MaybePassThrough type.
 * Properties we simply copy the type.
 *
 * @typeParam PublicClassType - The class type each component guarantees to implement
 * @typeParam MethodType      - A public member method of PublicClassType
 * @typeParam ThisClassType   - A type with helper methods for components to call on the entryPoint.
 *                              Think of this as holding "pseudo-private" methods, which should be private in
 *                              the final integrated class.
 */
export type ComponentPassThroughClass<
  PublicClassType extends object,
  ThisClassType extends PublicClassType
> = {
  [Property in keyof PublicClassType]: PublicClassType[Property] extends AnyFunction ?
    MaybePassThrough<PublicClassType, PublicClassType[Property], ThisClassType> :
    PublicClassType[Property];
};
