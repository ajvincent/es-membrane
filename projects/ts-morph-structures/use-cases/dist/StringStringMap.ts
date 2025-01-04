interface StringStringKey {
  readonly firstKey: string,
  readonly secondKey: string
}

export default class StringStringMap<V> {
    readonly [Symbol.toStringTag]: string = "StringStringMap";
    readonly #hashMap = new Map<string, V>;

    constructor(entries: [string, string, V][] = []) {
        entries.forEach(([firstKey, secondKey, value]) => this.set(firstKey, secondKey, value));
    }

    /** @returns the number of elements in the Map. */
    get size(): number {
        return this.#hashMap.size;
    }

    static #hashKeys(firstKey: string, secondKey: string): string {
        return JSON.stringify({firstKey, secondKey});
    }

    static #parseKeys(hashedKey: string): [string, string] {
        const { firstKey, secondKey } = JSON.parse(hashedKey) as StringStringKey;
        return [firstKey, secondKey];
    }

    clear(): void {
        return this.#hashMap.clear();
    }

    /** @returns true if an element in the Map existed and has been removed, or false if the element does not exist. */
    delete(firstKey: string, secondKey: string): boolean {
        const key = StringStringMap.#hashKeys(firstKey, secondKey);
        const rv = this.#hashMap.delete(key);
        return rv;
    }

    /**
     * Executes a provided function once per each key/value pair in the Map, in insertion order.
     */
    forEach(callbackfn: (value: V, firstKey: string, secondKey: string, map: StringStringMap<V>) => void, thisArg?: any): void {
        this.#hashMap.forEach((value, key): void => {
                  const [ firstKey, secondKey ] = StringStringMap.#parseKeys(key);
                  callbackfn.call(thisArg, value, firstKey, secondKey, this);
                }, thisArg);
    }

    /**
     * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
     * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
     */
    get(firstKey: string, secondKey: string): V | undefined {
        const key = StringStringMap.#hashKeys(firstKey, secondKey);
        const rv = this.#hashMap.get(key);
        return rv;
    }

    /** @returns boolean indicating whether an element with the specified key exists or not. */
    has(firstKey: string, secondKey: string): boolean {
        const key = StringStringMap.#hashKeys(firstKey, secondKey);
        const rv = this.#hashMap.has(key);
        return rv;
    }

    /**
     * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
     */
    set(firstKey: string, secondKey: string, value: V): this {
        const key = StringStringMap.#hashKeys(firstKey, secondKey);
        this.#hashMap.set(key, value);
        return this;
    }

    /** Returns an iterable of entries in the map. */
    *[Symbol.iterator](): MapIterator<[string, string, V]> {
        for (const x of this.#hashMap[Symbol.iterator]()) {
                  const [ firstKey, secondKey ] = StringStringMap.#parseKeys(x[0]);
                  yield [firstKey, secondKey, x[1]];
                }
    }

    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    entries(): MapIterator<[string, string, V]> {
        return this[Symbol.iterator]();
    }

    /**
     * Returns an iterable of keys in the map
     */
    *keys(): MapIterator<[string, string]> {
        for (const x of this.#hashMap.keys()) {
                  const [ firstKey, secondKey ] = StringStringMap.#parseKeys(x[0]);
                  yield [firstKey, secondKey];
                }
    }

    /**
     * Returns an iterable of values in the map
     */
    values(): MapIterator<V> {
        return this.#hashMap.values()
    }
}
