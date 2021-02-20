/** @module source/core/WeakMapOfProxyMappings */

import {
  NWNCDataDescriptor,
  DeadProxyKey,
} from "./sharedUtilities.mjs";

/**
 * Redefine methods on a weak map.
 * @param {WeakMap} map The weak map.
 * @package
 */
export default function WeakMapOfProxyMappings(map) {
  Reflect.defineProperty(
    map, "delete", new NWNCDataDescriptor(WeakMapOfProxyMappings.delete)
  );
  Reflect.defineProperty(
    map,
    "set",
    new NWNCDataDescriptor(WeakMapOfProxyMappings.set.bind(map, map.set))
  );
  Reflect.defineProperty(
    map,
    "revoke",
    new NWNCDataDescriptor(WeakMapOfProxyMappings.revoke)
  );
}
WeakMapOfProxyMappings.delete = function() {
  throw new Error("delete not allowed on WeakMapOfProxyMappings");
};

WeakMapOfProxyMappings.set = function(_set, key, value) {
  if (value !== DeadProxyKey) {
    const current = this.get(key);
    if (current === DeadProxyKey)
      throw new Error("WeakMapOfProxyMappings says this key is dead");

    // XXX ajvincent there shouldn't be a typeof check here, we must import ProxyMapping
    // eslint-disable-next-line no-undef
    else if ((typeof ProxyMapping === "function") && !(value instanceof ProxyMapping))
      throw new Error("WeakMapOfProxyMappings only allows values of .Dead or ProxyMapping");
    if ((current !== undefined) && (current !== value))
      throw new Error("WeakMapOfProxyMappings already has a value for this key");
  }
  return _set.apply(this, [key, value]);
};

WeakMapOfProxyMappings.revoke = function(key) {
  this.set(key, DeadProxyKey);
};

Object.freeze(WeakMapOfProxyMappings);
