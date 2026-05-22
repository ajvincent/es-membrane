export type propertyKey = string | symbol;

export default class PropertyKeySorter
{
  readonly #symbolMap = new Map<symbol, number>;

  addSymbol(key: symbol) : void
  {
    this.#symbolMap.getOrInsertComputed(key, this.#currentSize);
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

    const sA = this.#symbolMap.getOrInsertComputed(a as symbol, this.#currentSize),
          sB = this.#symbolMap.getOrInsertComputed(b as symbol, this.#currentSize);

    return sA - sB;
  }
}
