import {
  BuiltInCollections
} from "./BuiltInCollections.js";

import { WeakRefSet } from "./WeakRefSet.js";

export class WeakRefMap<K extends object, V>
/*
implements Omit<Map<K, V>, "size">
*/
{
  readonly #keyRefSet = new WeakRefSet<K>;
  #internalMap = new BuiltInCollections.WeakMap<WeakRef<K>, V>;

  constructor(iterable?: Iterable<[K, V]>) {
    if (iterable) {
      for (const [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }

  public clear(): void {
    this.#keyRefSet.clearReferences();
    this.#internalMap = new BuiltInCollections.WeakMap;
  }

  public delete(key: K): boolean {
    const ref = this.#keyRefSet.getReference(key);
    this.#keyRefSet.deleteReference(key);
    return ref ? this.#internalMap.delete(ref) : false;
  }

  public forEach(
    callbackfn: (value: V, key: K, map: WeakRefMap<K, V>) => void,
    thisArg?: unknown
  ): void
  {
    for (const [key, value] of this[Symbol.iterator]()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  public get(key: K): V | undefined {
    const ref = this.#keyRefSet.getReference(key);
    return ref ? this.#internalMap.get(ref) : undefined;
  }

  public has(key: K): boolean {
    const ref = this.#keyRefSet.getReference(key);
    return ref ? this.#internalMap.has(ref) : false;
  }

  public set(key: K, value: V): this {
    this.#keyRefSet.addReference(key);
    this.#internalMap.set(this.#keyRefSet.getReference(key)!, value);
    return this;
  }

  public entries(): MapIterator<[K, V]> {
    return this[Symbol.iterator]();
  }

  public keys(): MapIterator<K> {
    return this.#keyRefSet.liveElements();
  }

  public * values(): MapIterator<V> {
    for (const ref of this.#keyRefSet.liveReferences())
      yield this.#internalMap.get(ref) as V;
  }

  public * [Symbol.iterator](): MapIterator<[K, V]> {
    for (const ref of this.#keyRefSet.liveReferences()) {
      yield [ref.deref() as K, this.#internalMap.get(ref) as V]
    }
  }

  public readonly [Symbol.toStringTag] = "WeakRefMap";
}
