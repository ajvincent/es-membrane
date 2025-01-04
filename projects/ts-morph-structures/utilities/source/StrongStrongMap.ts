/*
  * This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at https://mozilla.org/MPL/2.0/.
  */

import { DefaultMap, DefaultWeakMap } from "./DefaultMap.js";

type WeakRefMap = DefaultWeakMap<object, string>
type StrongRefMap = DefaultMap<unknown, string>

class KeyHasher {
  #hashCount = 0;

  #weakValueToHash: WeakRefMap = new DefaultWeakMap();

  #strongValueToHash: StrongRefMap = new DefaultMap();

  #incrementer: (() => string) = () => {
    return (++this.#hashCount).toString(36);
  }

  #requireKey(key: unknown) : string
  {
    if (Object(key) === key) {
      return this.#weakValueToHash.getDefault(key as object, this.#incrementer);
    }
    return this.#strongValueToHash.getDefault(key, this.#incrementer);
  }

  constructor()
  {
    if (new.target !== KeyHasher)
      throw new Error("You cannot subclass KeyHasher!");
    Object.freeze(this);
  }

  getHash(...args: unknown[]) : string
  {
    const rv = args.map(arg => this.#requireKey(arg));
    return rv.join(",");
  }

  getHashIfExists(...args: unknown[]) : string
  {
    const values: string[] = [];
    const result = args.every(arg => {
      let rv: string | undefined;
      if (Object(arg) === arg)
        rv = this.#weakValueToHash.get(arg as object);
      else
        rv = this.#strongValueToHash.get(arg);

      if (rv)
        values.push(rv);
      return rv;
    });

    return result ? values.join(",") : "";
  }
}

Object.freeze(KeyHasher.prototype);
Object.freeze(KeyHasher);

type __StrongStrongMap_valueAndKeySet__<
  __MK0__,
  __MK1__,
  __V__
> = {
  value: __V__,
  keySet: [__MK0__, __MK1__]
};

class StrongStrongMap<
  __MK0__,
  __MK1__,
  __V__
> {
  /** The root map holding keys and values. */
  #root = new Map<string, __StrongStrongMap_valueAndKeySet__<__MK0__, __MK1__, __V__>>();

  #hasher: KeyHasher = new KeyHasher();

  constructor(
    iterable?: [__MK0__, __MK1__, __V__][]
  )
  {
    if (iterable) {
      for (const [key1, key2, value] of iterable) {
        this.set(key1, key2, value);
      }
    }
  }

  /**
   * The number of elements in this collection.
   *
   * @returns The element count.
   * @public
   */
  get size() : number
  {
    return this.#root.size;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() : void
  {
    this.#root.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param key1 - The first key.
   * @param key2 - The second key.
   * @returns True if we found the value and deleted it.
   * @public
   */
  delete(key1: __MK0__, key2: __MK1__) : boolean
  {
    
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

  /**
   * Yield the key-value tuples of the collection.
   * @public
   */
  * entries() : IterableIterator<[__MK0__, __MK1__, __V__]>
  {
    for (const __valueAndKeySet__ of this.#root.values()) {
      yield [
        ...__valueAndKeySet__.keySet,
        __valueAndKeySet__.value
      ];
    }
  }

  /**
   * Iterate over the keys and values.
   * @param __callback__ - A function to invoke for each iteration.
   * @param __thisArg__ -  Value to use as this when executing callback.
   * @public
   */
  forEach(
    __callback__: (
      value: __V__,
      key1: __MK0__,
      key2: __MK1__,
      __collection__: StrongStrongMap<__MK0__, __MK1__, __V__>
    ) => void,
    __thisArg__?: unknown
  ) : void
  {
    this.#root.forEach((__valueAndKeySet__) => {
      const __args__: [__V__, __MK0__, __MK1__, this] = [
        __valueAndKeySet__.value,
        ...__valueAndKeySet__.keySet,
        this
      ];
      __callback__.apply(__thisArg__, __args__);
    });
  }

  /**
   * Get a value for a key set.
   *
   * @param key1 - The first key.
   * @param key2 - The second key.
   * @returns The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(key1: __MK0__, key2: __MK1__) : __V__ | undefined
  {
    
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    if (!__hash__)
      return undefined;

    const __valueAndKeySet__ = this.#root.get(__hash__);
    return __valueAndKeySet__?.value;
  }

  /**
   * Guarantee a value for a key set.
   *
   * @param key1 - The first key.
   * @param key2 - The second key.
   * @param __default__ - A function to provide a default value if necessary.
   * @returns The value.
   * @public
   */
  getDefault(key1: __MK0__, key2: __MK1__, __default__: () => __V__) : __V__
  {
    
    const __hash__ = this.#hasher.getHash(key1, key2);
    {
      const __valueAndKeySet__ = this.#root.get(__hash__);
      if (__valueAndKeySet__)
        return __valueAndKeySet__.value;
    }

    const __keySet__: [__MK0__, __MK1__] = [key1, key2];
    Object.freeze(__keySet__);
    const value = __default__();
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return value;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param key1 - The first key.
   * @param key2 - The second key.
   * @returns True if the key set refers to a value in the collection.
   * @public
   */
  has(key1: __MK0__, key2: __MK1__) : boolean
  {
    
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.has(__hash__) : false;
  }

  /**
   * Yield the key sets of the collection.
   * @public
   */
  * keys() : IterableIterator<[__MK0__, __MK1__]>
  {
    for (const __valueAndKeySet__ of this.#root.values()) {
      const [key1, key2] : [__MK0__, __MK1__] = __valueAndKeySet__.keySet;
      yield [key1, key2];
    }
  }

  /**
   * Set a value for a key set.
   *
   * @param key1 - The first key.
   * @param key2 - The second key.
   * @param value - The value.
   * @returns This collection.
   * @public
   */
  set(key1: __MK0__, key2: __MK1__, value: __V__) : this
  {
    

    const __hash__ = this.#hasher.getHash(key1, key2);
    const __keySet__: [__MK0__, __MK1__] = [key1, key2];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

  /**
   * Yield the values of the collection.
   *
   * @public
   */
  * values() : IterableIterator<__V__>
  {
    for (const __valueAndKeySet__ of this.#root.values())
      yield __valueAndKeySet__.value;
  }

  [Symbol.iterator]() : IterableIterator<[__MK0__, __MK1__, __V__]>
  {
    return this.entries();
  }

  [Symbol.toStringTag] = "StrongStrongMap";
}

Object.freeze(StrongStrongMap);
Object.freeze(StrongStrongMap.prototype);

export type ReadonlyStrongStrongMap<
  __MK0__,
  __MK1__,
  __V__
> =
  Pick<
    StrongStrongMap<__MK0__, __MK1__, __V__>,
    "size" | "entries" | "get" | "has" | "keys" | "values"
  > &
  {
    forEach(
      __callback__: (
        value: __V__,
        key1: __MK0__,
      key2: __MK1__,
        __collection__: ReadonlyStrongStrongMap<__MK0__, __MK1__, __V__>
      ) => void,
      __thisArg__?: unknown
    ) : void
  }

export default StrongStrongMap;
