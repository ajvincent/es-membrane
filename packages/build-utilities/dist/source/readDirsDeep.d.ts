interface DirsAndFiles {
    readonly dirs: readonly string[];
    readonly files: readonly string[];
}
/**
 * Search recursively for directories and files, optionally filtering the directories.
 *
 * @param root   - The root directory to walk.
 * @param filter - A callback for subdirectories:  returns false if we should not walk its contents.
 * @returns The results of the search.
 */
export declare function readDirsDeep(root: string, filter?: ((value: string) => boolean)): Promise<DirsAndFiles>;
export {};
