export default class WeakStrongMap<
  WeakKeyType extends object,
  StrongKeyType,
  ValueType
>
{
  readonly #root = new WeakMap<WeakKeyType, Map<StrongKeyType, ValueType>>;

  public constructor(
    iterable?: [WeakKeyType, StrongKeyType, ValueType][]
  )
  {
    if (iterable) {
      for (const [weakKey, strongKey, value] of iterable) {
        this.set(weakKey, strongKey, value);
      }
    }
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @returns True if we found the value and deleted it.
   */
  public delete(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType
  ): boolean
  {
    let innerMap = this.#root.get(weakKey);
    if (!innerMap)
      return false;

    const rv: boolean = innerMap.delete(strongKey);
    if (innerMap.size === 0) {
      this.#root.delete(weakKey);
    }
    return rv;
  }

  /**
   * Get a value for a key set.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @returns The value.  Undefined if it isn't in the collection.
   */
  public get(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType
  ): ValueType | undefined
  {
    return this.#root.get(weakKey)?.get(strongKey);
  }

  /**
   * Guarantee a value for a key set.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @param defaultGetter - A function to provide a default value if necessary.
   * @returns The value.
   */
  public getDefault(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType,
    defaultGetter: () => ValueType
  ): ValueType
  {
    if (!this.has(weakKey, strongKey)) {
      const result = defaultGetter();
      this.set(weakKey, strongKey, result);
      return result;
    }

    return this.get(weakKey, strongKey)!;
  }

  public strongKeysFor(
    weakKey: WeakKeyType
  ): Set<StrongKeyType>
  {
    const innerMap = this.#root.get(weakKey);
    return new Set(innerMap?.keys() ?? []);
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param weakKey -The weakly held key.
   * @param strongKey - The strongly held key.
   * @returns True if the key set refers to a value in the collection.
   */
  public has(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType
  ): boolean
  {
    return this.#root?.get(weakKey)?.has(strongKey) ?? false;
  }

  /**
   * Set a value for a key set.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @param value - The value.
   */
  public set(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType,
    value: ValueType
  ): this
  {
    if (!this.#root.has(weakKey)) {
      this.#root.set(weakKey, new Map);
    }
    this.#root.get(weakKey)!.set(strongKey, value);
    return this;
  }

  readonly [Symbol.toStringTag] = "WeakStrongMap";
}

Object.freeze(WeakStrongMap);
Object.freeze(WeakStrongMap.prototype);

export declare type ReadonlyWeakStrongMap<
  WeakKeyType extends object,
  StrongKeyType,
  ValueType
> = Pick<WeakStrongMap<WeakKeyType, StrongKeyType, ValueType>, "get" | "has">;
