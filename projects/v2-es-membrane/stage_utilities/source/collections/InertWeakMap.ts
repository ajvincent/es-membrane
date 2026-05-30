/**
 * This serves two purposes:
 * 1. For revoked WeakMaps inside WeakStrongMap
 * 2. As a canary for when WeakMap interfaces change.
 */
export class InertWeakMap<K extends WeakKey, V> implements WeakMap<K, V> {
  delete(key: K): boolean {
    void key;
    return false;
  }
  get(key: K): V | undefined {
    void key;
    return undefined;
  }
  has(key: K): boolean {
    void key;
    return false;
  }
  set(key: K, value: V): this {
    void key;
    void value;
    return this;
  }
  getOrInsert(key: K, defaultValue: V): V {
    void key;
    void defaultValue;
    throw new Error("Method not implemented.");
  }
  getOrInsertComputed(key: K, callback: (key: K) => V): V {
    void key;
    void callback;
    throw new Error("Method not implemented.");
  }
  readonly [Symbol.toStringTag]: string = "InertWeakMap";
}
