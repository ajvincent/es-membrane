import assert from "node:assert/strict";

export default
class SuffixMap<V> extends Map<string, V> {
  readonly #suffix: string;
  constructor(suffix: string) {
    super();
    this.#suffix = suffix;
  }

  #validateKey(key: string): void {
    assert(key.endsWith(this.#suffix), "key must end with " + this.#suffix);
  }

  delete(key: string): boolean {
    this.#validateKey(key);
    return super.delete(key);
  }

  get(key: string): V | undefined {
    this.#validateKey(key);
    return super.get(key);
  }

  has(key: string): boolean {
    this.#validateKey(key);
    return super.has(key);
  }

  set(key: string, value: V): this {
    this.#validateKey(key);
    return super.set(key, value);
  }
}
