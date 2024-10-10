import { type PromiseResolver } from "./PromiseTypes.js";
export interface TemporaryDirWithPromise {
    tempDir: string;
    resolve: PromiseResolver<void>;
    promise: Promise<void>;
}
/**
 * Create a temporary directory with a promise to clean it up later.
 *
 * @returns The directory and promise.
 */
export declare function tempDirWithCleanup(): Promise<TemporaryDirWithPromise>;
