import {
  setTimeout,
} from "timers/promises";

export type PromiseResolver<T> = (value: T | PromiseLike<T>) => unknown;
export type PromiseRejecter = (reason?: unknown) => unknown;

/*
TypeScript apparently doesn't recognize arrow functions in constructors.
  this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
  });
*/
export class Deferred<T>
{
  resolve: PromiseResolver<T>;
  reject: PromiseRejecter;
  promise: Promise<T>;

  constructor()
  {
    this.resolve = (value): void => {
      void(value);
    };
    this.reject = (reason): void => {
      throw reason;
    }
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

export async function TimeoutPromise(delay = 5000) : Promise<never>
{
  await setTimeout(delay);
  throw new Error("Time limit expired");
}

export class SingletonPromise<T> {
  #resolve: PromiseResolver<void>;

  readonly promise: Promise<T>;

  constructor(
    thenable: () => Promise<T>
  )
  {
    this.#resolve = (value): void => {
      void(value);
    };
    this.promise = (new Promise(res => this.#resolve = res)).then(thenable);
  }

  async run() : Promise<T>
  {
    this.#resolve();
    return await this.promise;
  }
}

/**
 * Evaluate a callback asynchronously for every element of an array, sequentially.
 *
 * @param elementArray - The array of objects to pass into the callback.
 * @param callback     - The callback function.
 * @returns Resolved if the sequence passes.
 * @see Promise.all
 * @see Array.prototype.reduce
 */
export async function PromiseAllSequence<E, V>(
  elementArray: readonly E[],
  callback: (value: E) => Promise<V>
) : Promise<V[]>
{
  return await elementArray.reduce(async (previousPromise: Promise<V[]>, element: E) => {
    const items = await previousPromise;
    items.push(await callback(element));
    return items;
  }, Promise.resolve([]));
}

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
