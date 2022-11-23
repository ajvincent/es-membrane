import fs from "fs/promises";
import path from "path";
import os from "os";
import { Deferred } from "./PromiseTypes.mjs";
export class TemporaryDirWithPromise {
    tempDir = "";
    resolve;
    promise;
    constructor() {
        const { resolve, promise } = new Deferred;
        this.resolve = resolve;
        this.promise = promise;
    }
}
void (TemporaryDirWithPromise);
/**
 * Create a temporary directory with a promise to clean it up later.
 *
 * @returns The directory and promise.
 */
export default async function tempDirWithCleanup() {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "es-membrane-"));
    const d = new Deferred;
    d.promise = d.promise.then(() => fs.rm(tempDir, { recursive: true }));
    return {
        tempDir,
        resolve: d.resolve,
        promise: d.promise,
    };
}
//# sourceMappingURL=tempDirWithCleanup.mjs.map