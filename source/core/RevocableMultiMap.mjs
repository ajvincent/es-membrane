import WeakMultiMap from "./utilities/WeakMultiMap.mjs";
import FunctionSet from "./utilities/FunctionSet.mjs";
import {
  DeadProxyKey,
} from "./utilities/shared.mjs";

const WeakMap_set      = WeakMap.prototype.set;

export default class RevocableMultiMap extends WeakMultiMap {
  constructor() {
    super(FunctionSet);
  }

  set(key, value) {
    if (this.get(key) === DeadProxyKey)
      return false;

    return Boolean(super.set(key, value));
  }

  delete(key) {
    const set = this.get(key);
    if (set === DeadProxyKey)
      return false;
    return super.delete(key);
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
