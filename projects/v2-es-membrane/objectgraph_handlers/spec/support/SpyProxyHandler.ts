import SpyBase from "#stage_utilities/source/SpyBase.js";

import type {
  RequiredProxyHandler,
} from "#objectgraph_handlers/source/types/RequiredProxyHandler.js";

export default class SpyProxyHandler
extends SpyBase implements RequiredProxyHandler
{
  constructor()
  {
    super();
    Reflect.ownKeys(Reflect).forEach(key => this.getSpy(key));
  }

  expectSpiesClearExcept(...names: (string | symbol)[]) : void
  {
    super.expectSpiesClearExcept(...names);
    expect(this.spyCount).toBe(Reflect.ownKeys(Reflect).length);
  }

  apply(target: object, thisArg: unknown, argArray: unknown[]) : unknown
  {
    return this.getSpy("apply").apply(this, [target, thisArg, argArray]);
  }

  construct(target: object, argArray: unknown[], newTarget: NewableFunction): object
  {
    return this.getSpy("construct").apply(this, [target, argArray, newTarget]) as object;
  }

  defineProperty(target: object, p: string | symbol, attributes: PropertyDescriptor): boolean
  {
    return this.getSpy("defineProperty").apply(this, [target, p, attributes]) as boolean;
  }

  deleteProperty(target: object, p: string | symbol) : boolean
  {
    return this.getSpy("deleteProperty").apply(this, [target, p]) as boolean;
  }

  get(target: object, p: string | symbol, receiver: unknown) : unknown
  {
    return this.getSpy("get").apply(this, [target, p, receiver]);
  }

  getOwnPropertyDescriptor(target: object, p: string | symbol) : PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor").apply(this, [target, p]) as PropertyDescriptor | undefined;
  }

  getPrototypeOf(target: object) : object | null
  {
    return this.getSpy("getPrototypeOf").apply(this, [target]) as object | null;
  }

  has(target: object, p: string | symbol) : boolean
  {
    return this.getSpy("has").apply(this, [target, p]) as boolean;
  }

  isExtensible(target: object): boolean
  {
    return this.getSpy("isExtensible").apply(this, [target]) as boolean;
  }

  ownKeys(target: object): (string | symbol)[]
  {
    return this.getSpy("ownKeys").apply(this, [target]) as (string | symbol)[];
  }

  preventExtensions(target: object) : boolean
  {
    return this.getSpy("preventExtensions").apply(this, [target]) as boolean;
  }

  set(target: object, p: string | symbol, value: unknown, receiver: unknown) : boolean
  {
    return this.getSpy("set").apply(this, [target, p, value, receiver]) as boolean;
  }

  setPrototypeOf(target: object, proto: object | null) : boolean
  {
    return this.getSpy("setPrototypeOf").apply(this, [target, proto]) as boolean;
  }
}
