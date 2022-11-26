import { ShadowProxyHandler } from "../source/ShadowProxyHandler.mjs";
import SpyBase from "./SpyBase.mjs";

export default class SpyShadowProxyHandler<T extends object> extends SpyBase implements ShadowProxyHandler<T>
{
  constructor()
  {
    super();
    Reflect.ownKeys(Reflect).forEach(key => this.getSpy(key));
  }

  expectSpiesClearExcept(...names: (string | symbol)[]) : void
  {
    super.expectSpiesClearExcept(...names);
    expect(this.spyMap.size).toBe(Reflect.ownKeys(Reflect).length);
  }

  apply(
    shadowTarget: T,
    thisArg: unknown,
    argArray: unknown[],

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>,

    nextThisArg: unknown,
    nextArgArray: unknown[]
  ): unknown
  {
    return this.getSpy("apply")(shadowTarget, thisArg, argArray, nextTarget, nextHandler, nextThisArg, nextArgArray);
  }

  construct(
    shadowTarget: T,
    argArray: unknown[],
    newTarget: Function,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>,

    nextArgArray: unknown[],
    nextNewTarget: Function
  ): object
  {
    return this.getSpy("construct")(shadowTarget, argArray, newTarget, nextTarget, nextHandler, nextArgArray, nextNewTarget);
  }

  defineProperty(
    shadowTarget: T,
    p: string | symbol,
    attributes: PropertyDescriptor,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>,

    nextAttributes: PropertyDescriptor
  ): boolean
  {
    return this.getSpy("defineProperty")(shadowTarget, p, attributes, nextTarget, nextHandler, nextAttributes);
  }

  deleteProperty(
    shadowTarget: T,
    p: string | symbol,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): boolean
  {
    return this.getSpy("deleteProperty")(shadowTarget, p, nextTarget, nextHandler);
  }

  get(
    shadowTarget: T,
    p: string | symbol,
    receiver: unknown,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>,

    nextReceiver: unknown
  ): unknown
  {
    return this.getSpy("get")(shadowTarget, p, receiver, nextTarget, nextHandler, nextReceiver);
  }

  getOwnPropertyDescriptor(
    shadowTarget: T,
    p: string | symbol,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor")(shadowTarget, p, nextTarget, nextHandler);
  }

  getPrototypeOf(
    shadowTarget: T,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): object | null
  {
    return this.getSpy("getPrototypeOf")(shadowTarget, nextTarget, nextHandler);
  }

  has(
    shadowTarget: T,
    p: string | symbol,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): boolean
  {
    return this.getSpy("has")(shadowTarget, p, nextTarget, nextHandler);
  }

  isExtensible(
    shadowTarget: T,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): boolean
  {
    return this.getSpy("isExtensible")(shadowTarget, nextTarget, nextHandler);
  }

  ownKeys(
    shadowTarget: T,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): ArrayLike<string | symbol>
  {
    return this.getSpy("ownKeys")(shadowTarget, nextTarget, nextHandler);
  }

  preventExtensions(
    shadowTarget: T,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>
  ): boolean
  {
    return this.getSpy("preventExtensions")(shadowTarget, nextTarget, nextHandler);
  }

  set(
    shadowTarget: T,
    p: string | symbol,
    value: unknown,
    receiver: unknown,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>,

    nextValue: unknown,
    nextReceiver: unknown
  ): boolean
  {
    return this.getSpy("set")(shadowTarget, p, value, receiver, nextTarget, nextHandler, nextValue, nextReceiver);
  }

  setPrototypeOf(
    shadowTarget: T,
    proto: object | null,

    nextTarget: T,
    nextHandler: Required<ProxyHandler<T>>,

    nextProto: object | null
  ): boolean
  {
    return this.getSpy("setPrototypeOf")(shadowTarget, proto, nextTarget, nextHandler, nextProto);
  }
}
