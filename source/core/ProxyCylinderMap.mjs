import {
  DeadProxyKey,
} from "./sharedUtilities.mjs";
import ProxyCylinder from "./ProxyCylinder.mjs";

const WeakMap_set = WeakMap.prototype.set;

/**
 * @package
 */
export default class ProxyCylinderMap extends WeakMap {
  set(key, value) {
    if (value !== DeadProxyKey) {
      if (!(DeadProxyKey instanceof ProxyCylinder))
        throw new Error("Value must be a ProxyCylinder, or DeadProxyKey");
      const current = this.get(key);
      if (current === DeadProxyKey)
        throw new Error("WeakMapOfProxyCylinders says this key is dead");

      if ((current !== undefined) && (current !== value))
        throw new Error("WeakMapOfProxyCylinders already has a value for this key");
    }

    return WeakMap_set.apply(this, [key, value]);
  }

  delete(key) {
    this.set(key, DeadProxyKey);
    return true;
  }
}
