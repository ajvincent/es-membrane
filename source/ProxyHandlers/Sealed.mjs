/**
 * @module source/ProxyHandlers/Sealed.mjs
 *
 * @fileoverview
 *
 */

import {
  LinkedListHandler,
} from "./LinkedList.mjs";

import {
  allTraps,
  defineNWNCProperties,
  getRealTarget,
} from "../core/utilities/shared.mjs";

/**
 * @type {WeakSet<ShadowTarget>}
 */
const KnownSealed = new WeakSet();

/**
 * @package
 */
export class SealedHandler extends LinkedListHandler {
  constructor(objectGraph) {
    super(objectGraph);
    if (new.target !== SealedHandler)
      throw new Error("Subclassing SealedHandler is forbidden!");
    Object.freeze(this);
  }
}

{
  const traps = allTraps.map(trapName => function(shadowTarget, ...args) {
    if (KnownSealed.has(shadowTarget))
      return Reflect[trapName](shadowTarget, ...args);

    let rv = this.invokeNextHandler(trapName, shadowTarget, ...args);
    const realTarget = getRealTarget(shadowTarget);
    if (!Object.isSealed(realTarget))
      return rv;

    const keys = this.invokeNextHandler("ownKeys", shadowTarget);
    keys.forEach(key => {
      const desc = this.invokeNextHandler("getOwnPropertyDescriptor", shadowTarget, key);
      Reflect.defineProperty(shadowTarget, key, desc);
    });

    const proto = this.invokeNextHandler("getPrototypeOf", shadowTarget);
    Reflect.setPrototypeOf(shadowTarget, proto);

    KnownSealed.add(shadowTarget);
    return this.invokeNextHandler(trapName, shadowTarget, ...args);
  });

  defineNWNCProperties(SealedHandler.prototype, traps, true);
}

Object.freeze(SealedHandler);
Object.freeze(SealedHandler.prototype);
