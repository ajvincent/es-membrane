import type {
  ShadowProxyHandler,
  RequiredHandler,
} from "../source/ShadowProxyHandler.mjs";

import SpyBase from "#stage_utilities/source/SpyBase.mjs";

export default
class SpyShadowProxyHandler
extends SpyBase
implements ShadowProxyHandler
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
    shadowTarget: object,
    thisArg: unknown,
    argArray: unknown[],

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextThisArg: unknown,
    nextArgArray: unknown[]
  ): unknown
  {
    return this.getSpy("apply")(
      shadowTarget, thisArg, argArray, nextTarget, nextHandler, nextThisArg, nextArgArray
    );
  }

  construct(
    shadowTarget: object,
    argArray: unknown[],
    newTarget: Function,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextArgArray: unknown[],
    nextNewTarget: Function
  ): object
  {
    return this.getSpy("construct")(
      shadowTarget, argArray, newTarget, nextTarget, nextHandler, nextArgArray, nextNewTarget
    ) as object;
  }

  defineProperty(
    shadowTarget: object,
    p: string | symbol,
    attributes: PropertyDescriptor,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextAttributes: PropertyDescriptor
  ): boolean
  {
    return this.getSpy("defineProperty")(
      shadowTarget, p, attributes, nextTarget, nextHandler, nextAttributes
    ) as boolean;
  }

  deleteProperty(
    shadowTarget: object,
    p: string | symbol,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    return this.getSpy("deleteProperty")(
      shadowTarget, p, nextTarget, nextHandler
    ) as boolean;
  }

  get(
    shadowTarget: object,
    p: string | symbol,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextReceiver: unknown
  ): unknown
  {
    return this.getSpy("get")(
      shadowTarget, p, receiver, nextTarget, nextHandler, nextReceiver
    );
  }

  getOwnPropertyDescriptor(
    shadowTarget: object,
    p: string | symbol,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor")(
      shadowTarget, p, nextTarget, nextHandler
    ) as PropertyDescriptor | undefined;
  }

  getPrototypeOf(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): object | null
  {
    return this.getSpy("getPrototypeOf")(
      shadowTarget, nextTarget, nextHandler
    ) as object | null;
  }

  has(
    shadowTarget: object,
    p: string | symbol,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    return this.getSpy("has")(
      shadowTarget, p, nextTarget, nextHandler
    ) as boolean;
  }

  isExtensible(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    return this.getSpy("isExtensible")(
      shadowTarget, nextTarget, nextHandler
    ) as boolean;
  }

  ownKeys(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): ArrayLike<string | symbol>
  {
    return this.getSpy("ownKeys")(
      shadowTarget, nextTarget, nextHandler
    ) as ArrayLike<string | symbol>;
  }

  preventExtensions(
    shadowTarget: object,

    nextTarget: object,
    nextHandler: RequiredHandler
  ): boolean
  {
    return this.getSpy("preventExtensions")(
      shadowTarget, nextTarget, nextHandler
    ) as boolean;
  }

  set(
    shadowTarget: object,
    p: string | symbol,
    value: unknown,
    receiver: unknown,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextValue: unknown,
    nextReceiver: unknown
  ): boolean
  {
    return this.getSpy("set")(
      shadowTarget, p, value, receiver, nextTarget, nextHandler, nextValue, nextReceiver
    ) as boolean;
  }

  setPrototypeOf(
    shadowTarget: object,
    proto: object | null,

    nextTarget: object,
    nextHandler: RequiredHandler,

    nextProto: object | null
  ): boolean
  {
    return this.getSpy("setPrototypeOf")(
      shadowTarget, proto, nextTarget, nextHandler, nextProto
    ) as boolean;
  }
}
