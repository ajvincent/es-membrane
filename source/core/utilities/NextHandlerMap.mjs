import {
  allTraps,
  defineNWNCProperties
} from "./shared.mjs";

/**
 * @package
 */
export default class NextHandlerMap {
  constructor() {
    const __map__ = new Map();
    allTraps.forEach(trapName => __map__.set(trapName, new WeakMap));

    defineNWNCProperties(this, {
      /**
       * @type {Map<string, WeakMap<ShadowTarget | NextHandlerMap, ProxyHandler>>}
       * @private
       */
      __map__,
    }, false);

    /**
     * @private
     */
    Reflect.defineProperty(this, "__defaultLocked__", {
      value: false,
      writable: true,
      enumerable: false,
      configurable: false
    });

    Reflect.preventExtensions(this);
  }

  invokeNextHandler(trapName, shadowTarget, ...args) {
    const weakMap = this.__map__.get(trapName);
    const handler = weakMap.get(shadowTarget) || weakMap.get(this);
    return handler[trapName](shadowTarget, ...args);
  }

  setDefault(trapName, handler) {
    if (this.__defaultLocked__)
      throw new Error("The default handler is locked in!");
    const weakMap = this.__map__.get(trapName);
    if (weakMap.has(this))
      throw new Error("A default handler for this trap has been set!");
    weakMap.set(this, handler);
  }

  lockDefault() {
    Reflect.defineProperty(this, "__defaultLocked__", {
      value: true,
      writable: false,
    });
  }

  setHandler(trapName, shadowTarget, handler) {
    if (shadowTarget === this)
      throw new Error("You cannot bypass setDefault with the shadow target!");
    const weakMap = this.__map__.get(trapName);
    if (weakMap.has(shadowTarget))
      throw new Error("A handler for this trap and shadow target has been set!");
    weakMap.set(shadowTarget, handler);
  }
}

Object.freeze(NextHandlerMap);
Object.freeze(NextHandlerMap.prototype);
