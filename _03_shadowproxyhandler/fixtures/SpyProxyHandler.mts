import SpyBase from "./SpyBase.mjs";

import type {
  RequiredHandler,
} from "../source/ShadowProxyHandler.mjs";


export default class SpyProxyHandler
extends SpyBase implements RequiredHandler
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

  apply(target: object, thisArg: unknown, argArray: unknown[]) : unknown
  {
    return this.getSpy("apply")(target, thisArg, argArray);
  }

  construct(target: object, argArray: unknown[], newTarget: Function): object
  {
    return this.getSpy("construct")(target, argArray, newTarget) as object;
  }

  defineProperty(target: object, p: string | symbol, attributes: PropertyDescriptor): boolean
  {
    return this.getSpy("defineProperty")(target, p, attributes) as boolean;
  }

  deleteProperty(target: object, p: string | symbol) : boolean
  {
    return this.getSpy("deleteProperty")(target, p) as boolean;
  }

  get(target: object, p: string | symbol, receiver: unknown) : unknown
  {
    return this.getSpy("get")(target, p, receiver);
  }

  getOwnPropertyDescriptor(target: object, p: string | symbol) : PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor")(target, p) as PropertyDescriptor | undefined;
  }

  getPrototypeOf(target: object) : object | null
  {
    return this.getSpy("getPrototypeOf")(target) as object | null;
  }

  has(target: object, p: string | symbol) : boolean
  {
    return this.getSpy("has")(target, p) as boolean;
  }

  isExtensible(target: object): boolean
  {
    return this.getSpy("isExtensible")(target) as boolean;
  }

  ownKeys(target: object): ArrayLike<string | symbol>
  {
    return this.getSpy("ownKeys")(target) as ArrayLike<string | symbol>;
  }

  preventExtensions(target: object) : boolean
  {
    return this.getSpy("preventExtensions")(target) as boolean;
  }

  set(target: object, p: string | symbol, value: unknown, receiver: unknown) : boolean
  {
    return this.getSpy("set")(target, p, value, receiver) as boolean;
  }

  setPrototypeOf(target: object, proto: object | null) : boolean
  {
    return this.getSpy("setPrototypeOf")(target, proto) as boolean;
  }
}
