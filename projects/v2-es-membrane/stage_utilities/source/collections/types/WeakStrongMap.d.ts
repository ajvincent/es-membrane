export interface ReadonlyWeakStrongMap<WeakKeyType extends object, StrongKeyType, ValueType> {
  /**
   * Get a value for a key set.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @returns The value.  Undefined if it isn't in the collection.
   */
  get(weakKey: WeakKeyType, strongKey: StrongKeyType): ValueType | undefined;

  /**
   * Report if the collection has a value for a key set.
   *
   * @param weakKey -The weakly held key.
   * @param strongKey - The strongly held key.
   * @returns True if the key set refers to a value in the collection.
   */
  has(weakKey: WeakKeyType, strongKey: StrongKeyType): boolean;

  /**
   * Get all strong keys for a given weak key.
   * @param weakKey The weak key to look up strong keys for.
   */
  strongKeysFor(weakKey: WeakKeyType): Set<StrongKeyType>;

  /**
   * Report if a strong key was revoked.
   * @param strongKey the candidate key
   */
  keyWasRevoked(strongKey: StrongKeyType): boolean;
}

export interface WeakStrongMapIfc<WeakKeyType extends object, StrongKeyType, ValueType>
extends ReadonlyWeakStrongMap<WeakKeyType, StrongKeyType, ValueType>
{
  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @returns True if we found the value and deleted it.
   */
  delete(weakKey: WeakKeyType, strongKey: StrongKeyType): boolean;

  /**
   * Guarantee a value for a key set.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @param defaultGetter - A function to provide a default value if necessary.
   * @returns The value.
   */
  getOrInsertComputed(weakKey: WeakKeyType, strongKey: StrongKeyType, defaultGetter: () => ValueType): ValueType;

  /**
   * Set a value for a key set.
   *
   * @param weakKey - The weakly held key.
   * @param strongKey - The strongly held key.
   * @param value - The value.
   */
  set(weakKey: WeakKeyType, strongKey: StrongKeyType, value: ValueType): this;

  /**
   * Disconnect all values tied to a strong key, and disable future set() operations using the strong key.
   * @param strongKey the key to revoke
   */
  revokeStrongKey(strongKey: StrongKeyType): void;
}
