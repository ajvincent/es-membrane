/** @module source/core/utilities/RevocableMultiMap.mjs */

import WeakMultiMap from "./WeakMultiMap.mjs";
import FunctionSet from "./FunctionSet.mjs";
import {
  DeadProxyKey,
} from "./shared.mjs";

const WeakMap_set      = WeakMap.prototype.set;

export default class RevocableMultiMap extends WeakMultiMap {
  constructor() {
    super(FunctionSet, "deferred");
  }

  /**
   * Set a revoker function.
   *
   * @param {Object} key
   * @param {Object} value
   *
   * @returns {boolean}
   * @override
   */
  set(key, value) {
    if (this.get(key) === DeadProxyKey)
      return false;

    return Boolean(super.set(key, value));
  }

  /**
   * @override
   */
  delete(key) {
    const set = this.get(key);
    if (set === DeadProxyKey)
      return false;
    return super.delete(key);
  }

  /**
   * Execute all revokers for a given key.
   *
   * @param {Object} key
   *
   * @returns {boolean} True if the operation succeeded.
   * @public
   */
  revoke(key) {
    const set = this.get(key);
    if (!(set instanceof FunctionSet))
      return false;

    WeakMap_set.apply(this, [key, DeadProxyKey]);
    set.observe();
    return true;
  }
}
