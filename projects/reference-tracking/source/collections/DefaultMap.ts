export class DefaultMap<K, V> extends Map<K, V>
{
  /**
   * Get the current value, or set a value from a builder function.
   * @param key - must be an object or a symbol.
   * @param builder - the function to build new values from.
   * @returns the value in the map.
   */
  getDefault(key: K, builder: () => V): V {
    if (!this.has(key)) {
      const value = builder();
      this.set(key, value);
      return value;
    }

    return this.get(key)!;
  }
}

export class DefaultWeakMap<K extends WeakKey, V> extends WeakMap<K, V>
{
  /**
   * Get the current value, or set a value from a builder function.
   * @param key - must be an object or a symbol.
   * @param builder - the function to build new values from.
   * @returns the value in the map.
   */
  getDefault(key: K, builder: () => V): V {
    if (!this.has(key)) {
      const value = builder();
      this.set(key, value);
      return value;
    }

    return this.get(key)!;
  }
}
