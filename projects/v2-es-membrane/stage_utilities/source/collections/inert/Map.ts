/** This is mostly a canary for changes to the Map interface. */
export class InertMap<K, V> implements Map<K, V> {
  clear(): void {
  }
  delete(key: K): boolean {
    void key;
    return false;
  }
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {
    void callbackfn;
    void thisArg;
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
  readonly size: number = 0;

  * entries(): MapIterator<[K, V]> {
    // do nothing
  }
  * keys(): MapIterator<K> {
    // do nothing
  }
  * values(): MapIterator<V> {
    // do nothing
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

  * [Symbol.iterator](): MapIterator<[K, V]> {
    // do nothing
  }
  readonly [Symbol.toStringTag]: string = "InertMap";
}