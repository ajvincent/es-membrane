import * as GuestEngine from "@engine262/engine262";

import {
  DefaultWeakMap
} from "../../collections/DefaultMap.js";

export class ValueToNumericKeyMap {
  #counter = 0;
  readonly #valueToNumberMap = new DefaultWeakMap<GuestEngine.ObjectValue, number>;
  readonly #valuesArray: (GuestEngine.ObjectValue)[] = [];

  readonly #increment = () => this.#counter++;

  getKeyForHeldObject(
    value: GuestEngine.ObjectValue
  ): number
  {
    if (!this.#valueToNumberMap.has(value))
      this.#valuesArray.push(value);
    return this.#valueToNumberMap.getDefault(value, this.#increment);
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
