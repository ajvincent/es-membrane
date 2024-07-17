// This file is generated.  Do not edit.
import type { RequiredProxyHandler } from "../../types/RequiredProxyHandler.js";

export interface ObjectGraphHandlerIfc {
  /**
   * A trap method for a function call.
   * @param target The original callable object which is being proxied.
   */
  apply(
    shadowTarget: object,
    thisArg: any,
    argArray: any[],
    nextTarget: object,
    nextThisArg: any,
    nextArgArray: any[],
  ): any;
  /**
   * A trap for the `new` operator.
   * @param target The original object which is being proxied.
   * @param newTarget The constructor that was originally called.
   */
  construct(
    shadowTarget: object,
    argArray: any[],
    newTarget: Function,
    nextTarget: object,
    nextArgArray: any[],
    nextNewTarget: Function,
  ): object;
  /**
   * A trap for `Object.defineProperty()`.
   * @param target The original object which is being proxied.
   * @returns A `Boolean` indicating whether or not the property has been defined.
   */
  defineProperty(
    shadowTarget: object,
    property: string | symbol,
    attributes: PropertyDescriptor,
    nextTarget: object,
    nextProperty: string | symbol,
    nextAttributes: PropertyDescriptor,
  ): boolean;
  /**
   * A trap for the `delete` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to delete.
   * @returns A `Boolean` indicating whether or not the property was deleted.
   */
  deleteProperty(
    shadowTarget: object,
    p: string | symbol,
    nextTarget: object,
    nextP: string | symbol,
  ): boolean;
  /**
   * A trap for getting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to get.
   * @param receiver The proxy or an object that inherits from the proxy.
   */
  get(
    shadowTarget: object,
    p: string | symbol,
    receiver: any,
    nextTarget: object,
    nextP: string | symbol,
    nextReceiver: any,
  ): any;
  /**
   * A trap for `Object.getOwnPropertyDescriptor()`.
   * @param target The original object which is being proxied.
   * @param p The name of the property whose description should be retrieved.
   */
  getOwnPropertyDescriptor(
    shadowTarget: object,
    p: string | symbol,
    nextTarget: object,
    nextP: string | symbol,
  ): PropertyDescriptor | undefined;
  /**
   * A trap for the `[[GetPrototypeOf]]` internal method.
   * @param target The original object which is being proxied.
   */
  getPrototypeOf(shadowTarget: object, nextTarget: object): object | null;
  /**
   * A trap for the `in` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to check for existence.
   */
  has(
    shadowTarget: object,
    p: string | symbol,
    nextTarget: object,
    nextP: string | symbol,
  ): boolean;
  /**
   * A trap for `Object.isExtensible()`.
   * @param target The original object which is being proxied.
   */
  isExtensible(shadowTarget: object, nextTarget: object): boolean;
  /**
   * A trap for `Reflect.ownKeys()`.
   * @param target The original object which is being proxied.
   */
  ownKeys(shadowTarget: object, nextTarget: object): ArrayLike<string | symbol>;
  /**
   * A trap for `Object.preventExtensions()`.
   * @param target The original object which is being proxied.
   */
  preventExtensions(shadowTarget: object, nextTarget: object): boolean;
  /**
   * A trap for setting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to set.
   * @param receiver The object to which the assignment was originally directed.
   * @returns A `Boolean` indicating whether or not the property was set.
   */
  set(
    shadowTarget: object,
    p: string | symbol,
    newValue: any,
    receiver: any,
    nextTarget: object,
    nextP: string | symbol,
    nextNewValue: any,
    nextReceiver: any,
  ): boolean;
  /**
   * A trap for `Object.setPrototypeOf()`.
   * @param target The original object which is being proxied.
   * @param newPrototype The object's new prototype or `null`.
   */
  setPrototypeOf(
    shadowTarget: object,
    v: object | null,
    nextTarget: object,
    nextV: object | null,
  ): boolean;
}
