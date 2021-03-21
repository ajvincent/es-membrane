/** @module source/core/WeakMultiMap */

import {
  defineNWNCProperties
} from "./shared.mjs";

/**
 * @package
 */
export default class WeakMultiMap extends WeakMap {
  constructor(__setConstructor__ = Set) {
    super();

    if ((__setConstructor__ === Set) ||
        (__setConstructor__ === WeakSet) ||
        (__setConstructor__.prototype === Set) ||
        (__setConstructor__.prototype === WeakSet) ||
        (__setConstructor__.prototype instanceof Set) ||
        (__setConstructor__.prototype instanceof WeakSet)) {
      defineNWNCProperties(this, {
        /** @private */
        __setConstructor__,
      }, false);
    }
    else
      throw new Error("WeakMultiMap requires a WeakSet or Set for the set constructor!");
  }

  set(key, value) {
    const hasKey = this.has(key);
    if (!this.has(key)) {
      super.set(key, new this.__setConstructor__);
    }
    const subSet = this.get(key);
    subSet.add(value);
    if (!subSet.has(value)) {
      if (!hasKey)
        super.delete(key);
      return false;
    }
    return this;
  }

  /* I could add more methods for manipulating values in the set, but I choose not to
  until there is a clear need for them.  Otherwise, it's more unit-testing, more
  complexity.
  */
}
