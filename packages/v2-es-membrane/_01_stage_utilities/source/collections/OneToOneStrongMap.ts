import WeakStrongMap from "./WeakStrongMap.js";

class InternalKey {
  doNotCallMe(): never {
    throw new Error("don't call me");
  }
}
Object.freeze(InternalKey);
Object.freeze(InternalKey.prototype);

export default class OneToOneStrongMap<
  StrongKeyType,
  ValueType extends object
>
{
  #baseMap: WeakStrongMap<InternalKey, StrongKeyType, ValueType> = new WeakStrongMap;
  #weakValueToInternalKeyMap: WeakMap<ValueType, InternalKey> = new WeakMap;

  /**
   * Bind two sets of keys and values together.
   *
   * @param strongKey_1 - The strongly held key.
   * @param value_1 - The first value.
   * @param strongKey_2 - The second key.
   * @param value_2 - The second value.
   */
  public bindOneToOne(
    strongKey_1: StrongKeyType,
    value_1: ValueType,
    strongKey_2: StrongKeyType,
    value_2: ValueType
  ) : void
  {
    let internalKey = this.#weakValueToInternalKeyMap.get(value_1);
    const __otherInternalKey__ = this.#weakValueToInternalKeyMap.get(value_2);
    if (!internalKey) {
      internalKey = __otherInternalKey__ || new InternalKey;
    }
    else if (__otherInternalKey__ && (__otherInternalKey__ !== internalKey)) {
      return this.#attemptMergeKeys(internalKey, __otherInternalKey__);
    }

    const __hasKeySet1__  = this.#baseMap.has(internalKey, strongKey_1);
    const __hasKeySet2__  = this.#baseMap.has(internalKey, strongKey_2);

    if (__hasKeySet1__ && (this.#baseMap.get(internalKey, strongKey_1) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#baseMap.get(internalKey, strongKey_2) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#weakValueToInternalKeyMap.set(value_1, internalKey);
    this.#weakValueToInternalKeyMap.set(value_2, internalKey);

    if (!__hasKeySet1__)
      this.#baseMap.set(internalKey, strongKey_1, value_1);

    if (!__hasKeySet2__)
      this.#baseMap.set(internalKey, strongKey_2, value_2);
  }

  #attemptMergeKeys(
    firstInternalKey: InternalKey,
    secondInternalKey: InternalKey
  ): void
  {
    const firstKeySet: ReadonlySet<StrongKeyType> = this.#baseMap.strongKeysFor(firstInternalKey);
    const secondKeySet: ReadonlySet<StrongKeyType> = this.#baseMap.strongKeysFor(secondInternalKey);

    const unionKeySet: ReadonlySet<StrongKeyType> = new Set([
      ...firstKeySet, ...secondKeySet
    ]);
    if (unionKeySet.size < firstKeySet.size + secondKeySet.size)
      throw new Error("value_1 and value_2 have conflicting keys!");

    for (const strongKey of secondKeySet) {
      const value: ValueType = this.#baseMap.get(secondInternalKey, strongKey)!;
      this.#baseMap.set(firstInternalKey, strongKey, value);
      this.#baseMap.delete(secondInternalKey, strongKey);
      this.#weakValueToInternalKeyMap.set(value, firstInternalKey);
    }
  }

  /** Clear all bindings. */
  public clear(): void {
    this.#baseMap = new WeakStrongMap;
    this.#weakValueToInternalKeyMap = new WeakMap;
  }

  /**
   * Delete a target value.
   *
   * @param value -The value.
   * @param strongKey - The strongly held key.
   * @returns True if the target value was deleted.
   */
  public delete(
    value: ValueType,
    strongKey: StrongKeyType
  ) : boolean
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    if (!weakKey)
      return false;

    const __target__ = this.#baseMap.get(weakKey, strongKey);
    if (!__target__)
      return false;

    const __returnValue__ = this.#baseMap.delete(weakKey, strongKey);
    if (__returnValue__) {
      this.#weakValueToInternalKeyMap.delete(__target__);

      const remainingKeys: Set<StrongKeyType> = this.#baseMap.strongKeysFor(weakKey);
      if (remainingKeys.size < 2) {
        for (const otherStrongKey of remainingKeys) {
          const otherTarget: ValueType = this.#baseMap.get(weakKey, otherStrongKey)!;
          this.#weakValueToInternalKeyMap.delete(otherTarget);
          this.#baseMap.delete(weakKey, otherStrongKey);
        }
      }
    }

    return __returnValue__;
  }

  /**
   * Get a target value.
   *
   * @param value - The value.
   * @param strongKey - The strongly held key.
   * @returns The target value.
   */
  public get(
    value: ValueType,
    strongKey: StrongKeyType
  ) : ValueType | undefined
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    return weakKey ? this.#baseMap.get(weakKey, strongKey) : undefined;
  }

  /**
   * Determine if a target value exists.
   *
   * @param value - The value.
   * @param strongKey - The strongly held key.
   * @returns True if the target value exists.
   */
  public has(
    value: ValueType,
    strongKey: StrongKeyType
  ) : boolean
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    return weakKey ? this.#baseMap.has(weakKey, strongKey) : false;
  }

  /**
   * Determine if a target value is an identity in this map.
   *
   * @param value - The value.
   * @param strongKey - The strongly held key.
   * @param allowNotDefined - If true, treat the absence of the value as an identity.
   * @returns True if the target value exists.
   * @public
   */
  hasIdentity(
    value: ValueType,
    strongKey: StrongKeyType,
    allowNotDefined: boolean
  ) : boolean
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    if (!weakKey) {
      return allowNotDefined;
    }
    return this.#baseMap.get(weakKey, strongKey) === value;
  }

  [Symbol.toStringTag] = "OneToOneStrongMap";
}

Object.freeze(OneToOneStrongMap);
Object.freeze(OneToOneStrongMap.prototype);

export type ReadonlyOneToOneStrongMap<
  StrongKeyType,
  ValueType extends object
> =
  Pick<
    OneToOneStrongMap<StrongKeyType, ValueType>,
    "get" | "has" | "hasIdentity"
  >
