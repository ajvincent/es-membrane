import type {
  SyncTaskQueue
} from "./SyncTaskQueue.js";

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
    promises: readonly SyncPromise<T>[],
    taskQueue?: SyncTaskQueue
  ): SyncPromise<readonly T[]>
  {
    const initPromise = (
      resolve: SyncPromiseResolver<readonly T[]>
    ): void => this.#initPromiseAll(promises, resolve);

    return new SyncPromise<readonly T[]>(initPromise, taskQueue);
  }

  static #initPromiseAll<T>(
    promises: readonly SyncPromise<T>[],
    resolve: SyncPromiseResolver<readonly T[]>
  ): void
  {
    const allPromisesLength = promises.length;

    const promiseMap = new Map<number, T>;
    const resolveFromSet = () => this.#resolvePromiseAll(promiseMap, resolve);

    promises.forEach((p, index) => {
      p.thenNoChain((result) => {
        promiseMap.set(index, result);
        if (promiseMap.size === allPromisesLength)
          resolveFromSet();
      });
    });
  }

  static #resolvePromiseAll<T>(
    promiseMap: ReadonlyMap<number, T>,
    resolve: SyncPromiseResolver<readonly T[]>,
  ): void
  {
    const resultArray: T[] = [];
    for (let index = 0; index < promiseMap.size; index++) {
      resultArray.push(promiseMap.get(index)!);
    }
    resolve(resultArray);
  }

  public static withResolver<T>(
    taskQueue?: SyncTaskQueue
  ): SyncPromiseWithResolvers<T>
  {
    let resolve: SyncPromiseResolver<T>;
    const promise = new SyncPromise<T>(res => {
      resolve = res;
    }, taskQueue);

    //@ts-expect-error resolve is defined by the promise
    return { promise, resolve };
  }

  static #queueOrRunTask<T>(
    callback: SyncPromiseResolver<T>,
    value: T,
    taskQueue?: SyncTaskQueue
  ): void
  {
    if (taskQueue) {
      taskQueue.addTask(() => callback(value))
      return;
    }

    try {
      callback(value);
    }
    catch (ex) {
      console.log(ex);
    }
  }

  #isResolved = false;
  #resolvedValue?: T;
  #thenCallbacks: SyncPromiseResolver<T>[] = [];

  #taskQueue?: SyncTaskQueue;

  public constructor(
    initCallback: (
      resolve: SyncPromiseResolver<T>
    ) => void,
    taskQueue?: SyncTaskQueue
  )
  {
    initCallback(this.#resolve.bind(this));
    this.#taskQueue = taskQueue;
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
      SyncPromise.#queueOrRunTask<T>(callback, value, this.#taskQueue);
    }

    this.#thenCallbacks = [];
  }

  public thenNoChain(resolveCallback: SyncPromiseResolver<T>): void {
    if (this.#isResolved) {
      SyncPromise.#queueOrRunTask<T>(resolveCallback, this.#resolvedValue!, this.#taskQueue);
    } else {
      this.#thenCallbacks.push(resolveCallback);
    }
  }

  public get isResolved(): boolean {
    return this.#isResolved;
  }
}
