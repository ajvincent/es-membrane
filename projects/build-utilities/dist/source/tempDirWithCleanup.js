import fs from "fs/promises";
import path from "path";
import os from "os";
import { Deferred, } from "./PromiseTypes.js";
/**
 * Create a temporary directory with a promise to clean it up later.
 *
 * @returns The directory and promise.
 */
export async function tempDirWithCleanup() {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ts-morph-structures-"));
    const d = new Deferred;
    d.promise = d.promise.then(() => fs.rm(tempDir, { recursive: true }));
    return {
        tempDir,
        resolve: d.resolve,
        promise: d.promise,
    };
}
