/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param elementArray - The array of objects to pass into the callback.
 * @param callback     - The callback function.
 * @returns Resolved if the sequence passes.
 * @see Promise.all
 * @see Array.prototype.map
 */
export async function PromiseAllParallel<E, V>(
  elementArray: readonly E[],
  callback: (value: E) => Promise<V>
) : Promise<V[]>
{
  return Promise.all(elementArray.map(element => callback(element)));
}
