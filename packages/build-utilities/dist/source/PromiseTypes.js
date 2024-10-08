import { setTimeout, } from "node:timers/promises";
/*
TypeScript apparently doesn't recognize arrow functions in constructors.
  this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
  });
*/
export class Deferred {
    resolve;
    reject;
    promise;
    constructor() {
        this.resolve = (value) => {
            void (value);
        };
        this.reject = (reason) => {
            throw reason;
        };
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
export async function TimeoutPromise(delay = 5000) {
    await setTimeout(delay);
    throw new Error("Time limit expired");
}
export class SingletonPromise {
    #resolve;
    promise;
    constructor(thenable) {
        this.#resolve = (value) => {
            void (value);
        };
        this.promise = (new Promise(res => this.#resolve = res)).then(thenable);
    }
    async run() {
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
export async function PromiseAllSequence(elementArray, callback) {
    return await elementArray.reduce(async (previousPromise, element) => {
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
export async function PromiseAllParallel(elementArray, callback) {
    return Promise.all(elementArray.map(element => callback(element)));
}
