import { WeakRefSet } from "#stage_utilities/source/collections/WeakRefSet.js";

type RevokerFunction = (this: void) => void;

/**
 * This class is all about tracking and invoking revokers for when an object graph must die.
 * @internal
 */
export class KeyedRevokerSets {
  readonly #revokedKeys = new Set<string | symbol>;
  #revokedAll: boolean = false;

  // This is the only way outside values can hold a strong reference to the revoker
  #ownerToRevokerMap = new WeakMap<object, RevokerFunction>;
  #revokerSets = new Map<string | symbol, WeakRefSet<RevokerFunction>>;
  #alreadyCalled = new WeakSet<RevokerFunction>;

  /**
   * Add a revoker, with its ownership references to the sets which may call it.
   * @param owner - A proxy which we will use to hold the revoker weakly.
   * @param revoker - the revoker function.
   * @param secondaryKey - the second object graph key which the revoker may execute for.
   */
  addRevoker(
    owner: object,
    revoker: RevokerFunction,
    keys: readonly (string | symbol)[]
  ): void
  {
    if (this.#revokedAll)
      throw new Error("All keys have been revoked");

    if (this.#alreadyCalled.has(revoker))
      throw new Error("We have already called this revoker.");

    for (const key of keys) {
      if (this.#revokedKeys.has(key))
        throw new Error("At least one key has been revoked");
    }

    this.#ownerToRevokerMap.set(owner, revoker);
    for (const key of keys) {
      this.#revokerSets.getOrInsertComputed(key, () => new WeakRefSet).addReference(revoker);
    }
  }

  /**
   * Revoke all proxies belonging to an object graph.
   * @param key - the object graph key to revoke proxies for.
   */
  revokeSet(
    key: string | symbol
  ): void
  {
    if (this.#revokedAll || this.#revokedKeys.has(key))
      return;
    this.#revokeSet(key);
  }

  /** Clear everything and deactivate this. */
  revokeAll(): void {
    if (this.#revokedAll)
      return;
    this.#revokedAll = true;
    this.#revokedKeys.clear();
    this.#ownerToRevokerMap = new WeakMap;
    for (const key of this.#revokerSets.keys())
      this.#revokeSet(key);
    this.#revokerSets.clear();
    this.#alreadyCalled = new WeakSet;
  }

  #revokeSet(key: string | symbol) {
    const revokerSet = this.#revokerSets.get(key);
    if (!revokerSet)
      throw new Error("unknown key");
    this.#revokedKeys.add(key);
    this.#revokerSets.delete(key);

    for (const revoker of revokerSet.liveElements()) {
      if (this.#alreadyCalled.has(revoker))
        continue;
      revoker();
      this.#alreadyCalled.add(revoker);
    }
  }
}
