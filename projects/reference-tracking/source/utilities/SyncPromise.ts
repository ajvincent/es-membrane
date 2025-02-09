export type SyncPromiseResolver<T> = (
  this: void,
  value: T
) => void;

export interface SyncPromiseWithResolvers<T> {
  promise: SyncPromise<T>;
  resolve: SyncPromiseResolver<T>,
}

/**
 * This is a quick & dirty, incomplete implementation of a synchronous promise API.
 * I'm not even trying to implement a full promise-like API.
 */
export default class SyncPromise<T>
{
  public static all<T>(
    promises: readonly SyncPromise<T>[]
  ): SyncPromise<T[]>
  {
    return new SyncPromise<T[]>((resolve) => {
      let countdown = promises.length;

      const promiseSet = new Map<number, T>;
      function resolveFromSet(): void {
        const resultArray: T[] = [];
        for (let index = 0; index < promiseSet.size; index++) {
          resultArray.push(promiseSet.get(index)!);
        }
        resolve(resultArray);
      }

      promises.forEach((p, index) => {
        p.thenNoChain((result) => {
          countdown--;
          promiseSet.set(index, result);
          if (countdown === 0)
            resolveFromSet();
        });
      });
    });
  }

  public static withResolver<T>(): SyncPromiseWithResolvers<T> {
    let resolve: SyncPromiseResolver<T> = () => {
      return;
    };
    const promise = new SyncPromise<T>(res => {
      resolve = res;
    });

    return { promise, resolve };
  }

  #isResolved = false;
  #resolvedValue?: T;
  #thenCallbacks: SyncPromiseResolver<T>[] = [];

  public constructor(
    initCallback: (
      resolve: SyncPromiseResolver<T>
    ) => void
  )
  {
    initCallback(this.#resolve.bind(this));
  }

  #resolve(
    value: T
  ): void
  {
    if (this.#isResolved)
      return;

    this.#isResolved = true;
    this.#resolvedValue = value;

    for (const callback of this.#thenCallbacks) {
      try {
        callback(value);
      }
      catch (ex) {
        console.log(ex);
      }
    }

    this.#thenCallbacks = [];
  }

  public thenNoChain(resolveCallback: SyncPromiseResolver<T>): void {
    if (this.#isResolved) {
      resolveCallback(this.#resolvedValue!);
    } else {
      this.#thenCallbacks.push(resolveCallback);
    }
  }

  public get isResolved(): boolean {
    return this.#isResolved;
  }
}
