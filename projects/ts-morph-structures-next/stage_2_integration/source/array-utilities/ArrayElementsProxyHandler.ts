import type {
  WritableArrayLike
} from "./types/WritableArrayLike.js";

import type {
  InnerTypeElement
} from "./types/InnerTypeElements.js";

import {
  ShadowArrayImpl
} from "./ShadowArrayImpl.js";

/**
 * A proxy handler for array.length, array[index].  The array prototype will be `ArrayPrototypeProxyHandler.proto`.
 * @internal
 */
export class ArrayElementsProxyHandler<OuterType, InnerType extends InnerTypeElement<OuterType>>
implements Omit<
  Required<ProxyHandler<WritableArrayLike<OuterType>>>,
  "apply" | "construct" | "getPrototypeOf" | "isExtensible"
>
{
  static #getIndex(
    p: string | symbol
  ): number | undefined
  {
    if (typeof p === "string") {
      const np = parseFloat(p);
      if (np % 1 === 0 && np >= 0) {
        return np;
      }
    }
  }

  readonly #shadowToArrayImplMap = new WeakMap<
    WritableArrayLike<OuterType>,
    ShadowArrayImpl<OuterType, InnerTypeElement<OuterType>>
  >;

  /**
   * Tie a shadow array to the array implementation.
   * @param shadowTarget
   * @param arrayImpl
   *
   * @internal
   */
  assignShadowToArrayImpl(
    shadowTarget: WritableArrayLike<OuterType>,
    arrayImpl: ShadowArrayImpl<OuterType, InnerType>
  ): void
  {
    this.#shadowToArrayImplMap.set(shadowTarget, arrayImpl);
  }

  // ProxyHandler
  defineProperty(
    shadowTarget: WritableArrayLike<OuterType>,
    property: string | symbol,
    attributes: PropertyDescriptor
  ): boolean
  {
    const arrayImpl = this.#shadowToArrayImplMap.get(shadowTarget)!;
    if (property === "length") {
      arrayImpl.setLength(attributes.get === undefined ? attributes.value! : attributes.get());
      return true;
    }

    const index = ArrayElementsProxyHandler.#getIndex(property);
    if (typeof index === "number") {
      arrayImpl.replaceAt(index, attributes.get === undefined ? attributes.value! : attributes.get());
      return true;
    }

    return false;
  }

  // ProxyHandler
  deleteProperty(
    shadowTarget: WritableArrayLike<OuterType>,
    p: string | symbol
  ): boolean
  {
    void shadowTarget;
    void p;
    return false;
  }

  // ProxyHandler
  getOwnPropertyDescriptor(
    shadowTarget: WritableArrayLike<OuterType>,
    p: string | symbol
  ): PropertyDescriptor | undefined
  {
    const arrayImpl = this.#shadowToArrayImplMap.get(shadowTarget)!;

    if (p === "length") {
      const value = arrayImpl.getLength();
      return { value, writable: true, enumerable: false, configurable: false };
    }

    const np = ArrayElementsProxyHandler.#getIndex(p);
    if (typeof np === "number" && np < arrayImpl.getLength()) {
      const value = arrayImpl.at(np);
      return { value, writable: true, enumerable: true, configurable: true, };
    }

    return Reflect.getOwnPropertyDescriptor(shadowTarget, p);
  }

  // ProxyHandler
  get(
    shadowTarget: WritableArrayLike<OuterType>,
    p: string | symbol,
    receiver: unknown
  ): unknown
  {
    const arrayImpl = this.#shadowToArrayImplMap.get(shadowTarget)!;

    if (p === "length") {
      const value = arrayImpl.getLength();
      /* arrayImpl should've updated shadowTarget.length
      shadowTarget.length = value;
      */
      return value;
    }

    const np = ArrayElementsProxyHandler.#getIndex(p);
    if (typeof np === "number" && np < arrayImpl.getLength()) {
      const value = arrayImpl.at(np);
      /* arrayImpl should've updated shadowTarget[np]
      shadowTarget[np] = value;
      */
      return value;
    }

    return Reflect.get(shadowTarget, p, receiver);
  }

  // ProxyHandler
  has(
    shadowTarget: WritableArrayLike<OuterType>,
    p: string | symbol
  ): boolean
  {
    if (p === "length")
      return true;

    const arrayImpl = this.#shadowToArrayImplMap.get(shadowTarget)!;

    const np = ArrayElementsProxyHandler.#getIndex(p);
    if (typeof np === "number" && np < arrayImpl.getLength())
      return true;

    return Reflect.has(shadowTarget, p);
  }

  // ProxyHandler
  ownKeys(
    shadowTarget: WritableArrayLike<OuterType>
  ): ArrayLike<string | symbol>
  {
    const arrayImpl = this.#shadowToArrayImplMap.get(shadowTarget)!;
    const keys: string[] = ShadowArrayImpl.indexRange(arrayImpl.getLength()).map(String);
    keys.push("length");
    // only length is not configurable, and the array is extensible
    // so we don't need to update the shadow target specifically
    // if someone makes innerElements non-extensible, this will cause problems
    return keys;
  }

  // ProxyHandler
  preventExtensions(
    shadowTarget: WritableArrayLike<OuterType>
  ): boolean
  {
    void shadowTarget;
    return false;
  }

  // ProxyHandler
  set(
    shadowTarget: WritableArrayLike<OuterType>,
    p: string | symbol,
    newValue: unknown,
    receiver: unknown
  ): boolean
  {
    const arrayImpl = this.#shadowToArrayImplMap.get(shadowTarget)!;
    if (p === "length") {
      arrayImpl.setLength(newValue as number);
      return true;
    }

    const np = ArrayElementsProxyHandler.#getIndex(p);
    if (typeof np === "number") {
      arrayImpl.replaceAt(np, newValue as OuterType);
      return true;
    }

    void receiver;
    return false;
  }

  // ProxyHandler
  setPrototypeOf(
    shadowTarget: WritableArrayLike<OuterType>,
    v: object | null
  ): boolean
  {
    void shadowTarget;
    void v;
    return false;
  }
}
