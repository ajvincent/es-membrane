import {
  DefaultMap,
} from "#stage_utilities/source/collections/DefaultMap.js";

type RevokerFunction = () => void;
type RevokerReference = WeakRef<RevokerFunction>;
type RevokerSet = Set<RevokerReference>;

/**
 * This class is all about tracking and invoking revokers for when an object graph must die.
 * @internal
 */
export default class RevokerManagement {
  // this is the memory leak
  readonly #ownerRevokerOneToOneMap = new WeakMap<object, object>;

  readonly #primaryKey: string | symbol;

  readonly #revokerToReferenceMap = new WeakMap<RevokerFunction, RevokerReference>;
  readonly #keyToReferences = new DefaultMap<string | symbol, RevokerSet>;
  readonly #keyToFinalizerMap = new DefaultMap<string | symbol, FinalizationRegistry<RevokerReference>>;

  /**
   * @param primaryKey - the object graph key all revokers may execute for.
   */
  constructor(
    primaryKey: string | symbol
  )
  {
    this.#primaryKey = primaryKey;
  }

  /**
   * Add a revoker, with its ownership references to the sets which may call it.
   * @param owner - A proxy which we will use to hold the revoker weakly.
   * @param revoker - the revoker function.
   * @param secondaryKey - the second object graph key which the revoker may execute for.
   */
  addRevoker(
    owner: object,
    revoker: RevokerFunction,
    secondaryKey: string | symbol
  ): void
  {
    this.#ownerRevokerOneToOneMap.set(owner, revoker);
    this.#ownerRevokerOneToOneMap.set(revoker, owner);

    const reference = new WeakRef(revoker);
    this.#revokerToReferenceMap.set(revoker, reference);
    this.#addReference(this.#primaryKey, revoker, reference);
    this.#addReference(secondaryKey, revoker, reference);
  }

  #addReference(
    key: string | symbol,
    revoker: RevokerFunction,
    reference: RevokerReference
  ): void
  {
    const referencesSet = this.#keyToReferences.getDefault(key, () => new Set);
    const finalizerRegistry: FinalizationRegistry<RevokerReference> = this.#keyToFinalizerMap.getDefault(
      key, () => new FinalizationRegistry(
        ref => this.#clearReference(key, ref)
      )
    );

    finalizerRegistry.register(revoker, reference, reference);
    referencesSet.add(reference);
  }

  #clearReference(key: string | symbol, reference: RevokerReference): void {
    const revoker = reference.deref();
    if (revoker) {
      const owner = this.#ownerRevokerOneToOneMap.get(revoker);
      if (owner) {
        this.#ownerRevokerOneToOneMap.delete(owner);
      }
      this.#ownerRevokerOneToOneMap.delete(revoker);
    }
    this.#keyToReferences.get(key)!.delete(reference);
    this.#keyToReferences.get(this.#primaryKey)!.delete(reference);
  }

  /**
   * Revoke all proxies belonging to an object graph.
   * @param key - the object graph key to revoke proxies for.
   */
  revokeSet(
    key: string | symbol
  ): void
  {
    const referencesSet: Set<RevokerReference> | undefined = this.#keyToReferences.get(key);
    if (referencesSet === undefined)
      return;

    const primaryReferenceSet: RevokerSet = this.#keyToReferences.get(this.#primaryKey)!;
    const primaryFinalizer: FinalizationRegistry<RevokerReference> = this.#keyToFinalizerMap.get(this.#primaryKey)!;
    const secondaryFinalizer: FinalizationRegistry<RevokerReference> = this.#keyToFinalizerMap.get(key)!

    for (const reference of referencesSet) {
      const revoker = reference.deref();
      if (revoker === undefined)
        continue;

      revoker();
      if (key !== this.#primaryKey) {
        primaryFinalizer.unregister(reference);
        secondaryFinalizer.unregister(reference);
        primaryReferenceSet.delete(reference);
      }
    }

    if (key === this.#primaryKey) {
      this.#keyToFinalizerMap.clear();
      this.#keyToReferences.clear();
    } else {
      referencesSet.clear();
    }
  }
}
