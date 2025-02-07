import * as GuestEngine from "@engine262/engine262";

export class ValueToNumericKeyMap {
  #counter = 0;
  readonly #valueToNumberMap = new WeakMap<GuestEngine.ObjectValue, number>;
  readonly #valuesArray: (GuestEngine.ObjectValue)[] = [];

  getKeyForHeldObject(
    value: GuestEngine.ObjectValue
  ): number
  {
    if (!this.#valueToNumberMap.has(value)) {
      this.#valuesArray.push(value);
      this.#valueToNumberMap.set(value, this.#counter++);
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
