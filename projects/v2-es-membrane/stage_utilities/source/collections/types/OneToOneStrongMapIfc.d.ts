export interface ReadonlyOneToOneStrongMapIfc<StrongKeyType, ValueType extends object> {
  /**
   * Get a target value.
   *
   * @param value - The value.
   * @param strongKey - The strongly held key.
   * @returns The target value.
   */
  get(value: ValueType, strongKey: StrongKeyType): ValueType | undefined;

  /**
   * Determine if a target value exists.
   *
   * @param value - The value.
   * @param strongKey - The strongly held key.
   * @returns True if the target value exists.
   */
  has(value: ValueType, strongKey: StrongKeyType): boolean;

  /**
   * Determine if a target value is an identity in this map.
   *
   * @param value - The value.
   * @param strongKey - The strongly held key.
   * @param allowNotDefined - If true, treat the absence of the value as an identity.
   * @returns True if the target value exists.
   * @public
   */
  hasIdentity(value: ValueType, strongKey: StrongKeyType, allowNotDefined: boolean): boolean;

  /**
   * Report if a strong key was revoked.
   * @param strongKey the candidate key
   */
  keyWasRevoked(strongKey: StrongKeyType): boolean;
}

export interface OneToOneStrongMapIfc<StrongKeyType, ValueType extends object>
extends ReadonlyOneToOneStrongMapIfc<StrongKeyType, ValueType>
{
  /**
   * Bind two sets of keys and values together.
   *
   * @param strongKey_1 - The strongly held key.
   * @param value_1 - The first value.
   * @param strongKey_2 - The second key.
   * @param value_2 - The second value.
   */
  bindOneToOne(strongKey_1: StrongKeyType, value_1: ValueType, strongKey_2: StrongKeyType, value_2: ValueType): void;

  /** Clear all bindings. */
  clear(): void;

  /**
   * Delete a target value.
   *
   * @param value -The value.
   * @param strongKey - The strongly held key.
   * @returns True if the target value was deleted.
   */
  delete(value: ValueType, strongKey: StrongKeyType): boolean;

  /**
   * Disconnect all values tied to a strong key, and disable future set() operations using the strong key.
   * @param strongKey the key to revoke
   */
  revokeStrongKey(strongKey: StrongKeyType): void;

  /** After calling this, the OneToOneStrongMap is dead. */
  revokeEverything(): void;
}
