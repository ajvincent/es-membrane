import RefCountWeakMap from "./RefCountWeakMap.js";

export default class WeakWeakMap<
  K1 extends WeakKey,
  K2 extends WeakKey,
  V
>
{
  #size = 0;

  readonly #outerMap = new RefCountWeakMap<K1, RefCountWeakMap<K2, V>>;
  readonly #firstKeyToWeakRef = new WeakMap<K1, WeakRef<K1>>;

  #derefAndDelete(
    keyRef: WeakRef<K1>
  ): void
  {
    const key1 = keyRef.deref();
    if (key1)
      this.#deleteFirstKey(key1);
  }

  #deleteFirstKey(key1: K1): void {
    this.#firstKeyToWeakRef.delete(key1);
    this.#outerMap.delete(key1);
  }

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
    const innerMap = this.#outerMap.get(key1);
    if (!innerMap)
      return false;

    const didDelete = innerMap.delete(key2);
    if (didDelete) {
      this.#size--;
      if (innerMap.size === 0) {
        this.#outerMap.delete(key1);
      }
    }

    return didDelete;
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
    let innerMap: RefCountWeakMap<K2, V> | undefined = this.#outerMap.get(key1);
    if (!innerMap) {
      innerMap = new RefCountWeakMap<K2, V>;
      this.#outerMap.set(key1, innerMap);

      const weakRef = new WeakRef<K1>(key1);
      this.#firstKeyToWeakRef.set(key1, weakRef);
      innerMap.assignEmptyCallback(this.#derefAndDelete.bind(this, weakRef));
    }

    if (!innerMap.has(key2)) {
      this.#size++;
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

  /**
   * Assign a function to call for when this map becomes empty.
   * @param callback the function to call, or undefined to clear the callback.
   */
  public assignEmptyCallback(callback: (() => void) | undefined) {
    this.#outerMap.assignEmptyCallback(callback);
  }

  /** The number of elements in the map. */
  public get size(): number {
    return this.#size;
  }
}
