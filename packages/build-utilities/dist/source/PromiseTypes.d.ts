export type PromiseResolver<T> = (value: T | PromiseLike<T>) => unknown;
export type PromiseRejecter = (reason?: unknown) => unknown;
export declare class Deferred<T> {
    resolve: PromiseResolver<T>;
    reject: PromiseRejecter;
    promise: Promise<T>;
    constructor();
}
export declare function TimeoutPromise(delay?: number): Promise<never>;
export declare class SingletonPromise<T> {
    #private;
    readonly promise: Promise<T>;
    constructor(thenable: () => Promise<T>);
    run(): Promise<T>;
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
export declare function PromiseAllSequence<E, V>(elementArray: readonly E[], callback: (value: E) => Promise<V>): Promise<V[]>;
/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param elementArray - The array of objects to pass into the callback.
 * @param callback     - The callback function.
 * @returns Resolved if the sequence passes.
 * @see Promise.all
 * @see Array.prototype.map
 */
export declare function PromiseAllParallel<E, V>(elementArray: readonly E[], callback: (value: E) => Promise<V>): Promise<V[]>;
