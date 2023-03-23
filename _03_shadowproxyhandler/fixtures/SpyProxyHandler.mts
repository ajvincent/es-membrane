import SpyBase from "./SpyBase.mjs";
export default class SpyProxyHandler<T extends object>
extends SpyBase implements Required<ProxyHandler<T>>
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

  apply(target: T, thisArg: unknown, argArray: unknown[]) : unknown
  {
    return this.getSpy("apply")(target, thisArg, argArray);
  }

  construct(target: T, argArray: unknown[], newTarget: Function): object
  {
    return this.getSpy("construct")(target, argArray, newTarget) as object;
  }

  defineProperty(target: T, p: string | symbol, attributes: PropertyDescriptor): boolean
  {
    return this.getSpy("defineProperty")(target, p, attributes) as boolean;
  }

  deleteProperty(target: T, p: string | symbol) : boolean
  {
    return this.getSpy("deleteProperty")(target, p) as boolean;
  }

  get(target: T, p: string | symbol, receiver: unknown) : unknown
  {
    return this.getSpy("get")(target, p, receiver);
  }

  getOwnPropertyDescriptor(target: T, p: string | symbol) : PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor")(target, p) as PropertyDescriptor | undefined;
  }

  getPrototypeOf(target: T) : object | null
  {
    return this.getSpy("getPrototypeOf")(target) as object | null;
  }

  has(target: T, p: string | symbol) : boolean
  {
    return this.getSpy("has")(target, p) as boolean;
  }

  isExtensible(target: T): boolean
  {
    return this.getSpy("isExtensible")(target) as boolean;
  }

  ownKeys(target: T): ArrayLike<string | symbol>
  {
    return this.getSpy("ownKeys")(target) as ArrayLike<string | symbol>;
  }

  preventExtensions(target: T) : boolean
  {
    return this.getSpy("preventExtensions")(target) as boolean;
  }

  set(target: T, p: string | symbol, value: unknown, receiver: unknown) : boolean
  {
    return this.getSpy("set")(target, p, value, receiver) as boolean;
  }

  setPrototypeOf(target: T, proto: object | null) : boolean
  {
    return this.getSpy("setPrototypeOf")(target, proto) as boolean;
  }
}
