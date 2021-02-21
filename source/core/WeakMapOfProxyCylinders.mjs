/** @module source/core/WeakMapOfProxyCylinders */

import {
  NWNCDataDescriptor,
  DeadProxyKey,
} from "./sharedUtilities.mjs";

/**
 * Redefine methods on a weak map.
 * @param {WeakMap} map The weak map.
 * @package
 */
export default function WeakMapOfProxyCylinders(map) {
  Reflect.defineProperty(
    map, "delete", new NWNCDataDescriptor(WeakMapOfProxyCylinders.delete)
  );
  Reflect.defineProperty(
    map,
    "set",
    new NWNCDataDescriptor(WeakMapOfProxyCylinders.set.bind(map, map.set))
  );
  Reflect.defineProperty(
    map,
    "revoke",
    new NWNCDataDescriptor(WeakMapOfProxyCylinders.revoke)
  );
}
WeakMapOfProxyCylinders.delete = function() {
  throw new Error("delete not allowed on WeakMapOfProxyCylinders");
};

WeakMapOfProxyCylinders.set = function(_set, key, value) {
  if (value !== DeadProxyKey) {
    const current = this.get(key);
    if (current === DeadProxyKey)
      throw new Error("WeakMapOfProxyCylinders says this key is dead");

    // XXX ajvincent there shouldn't be a typeof check here, we must import ProxyMapping
    // eslint-disable-next-line no-undef
    else if ((typeof ProxyMapping === "function") && !(value instanceof ProxyMapping))
      throw new Error("WeakMapOfProxyCylinders only allows values of .Dead or ProxyMapping");
    if ((current !== undefined) && (current !== value))
      throw new Error("WeakMapOfProxyCylinders already has a value for this key");
  }
  return _set.apply(this, [key, value]);
};

WeakMapOfProxyCylinders.revoke = function(key) {
  this.set(key, DeadProxyKey);
};

Object.freeze(WeakMapOfProxyCylinders);
