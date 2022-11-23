import fs from "fs/promises";
import path from "path";
import os from "os";

import { Deferred, PromiseResolver } from "./PromiseTypes.mjs";

export abstract class TemporaryDirWithPromise
{
  tempDir = "";
  resolve: PromiseResolver<unknown>;
  promise: Promise<unknown>
  constructor() {
    const { resolve, promise } = new Deferred;
    this.resolve = resolve;
    this.promise = promise;
  }
}
void(TemporaryDirWithPromise);

/**
 * Create a temporary directory with a promise to clean it up later.
 *
 * @returns The directory and promise.
 */
export default async function tempDirWithCleanup() : Promise<TemporaryDirWithPromise>
{
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "es-membrane-"));
  const d = new Deferred;
  d.promise = d.promise.then(() => fs.rm(tempDir, { recursive: true }));

  return {
    tempDir,
    resolve: d.resolve,
    promise: d.promise,
  };
}
