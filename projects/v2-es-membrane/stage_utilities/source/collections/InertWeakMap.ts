/**
 * This serves two purposes:
 * 1. For revoked WeakMaps inside WeakStrongMap
 * 2. As a canary for when WeakMap interfaces change.
 */
export class InertWeakMap<K extends WeakKey, V> implements WeakMap<K, V> {
  delete(key: K): boolean {
    return false;
  }
  get(key: K): V | undefined {
    return undefined;
  }
  has(key: K): boolean {
    return false;
  }
  set(key: K, value: V): this {
    return this;
  }
  getOrInsert(key: K, defaultValue: V): V {
    throw new Error("Method not implemented.");
  }
  getOrInsertComputed(key: K, callback: (key: K) => V): V {
    throw new Error("Method not implemented.");
  }
  readonly [Symbol.toStringTag]: string = "InertWeakMap";
}
