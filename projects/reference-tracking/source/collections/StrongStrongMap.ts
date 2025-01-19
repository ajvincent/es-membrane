import {
  DefaultMap
} from "./DefaultMap.js";

export default class StrongStrongMap<K1, K2, V> {
  #size = 0;
  readonly #outerMap = new DefaultMap<K1, Map<K2, V>>;

  constructor(entries?: readonly [K1, K2, V][]) {
    if (entries) {
      for (const [firstKey, secondKey, value] of entries) {
        this.set(firstKey, secondKey, value)
      }
    }
  }

  public clear(): void {
    this.#outerMap.clear();
    this.#size = 0;
  }

  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  public delete(firstKey: K1, secondKey: K2): boolean {
    if (!this.#outerMap.has(firstKey))
      return false;

    const innerMap = this.#outerMap.get(firstKey)!;
    const didDelete = innerMap.delete(secondKey);
    if (didDelete) {
      this.#size--;
      if (innerMap.size === 0) {
        this.#outerMap.delete(firstKey);
      }
    }
    return didDelete;
  }

  /**
   * Executes a provided function once per each key/value pair in the Map, in insertion order.
   */
  public forEach(
    callbackfn: (value: V, firstKey: K1, secondKey: K2, map: this) => void,
    thisArg?: unknown
  ): void
  {
    for (const [firstKey, innerMap] of this.#outerMap) {
      innerMap.forEach(
        (value, secondKey) => callbackfn.call(thisArg, value, firstKey, secondKey, this)
      );
    }
  }

  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  public get(firstKey: K1, secondKey: K2): V | undefined {
    return this.#outerMap.get(firstKey)?.get(secondKey);
  }

  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  public has(firstKey: K1, secondKey: K2): boolean {
    return this.#outerMap.get(firstKey)?.has(secondKey) ?? false;
  }

  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  public set(firstKey: K1, secondKey: K2, value: V): this {
    const hadBefore = this.has(firstKey, secondKey);
    this.#outerMap.getDefault(firstKey, () => new Map).set(secondKey, value);
    if (hadBefore === false) {
      this.#size++;
    }
    return this;
  }

  /**
   * @returns the number of elements in the Map.
   */
  public get size(): number {
    return this.#size;
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  public entries(): MapIterator<[K1, K2, V]> {
    return this[Symbol.iterator]();
  }

  /**
   * Returns an iterable of keys in the map
   */
  public * keys(): MapIterator<[K1, K2]> {
    for (const keysAndValues of this[Symbol.iterator]()) {
      yield [keysAndValues[0], keysAndValues[1]];
    }
  }

  /**
   * Returns an iterable of keys in the map
   */
  public * values(): MapIterator<V> {
    for (const keysAndValues of this[Symbol.iterator]())
      yield keysAndValues[2];
  }

  /** Returns an iterable of entries in the map. */
  public * [Symbol.iterator](): MapIterator<[K1, K2, V]> {
    for (const [firstKey, innerMap] of this.#outerMap[Symbol.iterator]()) {
      for (const [secondKey, value] of innerMap[Symbol.iterator]()) {
        yield [firstKey, secondKey, value];
      }
    }
  }
}
