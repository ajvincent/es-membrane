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
    expect(this.spyMap.size).toBe(Reflect.ownKeys(Reflect).length);
  }

  apply(target: object, thisArg: unknown, argArray: unknown[]) : unknown
  {
    return this.getSpy("apply").apply(this, Array.from(arguments));
  }

  construct(target: object, argArray: unknown[], newTarget: Function): object
  {
    return this.getSpy("construct").apply(this, Array.from(arguments)) as object;
  }

  defineProperty(target: object, p: string | symbol, attributes: PropertyDescriptor): boolean
  {
    return this.getSpy("defineProperty").apply(this, Array.from(arguments)) as boolean;
  }

  deleteProperty(target: object, p: string | symbol) : boolean
  {
    return this.getSpy("deleteProperty").apply(this, Array.from(arguments)) as boolean;
  }

  get(target: object, p: string | symbol, receiver: unknown) : unknown
  {
    return this.getSpy("get").apply(this, Array.from(arguments));
  }

  getOwnPropertyDescriptor(target: object, p: string | symbol) : PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor").apply(this, Array.from(arguments)) as PropertyDescriptor | undefined;
  }

  getPrototypeOf(target: object) : object | null
  {
    return this.getSpy("getPrototypeOf").apply(this, Array.from(arguments)) as object | null;
  }

  has(target: object, p: string | symbol) : boolean
  {
    return this.getSpy("has").apply(this, Array.from(arguments)) as boolean;
  }

  isExtensible(target: object): boolean
  {
    return this.getSpy("isExtensible").apply(this, Array.from(arguments)) as boolean;
  }

  ownKeys(target: object): (string | symbol)[]
  {
    return this.getSpy("ownKeys").apply(this, Array.from(arguments)) as (string | symbol)[];
  }

  preventExtensions(target: object) : boolean
  {
    return this.getSpy("preventExtensions").apply(this, Array.from(arguments)) as boolean;
  }

  set(target: object, p: string | symbol, value: unknown, receiver: unknown) : boolean
  {
    return this.getSpy("set").apply(this, Array.from(arguments)) as boolean;
  }

  setPrototypeOf(target: object, proto: object | null) : boolean
  {
    return this.getSpy("setPrototypeOf").apply(this, Array.from(arguments)) as boolean;
  }
}
