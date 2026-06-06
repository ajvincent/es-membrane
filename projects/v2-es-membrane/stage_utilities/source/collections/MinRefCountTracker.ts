export type SharedAndStrongKeys<SharedKey extends WeakKey, StrongKeyType> = [WeakRef<SharedKey>, StrongKeyType];

export type RefCountTrackerCallback<SharedKey extends WeakKey, StrongKeyType> = (
  this: void,
  parentKey: SharedKey,
  remainingKeys: ReadonlySet<StrongKeyType>
) => void;

// The type parameter names I borrow from OneToOneStrongMap, since that's where I'm going to use this.
export class MinRefCountTracker<
  SharedKey extends WeakKey,
  StrongKeyType,
  ValueType extends WeakKey
>
{
  readonly #minRefCount: number;
  readonly #cleanupCallback: RefCountTrackerCallback<SharedKey, StrongKeyType>;

  readonly #sharedKeyToStrongKeys = new WeakMap<SharedKey, Set<StrongKeyType>>;
  readonly #valueToSharedAndStrongKeys = new WeakMap<
    ValueType, SharedAndStrongKeys<SharedKey, StrongKeyType>
  >;

  readonly #finalizer = new FinalizationRegistry<[WeakRef<SharedKey>, StrongKeyType]>(
    ([weakRef, strongKey]) => this.#cleanupRef(weakRef, strongKey)
  );
  readonly #alreadyCleanedUp = new WeakSet<SharedKey>;

  #cleanupRef(
    weakRef: WeakRef<SharedKey>,
    strongKey: StrongKeyType
  ): void
  {
    const sharedKey: SharedKey | undefined = weakRef.deref();
    if (sharedKey === undefined || this.#alreadyCleanedUp.has(sharedKey))
      return;

    const remainingKeys: Set<StrongKeyType> | undefined = this.#sharedKeyToStrongKeys.get(sharedKey);
    if (!remainingKeys)
      return;

    remainingKeys.delete(strongKey);
    if (remainingKeys.size >= this.#minRefCount)
      return;

    this.#alreadyCleanedUp.add(sharedKey);
    this.#sharedKeyToStrongKeys.delete(sharedKey);
    this.#cleanupCallback(sharedKey, remainingKeys);
  }

  constructor(
    minRefCount: number,
    cleanupCallback: RefCountTrackerCallback<SharedKey, StrongKeyType>,
  )
  {
    this.#minRefCount = minRefCount;
    this.#cleanupCallback = cleanupCallback;
  }

  addReference(
    sharedKey: SharedKey,
    strongKey: StrongKeyType,
    value: ValueType
  ): void
  {
    const keySet: Set<StrongKeyType> = this.#sharedKeyToStrongKeys.getOrInsertComputed(sharedKey, () => new Set);
    if (keySet.has(strongKey))
      throw new Error("strong key already known");

    const refAndKey: [WeakRef<SharedKey>, StrongKeyType] = [
      new WeakRef(sharedKey), strongKey
    ];

    this.#finalizer.register(value, refAndKey, value);
    this.#valueToSharedAndStrongKeys.set(value, refAndKey);
    keySet.add(strongKey);
  }

  deleteReference(
    value: ValueType,
    attemptCleanup: boolean,
  ): void
  {
    this.#finalizer.unregister(value);

    const keyRefAndStrongKey: SharedAndStrongKeys<
      SharedKey, StrongKeyType
    > | undefined = this.#valueToSharedAndStrongKeys.get(value);

    this.#valueToSharedAndStrongKeys.delete(value);
    if (attemptCleanup)
      this.#cleanupRef(...keyRefAndStrongKey!);
  }
}
