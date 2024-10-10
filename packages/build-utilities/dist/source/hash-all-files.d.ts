/**
 * Get the list of files to hash for bootstrapping comparisons.
 *
 * @param root - The directory to hash.
 * @returns The file list
 */
export declare function getHashFileList(root: string): Promise<readonly string[]>;
/**
 * Generate a checksum for all files in a build directory.
 *
 * @param root - Absolute path to the directory.
 * @param verbose - True if we should return hashes for each file.
 * @returns The hash of all non-ignored contents.
 */
export declare function hashAllFiles(root: string, verbose: boolean): Promise<string>;
export declare function hashOneFile(root: string, file: string): Promise<string>;
