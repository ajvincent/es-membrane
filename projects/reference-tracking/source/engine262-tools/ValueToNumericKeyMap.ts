import * as GuestEngine from "@engine262/engine262";

import {
  DefaultWeakMap
} from "../collections/DefaultMap.js";

export class ValueToNumericKeyMap {
  #counter = 0;
  readonly #map = new DefaultWeakMap<GuestEngine.ObjectValue | GuestEngine.SymbolValue, number>;

  readonly #increment = () => this.#counter++;

  getHeldObjectKey(
    value: GuestEngine.ObjectValue | GuestEngine.SymbolValue
  ): number
  {
    return this.#map.getDefault(value, this.#increment);
  }
}
