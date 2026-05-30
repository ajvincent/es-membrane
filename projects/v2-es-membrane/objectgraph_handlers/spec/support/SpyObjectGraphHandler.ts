import SpyBase from "#stage_utilities/source/SpyBase.js";

import type {
  ObjectGraphHandlerIfc
} from "#objectgraph_handlers/source/generated/types/ObjectGraphHandlerIfc.d.ts";

export class SpyObjectGraphHandler extends SpyBase implements ObjectGraphHandlerIfc {
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

  public apply(
    shadowTarget: object,
    thisArg: unknown,
    argArray: unknown[],
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextThisArg: unknown,
    nextArgArray: unknown[]
  ): unknown
  {
    return this.getSpy("apply").apply(
      this, [shadowTarget, thisArg, argArray, nextGraphKey, nextTarget, nextThisArg, nextArgArray]
    ) as unknown;
  }

  public construct(
    shadowTarget: object,
    argArray: unknown[],
    newTarget: NewableFunction,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextArgArray: unknown[],
    nextNewTarget: NewableFunction
  ): object
  {
    return this.getSpy("construct").apply(
      this, [shadowTarget, argArray, newTarget, nextGraphKey, nextTarget, nextArgArray, nextNewTarget]
    ) as object;
  }

  public defineProperty(
    shadowTarget: object,
    property: string | symbol,
    attributes: PropertyDescriptor,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextProperty: string | symbol,
    nextAttributes: PropertyDescriptor
  ): boolean
  {
    return this.getSpy("defineProperty").apply(
      this, [shadowTarget, property, attributes, nextGraphKey, nextTarget, nextProperty, nextAttributes]
    ) as boolean;
  }

  public deleteProperty(
    shadowTarget: object,
    p: string | symbol,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextP: string | symbol
  ): boolean
  {
    return this.getSpy("deleteProperty").apply(
      this, [shadowTarget, p, nextGraphKey, nextTarget, nextP]
    ) as boolean;
  }

  public get(
    shadowTarget: object,
    p: string | symbol,
    receiver: unknown,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextP: string | symbol,
    nextReceiver: unknown
  ): unknown
  {
    return this.getSpy("get").apply(
      this, [shadowTarget, p, receiver, nextGraphKey, nextTarget, nextP, nextReceiver]
    ) as unknown;
  }

  public getOwnPropertyDescriptor(
    shadowTarget: object,
    p: string | symbol,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextP: string | symbol
  ): PropertyDescriptor | undefined
  {
    return this.getSpy("getOwnPropertyDescriptor").apply(
      this, [shadowTarget, p, nextGraphKey, nextTarget, nextP]
    ) as PropertyDescriptor | undefined;
  }

  public getPrototypeOf(
    shadowTarget: object,
    nextGraphKey: string | symbol,
    nextTarget: object
  ): object | null
  {
    return this.getSpy("getPrototypeOf").apply(
      this, [shadowTarget, nextGraphKey, nextTarget]
    ) as object | null;
  }

  public has(
    shadowTarget: object,
    p: string | symbol,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextP: string | symbol
  ): boolean
  {
    return this.getSpy("has").apply(
      this, [shadowTarget, p, nextGraphKey, nextTarget, nextP]
    ) as boolean;
  }

  public isExtensible(
    shadowTarget: object,
    nextGraphKey: string | symbol,
    nextTarget: object
  ): boolean
  {
    return this.getSpy("isExtensible").apply(
      this, [shadowTarget, nextGraphKey, nextTarget]
    ) as boolean;
  }

  public ownKeys(
    shadowTarget: object,
    nextGraphKey: string | symbol,
    nextTarget: object
  ): (string | symbol)[]
  {
    return this.getSpy("ownKeys").apply(
      this, [shadowTarget, nextGraphKey, nextTarget]
    ) as (string | symbol)[];
  }

  public preventExtensions(
    shadowTarget: object,
    nextGraphKey: string | symbol,
    nextTarget: object
  ): boolean
  {
    return this.getSpy("preventExtensions").apply(
      this, [shadowTarget, nextGraphKey, nextTarget]
    ) as boolean;
  }

  public set(
    shadowTarget: object,
    p: string | symbol,
    newValue: unknown,
    receiver: unknown,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextP: string | symbol,
    nextNewValue: unknown,
    nextReceiver: unknown
  ): boolean
  {
    return this.getSpy("set").apply(
      this, [shadowTarget, p, newValue, receiver, nextGraphKey, nextTarget, nextP, nextNewValue, nextReceiver]
    ) as boolean;
  }

  public setPrototypeOf(
    shadowTarget: object,
    v: object | null,
    nextGraphKey: string | symbol,
    nextTarget: object,
    nextV: object | null
  ): boolean
  {
    return this.getSpy("setPrototypeOf").apply(
      this, [shadowTarget, v, nextGraphKey, nextTarget, nextV]
    ) as boolean;
  }
}
