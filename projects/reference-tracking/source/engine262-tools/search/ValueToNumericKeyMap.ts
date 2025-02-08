import {
  GuestEngine,
} from "../GuestEngine.js";

export class ValueToNumericKeyMap {
  readonly #valueToNumberMap = new WeakMap<GuestEngine.ObjectValue, number>;
  readonly #valuesArray: GuestEngine.ObjectValue[] = [];

  hasHeldObject(
    value: GuestEngine.ObjectValue
  ): boolean {
    return this.#valueToNumberMap.has(value);
  }

  getKeyForHeldObject(
    value: GuestEngine.ObjectValue
  ): number
  {
    if (!this.#valueToNumberMap.has(value)) {
      this.#valueToNumberMap.set(value, this.#valuesArray.length);
      this.#valuesArray.push(value);
    }
    return this.#valueToNumberMap.get(value)!;
  }

  getHeldObjectForKey(
    key: number
  ): GuestEngine.ObjectValue
  {
    const value: GuestEngine.ObjectValue | undefined = this.#valuesArray[key];
    GuestEngine.Assert(value !== undefined);
    return value;
  }
}
