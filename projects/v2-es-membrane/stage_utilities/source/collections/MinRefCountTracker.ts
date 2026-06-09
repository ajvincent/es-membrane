import type {
  PrivateKeyBranded,
  SharedKeyBranded
} from "./KeysBranded.js";
import { MinRefCountTrackerIfc } from "./types/MinRefCountTrackerIfc.js";

export type SharedAndStrongKeys<StrongKeyType> = [WeakRef<SharedKeyBranded>, StrongKeyType];

export type RefCountTrackerCallback<StrongKeyType> = (
  this: void,
  sharedKey: SharedKeyBranded,
  remainingKeys: ReadonlySet<StrongKeyType>
) => void;

interface RefCountFinalizationRegistry<StrongKeyType> {
  register(
    target: PrivateKeyBranded,
    heldValue: SharedAndStrongKeys<StrongKeyType>,
    unregisterToken?: PrivateKeyBranded
  ): void;

  unregister(
    unregisterToken: PrivateKeyBranded
  ): boolean;
}

export class MinRefCountTracker<StrongKeyType> implements MinRefCountTrackerIfc<StrongKeyType>
{
  readonly #minRefCount: number;
  readonly #cleanupCallback: RefCountTrackerCallback<StrongKeyType>;

  readonly #sharedKeyToStrongKeys = new WeakMap<SharedKeyBranded, Set<StrongKeyType>>;
  readonly #privateKeyToSharedAndStrongKeys = new WeakMap<
    PrivateKeyBranded, SharedAndStrongKeys<StrongKeyType>
  >;

  readonly #finalizer: RefCountFinalizationRegistry<StrongKeyType> = new FinalizationRegistry(
    ([weakRef, strongKey]) => this.#cleanupRef(weakRef, strongKey)
  );
  readonly #alreadyCleanedUp = new WeakSet<SharedKeyBranded>;

  #cleanupRef(
    weakRef: WeakRef<SharedKeyBranded>,
    strongKey: StrongKeyType
  ): void
  {
    const sharedKey: SharedKeyBranded | undefined = weakRef.deref();
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
    cleanupCallback: RefCountTrackerCallback<StrongKeyType>,
  )
  {
    this.#minRefCount = minRefCount;
    this.#cleanupCallback = cleanupCallback;
  }

  hasReference(
    sharedKey: SharedKeyBranded,
    strongKey: StrongKeyType,
  ): boolean
  {
    return this.#sharedKeyToStrongKeys.get(sharedKey)?.has(strongKey) ?? false;
  }

  addReference(
    privateKey: PrivateKeyBranded,
    sharedKey: SharedKeyBranded,
    strongKey: StrongKeyType,
  ): void
  {
    const keySet: Set<StrongKeyType> = this.#sharedKeyToStrongKeys.getOrInsertComputed(sharedKey, () => new Set);
    if (keySet.has(strongKey))
      throw new Error("strong key already known");

    const refAndKey: [WeakRef<SharedKeyBranded>, StrongKeyType] = [
      new WeakRef(sharedKey), strongKey
    ];

    this.#finalizer.register(privateKey, refAndKey, privateKey);
    this.#privateKeyToSharedAndStrongKeys.set(privateKey, refAndKey);
    keySet.add(strongKey);
  }

  deleteReference(
    privateKey: PrivateKeyBranded,
    attemptCleanup: boolean,
  ): void
  {
    this.#finalizer.unregister(privateKey);

    const keyRefAndStrongKey: SharedAndStrongKeys<StrongKeyType> | undefined
      = this.#privateKeyToSharedAndStrongKeys.get(privateKey);

    this.#privateKeyToSharedAndStrongKeys.delete(privateKey);
    if (attemptCleanup)
      this.#cleanupRef(...keyRefAndStrongKey!);
  }
}
