/**
 * @module source/core/utilities/CompositeWeakMap.mjs
 *
 * @fileoverview
 * This is really a diagnostic tool, emulating the CompositeKey concept.
 * The goal is to use this to transform weak tuples into easily identifable
 * string hashes and WeakCompositeKey objects.
 *
 * @see https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
 */

import {
  defineNWNCProperties,
} from "./shared.mjs";

/**
 * @package
 */
export class CompositeWeakKey extends WeakSet {
  constructor(keys, hash) {
    super();
    for (let key of keys)
      super.add(key);

    defineNWNCProperties(this, { hash }, true);
    Object.freeze(this);
  }

  /** @override */
  add() {
    return false;
  }

  /** @override */
  delete() {
    return false;
  }
}
Object.freeze(CompositeWeakKey);
Object.freeze(CompositeWeakKey.prototype);

/**
 * @package
 */
export class CompositeWeakMap {
  /**
   * @param {string[]} __keys__ The keys to require.
   */
  constructor(...__keys__) {
    /**
     * @private
     */
    this.__hashCount__ = 0;

    __keys__.sort();

    if ((__keys__.length < 2) || __keys__.some(key => typeof key !== "string")) {
      throw new Error("weakDictionary must have at least two string keys, and no symbol keys!");
    }

    defineNWNCProperties(this, {
      /**
       * @type {WeakMap<object, integer>}
       * @private
       */
      __hashToIndex__: new WeakMap,

      /**
       * @type {WeakMap<object, WeakMap<object, WeakMap | WeakKey>>}
       * @private
       */
      __root__: new WeakMap(),

      __keySet__: new Set(__keys__),
    }, false);

    if (__keys__.length !== this.__keySet__.size)
      throw new Error("duplicate keys found!");

    Reflect.preventExtensions(this);
  }

  /**
   * Build a hash object from a dictionary of keys.
   *
   * @param {Object<key, Object>} weakDictionary A dictionary of values to hold weakly.
   *
   * @returns {Object} Unique for the dictionary passed in.
   * @private
   */
  __buildHash__(weakDictionary) {
    const keys = Reflect.ownKeys(weakDictionary);
    keys.sort();
    if (keys.length !== this.__keySet__.size) {
      throw new Error("Wrong number of keys!");
    }
    keys.forEach(key => {
      if (!this.__keySet__.has(key)) {
        throw new Error("Unknown key: " + key);
      }
    });

    let hash = {};
    for (let key of keys) {
      const value = weakDictionary[key];
      if (!this.__hashToIndex__.has(value))
        this.__hashToIndex__.set(value, ++this.__hashCount__);
      hash[key] = this.__hashToIndex__.get(value);
    }

    return hash;
  }

  /**
   * Build a human-readable hash from a dictionary of keys.
   *
   * @param {Object<key, Object>} weakDictionary A dictionary of values to hold weakly.
   *
   * @returns {string} Unique for the dictionary passed in.
   * @public
   */
  buildHash(weakDictionary) {
    return JSON.stringify(this.__buildHash__(weakDictionary));
  }

  /**
   *
   * @param {Object<key, Object>} weakDictionary A dictionary of values to hold weakly.
   * @param {boolean}             buildIfMissing True if we should build a new step for each key.
   * @returns {CompositeWeakKey?}
   */
  getKey(weakDictionary, buildIfMissing = false) {
    const hash = this.__buildHash__(weakDictionary);

    // Beyond this point, we cannot throw.
    const keys = Reflect.ownKeys(hash);
    const values = [];

    let current = this.__root__, key = keys.shift();
    while (key && current) {
      const value = weakDictionary[key];
      values.push(value);

      if (!current.has(value) && buildIfMissing) {
        current.set(
          value,
          keys.length > 0 ? new WeakMap : new CompositeWeakKey(values, JSON.stringify(hash))
        );
      }

      current = current.get(value);
      key = keys.shift();
    }

    return current;
  }
}
Object.freeze(CompositeWeakMap);
Object.freeze(CompositeWeakMap.prototype);
