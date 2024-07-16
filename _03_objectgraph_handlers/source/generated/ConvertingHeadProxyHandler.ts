// This file is generated.  Do not edit.
import type { MembraneIfc } from "../types/MembraneIfc.js";
import type { RequiredProxyHandler } from "../types/RequiredProxyHandler.js";
import type { ObjectGraphHandlerIfc } from "./types/ObjectGraphHandlerIfc.js";
type CommonConversions = {
  realTarget: object;
  graphKey: string | symbol;
  nextHandler: RequiredProxyHandler;
};

export default abstract class ConvertingHeadProxyHandler
  implements RequiredProxyHandler
{
  #membraneIfc: MembraneIfc;
  #graphHandlerIfc: ObjectGraphHandlerIfc;

  constructor(
    membraneIfc: MembraneIfc,
    graphHandlerIfc: ObjectGraphHandlerIfc,
  ) {
    this.#membraneIfc = membraneIfc;
    this.#graphHandlerIfc = graphHandlerIfc;
  }

  protected abstract getRealTargetForShadowTarget(shadowTarget: object): object;

  protected abstract getTargetGraphKeyForRealTarget(
    realTarget: object,
  ): string | symbol;

  #getCommonConversions(target: object): CommonConversions {
    const realTarget: object = this.getRealTargetForShadowTarget(target);
    const graphKey: string | symbol =
      this.getTargetGraphKeyForRealTarget(realTarget);
    const nextHandler: RequiredProxyHandler =
      this.#membraneIfc.getHandlerForTarget(graphKey, realTarget);
    return { realTarget, graphKey, nextHandler };
  }

  /**
   * A trap method for a function call.
   * @param target The original callable object which is being proxied.
   */
  public apply(shadowTarget: object, thisArg: any, argArray: any[]): any {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextThisArg] = this.#membraneIfc.convertArray<[any]>(graphKey, [
      thisArg,
    ]);
    const nextArgArray: any[] = this.#membraneIfc.convertArray<any[]>(
      graphKey,
      argArray,
    );
    return this.#graphHandlerIfc.apply(
      shadowTarget,
      thisArg,
      argArray,
      nextHandler,
      realTarget,
      nextThisArg,
      nextArgArray,
    );
  }

  /**
   * A trap for the `new` operator.
   * @param target The original object which is being proxied.
   * @param newTarget The constructor that was originally called.
   */
  public construct(
    shadowTarget: object,
    argArray: any[],
    newTarget: Function,
  ): object {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextNewTarget] = this.#membraneIfc.convertArray<[Function]>(
      graphKey,
      [newTarget],
    );
    const nextArgArray: any[] = this.#membraneIfc.convertArray<any[]>(
      graphKey,
      argArray,
    );
    return this.#graphHandlerIfc.construct(
      shadowTarget,
      argArray,
      newTarget,
      nextHandler,
      realTarget,
      nextArgArray,
      nextNewTarget,
    );
  }

  /**
   * A trap for `Object.defineProperty()`.
   * @param target The original object which is being proxied.
   * @returns A `Boolean` indicating whether or not the property has been defined.
   */
  public defineProperty(
    shadowTarget: object,
    property: string | symbol,
    attributes: PropertyDescriptor,
  ): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextProperty] = this.#membraneIfc.convertArray<[string | symbol]>(
      graphKey,
      [property],
    );
    const nextAttributes: PropertyDescriptor =
      this.#membraneIfc.convertDescriptor(graphKey, attributes);
    return this.#graphHandlerIfc.defineProperty(
      shadowTarget,
      property,
      attributes,
      nextHandler,
      realTarget,
      nextProperty,
      nextAttributes,
    );
  }

  /**
   * A trap for the `delete` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to delete.
   * @returns A `Boolean` indicating whether or not the property was deleted.
   */
  public deleteProperty(shadowTarget: object, p: string | symbol): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextP] = this.#membraneIfc.convertArray<[string | symbol]>(
      graphKey,
      [p],
    );
    return this.#graphHandlerIfc.deleteProperty(
      shadowTarget,
      p,
      nextHandler,
      realTarget,
      nextP,
    );
  }

  /**
   * A trap for getting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to get.
   * @param receiver The proxy or an object that inherits from the proxy.
   */
  public get(shadowTarget: object, p: string | symbol, receiver: any): any {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextP, nextReceiver] = this.#membraneIfc.convertArray<
      [string | symbol, any]
    >(graphKey, [p, receiver]);
    return this.#graphHandlerIfc.get(
      shadowTarget,
      p,
      receiver,
      nextHandler,
      realTarget,
      nextP,
      nextReceiver,
    );
  }

  /**
   * A trap for `Object.getOwnPropertyDescriptor()`.
   * @param target The original object which is being proxied.
   * @param p The name of the property whose description should be retrieved.
   */
  public getOwnPropertyDescriptor(
    shadowTarget: object,
    p: string | symbol,
  ): PropertyDescriptor | undefined {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextP] = this.#membraneIfc.convertArray<[string | symbol]>(
      graphKey,
      [p],
    );
    return this.#graphHandlerIfc.getOwnPropertyDescriptor(
      shadowTarget,
      p,
      nextHandler,
      realTarget,
      nextP,
    );
  }

  /**
   * A trap for the `[[GetPrototypeOf]]` internal method.
   * @param target The original object which is being proxied.
   */
  public getPrototypeOf(shadowTarget: object): object | null {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    return this.#graphHandlerIfc.getPrototypeOf(
      shadowTarget,
      nextHandler,
      realTarget,
    );
  }

  /**
   * A trap for the `in` operator.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to check for existence.
   */
  public has(shadowTarget: object, p: string | symbol): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextP] = this.#membraneIfc.convertArray<[string | symbol]>(
      graphKey,
      [p],
    );
    return this.#graphHandlerIfc.has(
      shadowTarget,
      p,
      nextHandler,
      realTarget,
      nextP,
    );
  }

  /**
   * A trap for `Object.isExtensible()`.
   * @param target The original object which is being proxied.
   */
  public isExtensible(shadowTarget: object): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    return this.#graphHandlerIfc.isExtensible(
      shadowTarget,
      nextHandler,
      realTarget,
    );
  }

  /**
   * A trap for `Reflect.ownKeys()`.
   * @param target The original object which is being proxied.
   */
  public ownKeys(shadowTarget: object): ArrayLike<string | symbol> {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    return this.#graphHandlerIfc.ownKeys(shadowTarget, nextHandler, realTarget);
  }

  /**
   * A trap for `Object.preventExtensions()`.
   * @param target The original object which is being proxied.
   */
  public preventExtensions(shadowTarget: object): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    return this.#graphHandlerIfc.preventExtensions(
      shadowTarget,
      nextHandler,
      realTarget,
    );
  }

  /**
   * A trap for setting a property value.
   * @param target The original object which is being proxied.
   * @param p The name or `Symbol` of the property to set.
   * @param receiver The object to which the assignment was originally directed.
   * @returns A `Boolean` indicating whether or not the property was set.
   */
  public set(
    shadowTarget: object,
    p: string | symbol,
    newValue: any,
    receiver: any,
  ): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextP, nextNewValue, nextReceiver] = this.#membraneIfc.convertArray<
      [string | symbol, any, any]
    >(graphKey, [p, newValue, receiver]);
    return this.#graphHandlerIfc.set(
      shadowTarget,
      p,
      newValue,
      receiver,
      nextHandler,
      realTarget,
      nextP,
      nextNewValue,
      nextReceiver,
    );
  }

  /**
   * A trap for `Object.setPrototypeOf()`.
   * @param target The original object which is being proxied.
   * @param newPrototype The object's new prototype or `null`.
   */
  public setPrototypeOf(shadowTarget: object, v: object | null): boolean {
    const { realTarget, graphKey, nextHandler } =
      this.#getCommonConversions(shadowTarget);
    const [nextV] = this.#membraneIfc.convertArray<[object | null]>(graphKey, [
      v,
    ]);
    return this.#graphHandlerIfc.setPrototypeOf(
      shadowTarget,
      v,
      nextHandler,
      realTarget,
      nextV,
    );
  }
}
