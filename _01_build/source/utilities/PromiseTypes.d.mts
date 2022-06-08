export declare type PromiseResolver<T> = (value: T | PromiseLike<T>) => unknown;
export declare type PromiseRejecter = (reason?: unknown) => unknown;
export declare class Deferred<T> {
    resolve: PromiseResolver<T>;
    reject: PromiseRejecter;
    promise: Promise<T>;
    constructor();
}
export declare class TimeoutPromise<T> extends Deferred<T> {
    constructor(limit?: number);
}
export declare class SingletonPromise<T> {
    #private;
    constructor(thenable: () => Promise<T>);
    run(): Promise<T>;
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
export declare function PromiseAllSequence<E, V>(elementArray: E[], callback: (value: E) => Promise<V>): Promise<V[]>;
/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.map}
 */
export declare function PromiseAllParallel<E, V>(elementArray: E[], callback: (value: E) => Promise<V>): Promise<V[]>;
