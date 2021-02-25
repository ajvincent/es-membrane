import WeakMultiMap from "./WeakMultiMap.mjs";
import {
  DeadProxyKey,
} from "./sharedUtilities.mjs";

const WeakMultiMap_set = WeakMultiMap.prototype.set;
const WeakMap_set      = WeakMap.prototype.set;
const WeakMap_delete   = WeakMap.prototype.delete;

export default class RevocableMultiMap extends WeakMultiMap {
  set(key, value) {
    if (typeof value !== "function")
      return false;

    if (this.get(key) === DeadProxyKey)
      return false;

    WeakMultiMap_set.apply(this, [key, value]);
    return true;
  }

  delete(key) {
    const set = this.get(key);
    if (set === DeadProxyKey)
      return false;
    return WeakMap_delete.apply(this, [key]);
  }

  revoke(key) {
    const set = this.get(key);
    if (!(set instanceof Set))
      return false;

    let firstErrorSet = false, firstError;
    set.forEach(revoker => {
      try {
        revoker();
      }
      catch (ex) {
        if (firstErrorSet) {
          console.error(ex);
          return;
        }

        firstErrorSet = true;
        firstError = ex;
      }
    });

    WeakMap_set.apply(this, [key, DeadProxyKey]);

    if (firstErrorSet)
      throw firstError;
    return true;
  }
}
