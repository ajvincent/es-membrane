export default class WeakWeakMap<
  K1 extends WeakKey,
  K2 extends WeakKey,
  V
>
{
  readonly #outerMap = new WeakMap<K1, WeakMap<K2, V>>;

  /**
   * Removes the specified element from the WeakMap.
   * @param key1 Must be an object or symbol.
   * @param key2 Must be an object or symbol.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  public delete(
    key1: K1,
    key2: K2
  ): boolean
  {
    // Yes, this leaks memory in the sense of this.#outerMap holding potentially empty inner WeakMaps.
    // to fix that entails some nastiness - either a FinalizationRegistry which might not fire in time, or
    // polling a Set<WeakRef<K2>> for each K1 (O(m * n)).  Pick your poison.

    // For my needs, I opt for "don't bother", because these are meant to be short-lived WeakWeakMap objects.
    return this.#outerMap.get(key1)?.delete(key2) ?? false;
  }

  /**
   * @param key1 Must be an object or symbol.
   * @param key2 Must be an object or symbol.
   * @returns a specified element.
   */
  public get(
    key1: K1,
    key2: K2
  ): V | undefined
  {
    return this.#outerMap.get(key1)?.get(key2);
  }

  /**
   * @param key1 Must be an object or symbol.
   * @param key2 Must be an object or symbol.
   * @returns a boolean indicating whether an element with the specified key exists or not.
   */
  public has(
    key1: K1,
    key2: K2
  ): boolean
  {
    return this.#outerMap.get(key1)?.has(key2) ?? false;
  }

  /**
   * Adds a new element with a specified key and value.
   * @param key1 Must be an object or symbol.
   * @param key2 Must be an object or symbol.
   */
  public set(
    key1: K1,
    key2: K2,
    value: V
  ): this
  {
    let innerMap: WeakMap<K2, V> | undefined = this.#outerMap.get(key1);
    if (!innerMap) {
      innerMap = new WeakMap;
      this.#outerMap.set(key1, innerMap);
    }

    innerMap.set(key2, value);
    return this;
  }

  /**
   * Get the current value, or set a value from a builder function.
   * @param key1 - must be an object or a symbol.
   * @param key2 - must be an object or a symbol.
   * @param builder - the function to build new values from.
   * @returns the value in the map.
   */
  public getDefault(
    key1: K1,
    key2: K2,
    builder: () => V
  ): V
  {
    if (!this.has(key1, key2)) {
      const value: V = builder();
      this.set(key1, key2, value);
      return value;
    }
    return this.get(key1, key2)!;
  }
}
