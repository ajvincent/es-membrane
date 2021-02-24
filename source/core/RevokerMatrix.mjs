/**
 * @protected
 */
function maybeRevoke(ref) {
  const revoker = ref.deref();
  if (revoker)
    revoker();
}

/**
 * @protected
 */
class RevocableSet {
  constructor() {
    /**
     * @type {Set<WeakRef<Function>>}
     * @private
     * @readonly
     */
    this.items = new Set();
  }

  /**
   * Add a function for later revocation.
   *
   * @param {Function} revoker The function to hold weakly.
   *
   * @public
   */
  add(revoker) {
    //eslint-disable-next-line no-undef
    this.items.add(new WeakRef(revoker));
  }

  /**
   * Revoke all functions we know about.
   *
   * @public
   */
  revokeAll() {
    this.items.forEach(maybeRevoke);
    this.items.clear();
  }
}

/**
 * @package
 */
export default class RevokerMatrix {
  constructor() {
    /**
     * @type {Map<Object, RevocableSet>}
     * @private
     * @readonly
     */
    this.map = new WeakMap();
  }

  /**
   * Add an item for later revocation.
   *
   * @param {Object}   key     The hash key.
   * @param {Function} revoker The revoker function.
   */
  add(key, revoker) {
    if (!this.map.has(key))
      this.map.set(key, new RevocableSet);
    this.map.get(key).add(revoker);
  }

  /**
   *
   * @param {Object} key The hash key.
   */
  revokeAll(key) {
    const set = this.map.get(key);
    if (set) {
      set.revokeAll();
      this.map.delete(key);
    }
  }
}
