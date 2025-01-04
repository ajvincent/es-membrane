import crypto from "crypto";
import fs from "fs/promises";

import readDirsDeep from "./readDirsDeep.js";
import { PromiseAllParallel } from "./PromiseTypes.js";

/* Why does this file exist?
   https://en.wikipedia.org/wiki/Bootstrapping_(compilers)

   We bootstrap our code in three stages as the Wikipedia page describes.

   If the bootstrap produces identical hashes in stages 2 and 3, then the
   test passes.

   This is like mathematical induction, proving f(k) = f(1) for k >= 1.
   f(1) builds stage 2, and f(2) builds stage 3.  If f(2) === f(1), we have
   our proof.

   Overkill?  Maybe.  The hashing is fast, though.
*/

/**
 * Get the list of files to hash for bootstrapping comparisons.
 *
 * @param root - The directory to hash.
 * @returns The file list
 */
export async function getHashFileList(
  root: string
): Promise<string[]>
{
  return (await readDirsDeep(root)).files;
}

/**
 * Generate a checksum for all files in a build directory.
 *
 * @param root - Absolute path to the directory.
 * @param verbose - True if we should return hashes for each file.
 * @returns The hash of all non-ignored contents.
 */
export async function hashAllFiles(
  root: string,
  verbose: boolean
): Promise<string>
{
  const allFiles = await getHashFileList(root);
  const fileHashes = await PromiseAllParallel(
    allFiles, async file => hashOneFile(root, file)
  );
  const contents = fileHashes.join("\n");

  if (verbose) {
    return contents;
  }

  const hash = crypto.createHash('sha512');
  hash.update(contents);
  return hash.digest('hex');
}

export async function hashOneFile(
  root: string,
  file: string,
): Promise<string>
{
  const contents = await fs.readFile(file, "utf-8");
  const hash = crypto.createHash('sha512');
  hash.update(contents);

  return hash.digest('hex') + " " + file.replace(root, "");
}
