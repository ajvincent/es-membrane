const WeakMap_set = WeakMap.prototype.set;

/**
 * @package
 */
export default class WeakMultiMap extends WeakMap {
  set(key, value) {
    if (!this.has(key)) {
      WeakMap_set.apply(this, [key, new Set]);
    }
    this.get(key).add(value);
    return this;
  }

  /* I could add more methods for manipulating values in the set, but I choose not to
  until there is a clear need for them.  Otherwise, it's more unit-testing, more
  complexity.
  */
}
