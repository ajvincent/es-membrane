import type { propertyKey } from "../../_02_membrane_utilities/source/publicUtilities.mjs";

/*
void(Reflect as Required<ProxyHandler<object>>);
*/

export type RequiredHandler = Required<ProxyHandler<object>>;

/** @see {@link https://github.com/microsoft/TypeScript/blob/main/src/lib/es2015.proxy.d.ts} */
export interface ShadowProxyHandler
{
  /**
   * A trap method for a function call.
   * @param shadowTarget - the shadow target for our proxy.
   * @param thisArg - the `this` argument for the target, in the source graph.
   * @param argArray - the arguments to pass in, in the source graph.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextThisArg - the `this` argument, wrapped for the target graph.
   * @param nextArgArray - the arguments to pass in, in the target graph.
   * @returns the function call's return value, wrapped for the source graph.
   */
  apply(
    shadowTarget: object, /* XXX ajvincent CallableFunction?  If no, explain why.*/
    thisArg: unknown,
    argArray: unknown[],

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextThisArg: unknown,
    nextArgArray: unknown[],
  ): unknown;

  /**
   * A trap for the `new` operator.
   * @param shadowTarget - the shadow target for our proxy.
   * @param argArray - the arguments to pass in, in the source graph.
   * @param newTarget - The constructor that was originally called, in the source graph.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextArgArray - the arguments to pass in, in the target graph.
   * @param nextNewTarget - The constructor that was originally called, in the target graph.
   * @returns the new value, wrapped for the source graph.
   */
  construct(
    shadowTarget: object,
    argArray: unknown[],
    newTarget: Function,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextArgArray: unknown[],
    nextNewTarget: Function,
  ): object;

  /**
   * A trap for `Object.defineProperty()`.
   * @param shadowTarget - the shadow target for our proxy.
   * @param property - the property name.
   * @param attributes - the property descriptor.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextAttributes - the property descriptor, wrapped for the target graph.
   * @returns A `Boolean` indicating whether or not the property has been defined.
   */
  defineProperty(
    shadowTarget: object,
    property: propertyKey,
    attributes: PropertyDescriptor,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextAttributes: PropertyDescriptor,
  ): boolean;

  /**
   * A trap for the `delete` operator.
   * @param shadowTarget - the shadow target for our proxy.
   * @param property - the property name.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextAttributes - the property descriptor, wrapped for the target graph.
   * @returns A `Boolean` indicating whether or not the property was deleted.
   */
  deleteProperty(
    shadowTarget: object,
    property: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler,
  ): boolean;

  /**
   * A trap for getting a property value.
   * @param shadowTarget - the shadow target for our proxy.
   * @param property - the property name.
   * @param receiver - The proxy or an object that inherits from the proxy.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextReceiver - the receiver, wrapped for the target graph.
   * @returns the property value, wrapped for the source graph.
   */
  get(
    shadowTarget: object,
    p: propertyKey,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextReceiver: unknown
  ): unknown;

  /**
   * A trap for `Object.getOwnPropertyDescriptor()`.
   * @param shadowTarget - the shadow target for our proxy.
   * @param property - the property name.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @returns the property descriptor, wrapped for the source graph.
   */
  getOwnPropertyDescriptor(
    shadowTarget: object,
    property: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): PropertyDescriptor | undefined;

  /**
   * A trap for the `[[GetPrototypeOf]]` internal method.
   * @param shadowTarget - the shadow target for our proxy.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @returns the prototype value, wrapped for the source graph.
   */
  getPrototypeOf(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): object | null;

  /**
   * A trap for the `in` operator.
   * @param shadowTarget - the shadow target for our proxy.
   * @param property - the property name.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @returns true if the proxy has the property.
   */
  has(
    shadowTarget: object,
    property: propertyKey,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  /**
   * A trap for `Object.isExtensible()`.
   * @param shadowTarget - the shadow target for our proxy.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @returns true if the proxy is extensible
   */
  isExtensible(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  /**
   * A trap for `Reflect.ownKeys()`.
   * @param shadowTarget - the shadow target for our proxy.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @returns the list of own keys for the proxy.
   */
  ownKeys(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): ArrayLike<propertyKey>;

  /**
   * A trap for `Object.preventExtensions()`.
   * @param shadowTarget - the shadow target for our proxy.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @returns true if the trap succeeded.
   */
  preventExtensions(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean;

  /**
   * A trap for setting a property value.
   * @param shadowTarget - the shadow target for our proxy.
   * @param property - the property name.
   * @param value - the passed in value, presumed for the source graph.
   * @param receiver - The object to which the assignment was originally directed, in the source graph.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextValue - the passed in value, wrapped for the target graph.
   * @param nextReceiver - the receiver, wrapped for the target graph.
   * @returns A `Boolean` indicating whether or not the property was set.
   */
  set(
    shadowTarget: object,
    property: propertyKey,
    value: unknown,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextValue: unknown,
    nextReceiver: unknown
  ): boolean;

  /**
   * A trap for `Object.setPrototypeOf()`.
   * @param shadowTarget - the shadow target for our proxy.
   * @param proto - The object's new prototype or `null`, presumed for the source graph.
   * @param nextTarget - the proxy target, wrapped for the target graph.
   * @param nextHandler - the target graph's proxy handler.  Usually Reflect or ShadowHeadHandler.
   * @param nextProto - the object's new prototype, wrapped for the target graph, or `null`.
   * @returns true if the prototype was set.
   */
  setPrototypeOf(
    shadowTarget: object,
    proto: object | null,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextProto: object | null
  ): boolean;
}
