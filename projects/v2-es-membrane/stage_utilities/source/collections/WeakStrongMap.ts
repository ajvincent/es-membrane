import { InertWeakMap } from "./inert/WeakMap.js";
import { WeakStrongMapIfc } from "./types/WeakStrongMap.js";

export class WeakStrongMap<WeakKeyType extends object, StrongKeyType, ValueType>
implements WeakStrongMapIfc<WeakKeyType, StrongKeyType, ValueType>
{
  /**
   * Why strong map, then weak map?  It's a reversal of my original design.  Three reasons.
   *
   * 1. Revoking a graph is a single operation (rather than spidering through several weak maps)
   * 2. We remember the revocation.
   * 3. There are almost certainly more bound objects, let alone proxies, than object graphs.
   *
   * This last point is interesting.  Overall we're storing n objects times m object graphs, plus some
   * overhead.  The overhead in the original design is n WeakMaps.  Here it's m Maps, and m is almost
   * always going to be less than n.
   *
   * The downside is clean-up: the delete operation can no longer know when there is only one key left for
   * an object unless it walks all the object graphs - which in theory isn't expensive (few object graphs),
   * but used to be constant time.
   *
   * Since I can prove via es-search-references that we hold no values strongly, I am not too worried about it.
   */
  readonly #root = new Map<StrongKeyType, WeakMap<WeakKeyType, ValueType>>;
  readonly #revokedStrongKeys = new Set<StrongKeyType>;

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

  public delete(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType
  ): boolean
  {
    const innerMap = this.#root.get(strongKey);
    if (!innerMap)
      return false;

    return innerMap.delete(weakKey);
  }

  public get(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType
  ): ValueType | undefined
  {
    return this.#root.get(strongKey)?.get(weakKey);
  }

  public getOrInsertComputed(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType,
    defaultGetter: () => ValueType
  ): ValueType
  {
    return this.#root.getOrInsertComputed(strongKey, () => new WeakMap).getOrInsertComputed(weakKey, defaultGetter);
  }

  public strongKeysFor(
    weakKey: WeakKeyType
  ): Set<StrongKeyType>
  {
    const retrievedKeys: Set<StrongKeyType> = new Set;

    for (const [strongKey, weakMap] of this.#root.entries()) {
      if (weakMap.has(weakKey)) {
        retrievedKeys.add(strongKey);
      }
    }
    return retrievedKeys;
  }

  public has(weakKey: WeakKeyType, strongKey: StrongKeyType): boolean {
    return this.#root.get(strongKey)?.has(weakKey) ?? false;
  }

  public set(
    weakKey: WeakKeyType,
    strongKey: StrongKeyType,
    value: ValueType
  ): this
  {
    if (this.#revokedStrongKeys.has(strongKey) === false)
      this.#root.getOrInsertComputed(strongKey, () => new WeakMap).set(weakKey, value);
    return this;
  }

  public revokeStrongKey(strongKey: StrongKeyType): void {
    this.#root.set(strongKey, new InertWeakMap);
    this.#revokedStrongKeys.add(strongKey);
  }

  public keyWasRevoked(strongKey: StrongKeyType): boolean {
    return this.#revokedStrongKeys.has(strongKey);
  }

  public readonly [Symbol.toStringTag] = "WeakStrongMap";
}

Object.freeze(WeakStrongMap);
Object.freeze(WeakStrongMap.prototype);

export declare type ReadonlyWeakStrongMap<
  WeakKeyType extends object,
  StrongKeyType,
  ValueType
> = Pick<WeakStrongMap<WeakKeyType, StrongKeyType, ValueType>, "get" | "has">;
