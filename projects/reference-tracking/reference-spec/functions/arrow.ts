import "es-search-references-guest";

export type propertyKey = string | symbol;

class PropertyKeySorter
{
  readonly #symbolMap = new Map<symbol, number>;
  /*
  addSymbol(key: symbol) : void
  {
    if (!this.#symbolMap.has(key))
      this.#symbolMap.set(key, this.#symbolMap.size + 1);
  }

  sort(keys: propertyKey[]) : void
  {
    keys.forEach(key => {
      if (typeof key === "symbol")
        this.addSymbol(key);
    });

    keys.sort(this.compare);
  }
  */

  compare = (
    a: propertyKey,
    b: propertyKey
  ) : number =>
  {
    const tA = typeof a as "string" | "symbol",
          tB = typeof b as "string" | "symbol";
    if (tA === "string")
    {
      if (tB === "string")
        return tA.localeCompare(tB);

      return -1;
    }

    if (tB === "string")
      return +1;

    const sA = this.#symbolMap.get(a as symbol)!,
          sB = this.#symbolMap.get(b as symbol)!;

    return sA - sB;
  }
}

const sorter = new PropertyKeySorter;
searchReferences("this as part of an arrow function", sorter, [sorter.compare], true);
