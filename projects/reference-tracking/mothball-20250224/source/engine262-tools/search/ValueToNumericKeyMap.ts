import {
  GuestEngine,
} from "../GuestEngine.js";

export class ValueToNumericKeyMap<ValueType extends GuestEngine.ObjectValue | GuestEngine.SymbolValue> {
  readonly #counter: Iterator<number>;

  readonly #valueToNumberMap = new WeakMap<ValueType, number>;
  readonly #numberToValueMap = new Map<number, ValueType>;

  constructor(counter: Iterator<number>) {
    this.#counter = counter;
  }

  hasHeldObject(
    value: ValueType
  ): boolean {
    return this.#valueToNumberMap.has(value);
  }

  getKeyForHeldObject(
    value: ValueType
  ): number
  {
    if (!this.#valueToNumberMap.has(value)) {
      const nextNumber = this.#counter.next().value;
      this.#valueToNumberMap.set(value, nextNumber);
      this.#numberToValueMap.set(nextNumber, value);
    }
    return this.#valueToNumberMap.get(value)!;
  }

  getHeldObjectForKey(
    key: number
  ): ValueType
  {
    const value: ValueType | undefined = this.#numberToValueMap.get(key);
    GuestEngine.Assert(value !== undefined);
    return value;
  }
}
