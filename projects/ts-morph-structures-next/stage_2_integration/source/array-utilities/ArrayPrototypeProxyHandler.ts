import type {
  InnerTypeElement
} from "./_types/InnerTypeElements.js";

import type {
  WritableArrayLike
} from "./_types/WritableArrayLike.js";

import type {
  ShadowArrayImpl
} from "./ShadowArrayImpl.js";

/**
 * This is a minimalist ProxyHandler for methods of Array.prototype.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions}
 *
 * @internal
 */
export class ArrayPrototypeProxyHandler<OuterType>
implements Pick<ProxyHandler<CallableFunction>, "apply">
{
  static #shadowToMethodName = new WeakMap<
    CallableFunction,
    Exclude<keyof unknown[], number> | "getLength" | "setLength"
  >;
  static readonly #proxyToArrayImpl = new WeakMap<
    WritableArrayLike<unknown>,
    ShadowArrayImpl<unknown, InnerTypeElement<unknown>>
  >;

  /** The prototype to use for shadow targets. */
  public static readonly proto: ReadonlyArray<unknown> = [];

  static {
    const handler = new ArrayPrototypeProxyHandler();

    for (const key of Reflect.ownKeys(Array.prototype)) {
      if (key === "length")
        continue;
      const shadow: CallableFunction = function() {
        // do nothing
      };

      const proxy = new Proxy(shadow, handler);

      const desc: PropertyDescriptor = {
        configurable: false,
        enumerable: true,
        writable: false,
        value: proxy,
      };
      Reflect.defineProperty(this.proto, key, desc);
      this.#shadowToMethodName.set(shadow, key as Exclude<keyof unknown[], number>);
    }

    // length get/set support
    {
      const shadowGetter: () => unknown = function() {
        // do nothing
      };
      const proxyGetter = new Proxy<() => unknown>(shadowGetter, handler);
      this.#shadowToMethodName.set(shadowGetter, "getLength");

      const shadowSetter: (value: unknown) => void = function() {
        // do nothing
      };
      const proxySetter = new Proxy<(value: unknown) => void>(shadowSetter, handler);
      this.#shadowToMethodName.set(shadowSetter, "setLength");

      const desc: PropertyDescriptor = {
        configurable: false,
        enumerable: false,
        get: proxyGetter,
        set: proxySetter,
      };
      Reflect.defineProperty(this.proto, "length", desc);
    }
  }

  /**
   * Tie a proxy to its shadow array implementation.
   * @param proxyThis The proxy.
   * @param arrayImpl The shadow array.
   *
   * @internal
   */
  public static assignProxyToArrayImpl<OuterType>(
    proxyThis: OuterType[],
    arrayImpl: ShadowArrayImpl<OuterType, InnerTypeElement<OuterType>>
  ): void
  {
    this.#proxyToArrayImpl.set(proxyThis, arrayImpl as ShadowArrayImpl<unknown, InnerTypeElement<unknown>>);
  }

  private constructor() {
    // do nothing
  }

  // ProxyHandler
  public apply(
    shadowTarget: CallableFunction,
    thisArg: OuterType[], // a proxy
    argArray: unknown[]
  ): unknown
  {
    const methodName = ArrayPrototypeProxyHandler.#shadowToMethodName.get(shadowTarget)!;
    const arrayImpl = ArrayPrototypeProxyHandler.#proxyToArrayImpl.get(thisArg) as ShadowArrayImpl<OuterType, InnerTypeElement<OuterType>>;
    // @ts-expect-error methodName is not a number, damn it
    return arrayImpl[methodName](...argArray);
  }
}
