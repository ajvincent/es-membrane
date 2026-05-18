/**
 * When you have keys and promised values, this provides a resolve() method to resolve the values.
 *
 * @see {@link https://github.com/tc39/proposal-await-dictionary}
 */
export default
class AwaitedMap<K, V> extends Map<K, Promise<V>>
{
  async #settlePromises(): Promise<[K, PromiseSettledResult<Awaited<V>>][]>
  {
    const promisedEntries = Array.from(this.entries());
    const names = promisedEntries.map(e => e[0]),
          promises = promisedEntries.map(e => e[1]);

    const values = await Promise.allSettled(promises);
    return values.map((value, index) => [names[index], value]);
  }

  async allSettled() : Promise<Map<K, PromiseSettledResult<Awaited<V>>>>
  {
    const entries = await this.#settlePromises();
    return new Map(entries);
  }

  async allResolved() : Promise<Map<K, Awaited<V>>>
  {
    const entries = await this.#settlePromises();
    const rejectedEntries = entries.filter(entry => entry[1].status === "rejected") as [K, PromiseRejectedResult][];
    if (rejectedEntries.length)
      throw new AwaitedMapError(rejectedEntries);

    return new Map(entries.map(
      entry => [entry[0], (entry[1] as PromiseFulfilledResult<Awaited<V>>).value]
    ));
  }
}

export class AwaitedMapError<K> extends Error
{
  constructor(rejectedEntries: [K, PromiseRejectedResult][]) {
    super("AwaitedMap.resolve() failed");
    this.errorMap = new Map(rejectedEntries.map(entry => [entry[0], entry[1].reason]));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly errorMap: ReadonlyMap<K, any>;
}

export type ReadonlyAwaitedMap<K, V> =
  ReadonlyMap<K, Promise<V>> &
  Pick<AwaitedMap<K, V>, "allSettled" | "allResolved">
;
