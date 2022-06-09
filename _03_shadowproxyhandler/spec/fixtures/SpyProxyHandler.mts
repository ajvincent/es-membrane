import SpyBase from "./SpyBase.mjs";
export default class SpyProxyHandler<T extends object>
extends SpyBase implements Required<ProxyHandler<T>>
{
  constructor()
  {
    super();
    Reflect.ownKeys(Reflect).forEach(key => this.getSpy(key));
  }

  expectSpiesClearExcept(...names: (string | symbol)[]) {
    super.expectSpiesClearExcept(...names);
    expect(this.spyMap.size).toBe(Reflect.ownKeys(Reflect).length);
  }

  apply(target: T, thisArg: unknown, argArray: unknown[]) : unknown
  {
    return this.getSpy("apply")(target, thisArg, argArray);
  }

  construct(target: T, argArray: any[], newTarget: Function): object
  {
    return this.getSpy("construct")(target, argArray, newTarget);
  }

  defineProperty(target: T, p: string | symbol, attributes: PropertyDescriptor): boolean
  {
    return this.getSpy("defineProperty")(target, p, attributes);
  }

  deleteProperty(target: T, p: string | symbol) : boolean
  {
    return this.getSpy("deleteProperty")(target, p);
  }

  get(target: T, p: string | symbol, receiver: unknown) : unknown
  {
    return this.getSpy("get")(target, p, receiver);
  }

  getOwnPropertyDescriptor(target: T, p: string | symbol) : PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor")(target, p);
  }

  getPrototypeOf(target: T) : object | null
  {
    return this.getSpy("getPrototypeOf")(target);
  }

  has(target: T, p: string | symbol) : boolean
  {
    return this.getSpy("has")(target, p);
  }

  isExtensible(target: T): boolean {
    return this.getSpy("isExtensible")(target);
  }

  ownKeys(target: T): ArrayLike<string | symbol>
  {
    return this.getSpy("ownKeys")(target);
  }

  preventExtensions(target: T) : boolean
  {
    return this.getSpy("preventExtensions")(target);
  }

  set(target: T, p: string | symbol, value: unknown, receiver: unknown) : boolean
  {
    return this.getSpy("set")(target, p, value, receiver);
  }

  setPrototypeOf(target: T, proto: object | null)
  {
    return this.getSpy("setPrototypeOf")(target, proto);
  }
}
