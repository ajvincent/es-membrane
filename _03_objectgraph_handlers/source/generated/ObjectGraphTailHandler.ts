// This file is generated.  Do not edit.
import type { RequiredProxyHandler } from "../types/RequiredProxyHandler.js";
import type { ObjectGraphHandlerIfc } from "./types/ObjectGraphHandlerIfc.js";

export default class ObjectGraphTailHandler implements ObjectGraphHandlerIfc {
  /**
   * A trap method for a function call.
   * @param target The original callable object which is being proxied.
   */
  public apply(
    target: object,
    thisArg: any,
    argArray: any[],
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextThisArg: any,
    nextArgArray: any[],
  ): any {
    void target;
    void thisArg;
    void argArray;
    return nextHandler.apply(nextTarget, nextThisArg, nextArgArray);
  }

  /**
   * A trap for the `new` operator.
   * @param target The original object which is being proxied.
   * @param newTarget The constructor that was originally called.
   */
  public construct(
    target: object,
    argArray: any[],
    newTarget: Function,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextArgArray: any[],
    nextNewTarget: Function,
  ): object {
    void target;
    void argArray;
    void newTarget;
    return nextHandler.construct(nextTarget, nextArgArray, nextNewTarget);
  }

  /**
   * A trap for `Object.defineProperty()`.
   * @param target The original object which is being proxied.
   * @returns A `Boolean` indicating whether or not the property has been defined.
   */
  public defineProperty(
    target: object,
    property: string | symbol,
    attributes: PropertyDescriptor,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextProperty: string | symbol,
    nextAttributes: PropertyDescriptor,
  ): boolean {
    void target;
    void property;
    void attributes;
    return nextHandler.defineProperty(nextTarget, nextProperty, nextAttributes);
  }

  /**
   * A trap for the `delete` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to delete.
   * @returns A `Boolean` indicating whether or not the property was deleted.
   */
  public deleteProperty(
    target: object,
    p: string | symbol,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextP: string | symbol,
  ): boolean {
    void target;
    void p;
    return nextHandler.deleteProperty(nextTarget, nextP);
  }

  /**
   * A trap for getting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to get.
   * @param receiver The proxy or an object that inherits from the proxy.
   */
  public get(
    target: object,
    p: string | symbol,
    receiver: any,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextP: string | symbol,
    nextReceiver: any,
  ): any {
    void target;
    void p;
    void receiver;
    return nextHandler.get(nextTarget, nextP, nextReceiver);
  }

  /**
   * A trap for `Object.getOwnPropertyDescriptor()`.
   * @param target The original object which is being proxied.
   * @param p The name of the property whose description should be retrieved.
   */
  public getOwnPropertyDescriptor(
    target: object,
    p: string | symbol,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextP: string | symbol,
  ): PropertyDescriptor | undefined {
    void target;
    void p;
    return nextHandler.getOwnPropertyDescriptor(nextTarget, nextP);
  }

  /**
   * A trap for the `[[GetPrototypeOf]]` internal method.
   * @param target The original object which is being proxied.
   */
  public getPrototypeOf(
    target: object,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
  ): object | null {
    void target;
    return nextHandler.getPrototypeOf(nextTarget);
  }

  /**
   * A trap for the `in` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to check for existence.
   */
  public has(
    target: object,
    p: string | symbol,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextP: string | symbol,
  ): boolean {
    void target;
    void p;
    return nextHandler.has(nextTarget, nextP);
  }

  /**
   * A trap for `Object.isExtensible()`.
   * @param target The original object which is being proxied.
   */
  public isExtensible(
    target: object,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
  ): boolean {
    void target;
    return nextHandler.isExtensible(nextTarget);
  }

  /**
   * A trap for `Reflect.ownKeys()`.
   * @param target The original object which is being proxied.
   */
  public ownKeys(
    target: object,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
  ): ArrayLike<string | symbol> {
    void target;
    return nextHandler.ownKeys(nextTarget);
  }

  /**
   * A trap for `Object.preventExtensions()`.
   * @param target The original object which is being proxied.
   */
  public preventExtensions(
    target: object,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
  ): boolean {
    void target;
    return nextHandler.preventExtensions(nextTarget);
  }

  /**
   * A trap for setting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to set.
   * @param receiver The object to which the assignment was originally directed.
   * @returns A `Boolean` indicating whether or not the property was set.
   */
  public set(
    target: object,
    p: string | symbol,
    newValue: any,
    receiver: any,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextP: string | symbol,
    nextNewValue: any,
    nextReceiver: any,
  ): boolean {
    void target;
    void p;
    void newValue;
    void receiver;
    return nextHandler.set(nextTarget, nextP, nextNewValue, nextReceiver);
  }

  /**
   * A trap for `Object.setPrototypeOf()`.
   * @param target The original object which is being proxied.
   * @param newPrototype The object's new prototype or `null`.
   */
  public setPrototypeOf(
    target: object,
    v: object | null,
    nextHandler: RequiredProxyHandler,
    nextTarget: object,
    nextV: object | null,
  ): boolean {
    void target;
    void v;
    return nextHandler.setPrototypeOf(nextTarget, nextV);
  }
}