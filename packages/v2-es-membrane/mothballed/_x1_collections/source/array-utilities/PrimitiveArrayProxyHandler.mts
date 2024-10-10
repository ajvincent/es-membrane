/* eslint-disable @typescript-eslint/no-explicit-any */
import NotImplementedProxyHandler from "./NotImplementedHandler.mjs";
/*
import {
  PublicArrayProxyHandler,
  PublicTypeArrayShadowWrapper,
} from "./PublicArrayProxyHandler.mjs";
*/

const KeyObjectSymbol = Symbol();

class KeyObject {
  readonly [KeyObjectSymbol] = true;
}

export default class PrimitiveArrayProxyHandler<
  BackingType extends object,
  PrimitiveType
>
extends NotImplementedProxyHandler
implements Required<ProxyHandler<PrimitiveType[]>>
{
  //readonly #publicTypeHandler: PublicArrayProxyHandler<BackingType, KeyObject>;

  readonly #keyToPrimitiveMap = new WeakMap<KeyObject | object, PrimitiveType>;
  //readonly #shadowArrayToKeyArrayMap = new WeakMap<PrimitiveType[], KeyObject[]>;

  /*
  #ensureKeyForPrimitiveType(
    value: PrimitiveType
  ): object
  {
    if ((value !== null) && ((typeof value === "object") || (typeof value === "function"))) {
      this.#keyToPrimitiveMap.set(value, value);
      return value;
    }

    const key = new KeyObject;
    this.#keyToPrimitiveMap.set(key, value);
    return key;
  }
  */

  getProxy(
    backingValues: BackingType[],
    values: PrimitiveType[],
  ): PrimitiveType[]
  {
    if (backingValues.length !== values.length)
      throw new Error("The number of backing values must match the number of proxied values!");

    throw new Error("not yet implemented");
  }

  defineProperty(
    target: PrimitiveType[],
    property: string | symbol,
    attributes: PropertyDescriptor
  ): boolean
  {
    if (!("value" in attributes))
      throw new Error("Getters not supported");

    void(target);
    void(property);
    void(attributes);
    throw new Error("Method not implemented.");
  }

  deleteProperty(
    target: PrimitiveType[],
    property: string | symbol
  ): boolean
  {
    void(target);
    void(property)
    throw new Error("Method not implemented.");
  }

  get(
    target: PrimitiveType[],
    property: string | symbol,
    receiver: any
  ): any
  {
    void(target);
    void(property);
    void(receiver);
    throw new Error("Method not implemented.");
  }

  getOwnPropertyDescriptor(
    target: PrimitiveType[],
    property: string | symbol
  ): PropertyDescriptor | undefined
  {
    void(target);
    void(property);
    throw new Error("Method not implemented.");
  }

  getPrototypeOf(
    target: PrimitiveType[]
  ): object | null
  {
    void(target);
    throw new Error("Method not implemented.");
  }

  has(
    target: PrimitiveType[],
    property: string | symbol
  ): boolean
  {
    void(target);
    void(property);
    throw new Error("Method not implemented.");
  }

  isExtensible(
    target: PrimitiveType[]
  ): boolean
  {
    void(target);
    throw new Error("Method not implemented.");
  }

  ownKeys(
    target: PrimitiveType[]
  ): ArrayLike<string | symbol>
  {
    void(target);
    throw new Error("Method not implemented.");
  }

  preventExtensions(
    target: PrimitiveType[]
  ): boolean
  {
    void(target);
    throw new Error("Method not implemented.");
  }
  set(
    target: PrimitiveType[],
    property: string | symbol,
    newValue: any,
    receiver: any
  ): boolean
  {
    void(target);
    void(property);
    void(newValue);
    void(receiver);
    throw new Error("Method not implemented.");
  }
  setPrototypeOf(
    target: PrimitiveType[],
    proto: object | null
  ): boolean
  {
    void(target);
    void(proto);
    throw new Error("Method not implemented.");
  }
}
