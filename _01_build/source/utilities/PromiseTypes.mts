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

export class TimeoutPromise<T> extends Deferred<T>
{
  constructor(limit = 5000)
  {
    super();
    setTimeout(() => this.reject("Time limit expired"), limit);
  }
}

export class SingletonPromise<T> {
  #resolve: PromiseResolver<void>;
  #promise;
  constructor(thenable: () => Promise<T>) {
    this.#resolve = (value): void => {
      void(value);
    };
    this.#promise = (new Promise(res => this.#resolve = res)).then(thenable);
  }

  async run() : Promise<T>
  {
    this.#resolve();
    return await this.#promise;
  }
}

/**
 * Evaluate a callback asynchronously for every element of an array, sequentially.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.reduce}
 */
export async function PromiseAllSequence<E, V>(
  elementArray: E[],
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
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.map}
 */
export async function PromiseAllParallel<E, V>(
  elementArray: E[],
  callback: (value: E) => Promise<V>
) : Promise<V[]>
{
  return Promise.all(elementArray.map(element => callback(element)));
}
