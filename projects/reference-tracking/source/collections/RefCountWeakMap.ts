import {
  DefaultWeakMap
} from "./DefaultMap.js";

export default
class RefCountWeakMap<K extends WeakKey, V> extends DefaultWeakMap<K, V>
{
  #size = 0;
  #isEmptyCallback?: () => void;

  readonly #finalizer = new FinalizationRegistry(() => this.#decrement());

  #decrement(): void {
    this.#size--;

    if (this.#size === 0 && this.#isEmptyCallback) {
      const callback: () => void = this.#isEmptyCallback;
      this.#isEmptyCallback = undefined;
      callback();
    }
  }

  //#region existing function overrides
  public delete(
    key: K
  ): boolean
  {
    const didDelete = super.delete(key);
    if (didDelete) {
      this.#finalizer.unregister(key);
      this.#decrement();
    }
    return didDelete;
  }

  public set(
    key: K, value: V
  ): this
  {
    if (this.has(key) === false) {
      this.#size++;
      this.#finalizer.register(key, undefined, key);
    }
    return super.set(key, value);
  }
  //#endregion existing function overrides

  /**
   * Assign a function to call for when this map becomes empty.
   * @param callback the function to call, or undefined to clear the callback.
   */
  public assignEmptyCallback(
    callback: (() => void) | undefined
  ): void
  {
    this.#isEmptyCallback = callback;
  }

  /** The number of elements in the map. */
  public get size(): number {
    return this.#size;
  }
}
