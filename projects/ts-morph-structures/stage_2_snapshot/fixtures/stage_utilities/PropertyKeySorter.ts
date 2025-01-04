export type propertyKey = string | symbol;

import { DefaultMap } from "./DefaultMap.js";

export default class PropertyKeySorter
{
  readonly #symbolMap = new DefaultMap<symbol, number>;

  addSymbol(key: symbol) : void
  {
    this.#symbolMap.getDefault(key, this.#currentSize);
  }

  #currentSize: () => number = () => this.#symbolMap.size + 1;

  sort(keys: propertyKey[]) : void
  {
    keys.forEach(key => {
      if (typeof key === "symbol")
        this.addSymbol(key);
    });

    keys.sort(this.#compare);
  }

  #compare = (
    a: propertyKey,
    b: propertyKey
  ) : number =>
  {
    const tA = typeof a as "string" | "symbol",
          tB = typeof b as "string" | "symbol";
    if (tA === "string")
    {
      if (tB === "string")
      {
        if ((a as string) < (b as string))
          return -1;
        if ((a as string) > (b as string))
          return +1;

        return 0;
      }

      return -1;
    }

    if (tB === "string")
      return +1;

    const sA = this.#symbolMap.getDefault(a as symbol, this.#currentSize),
          sB = this.#symbolMap.getDefault(b as symbol, this.#currentSize);

    return sA - sB;
  }
}
