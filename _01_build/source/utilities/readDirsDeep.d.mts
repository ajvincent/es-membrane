declare type DirsAndFiles = {
    dirs: string[];
    files: string[];
};
/**
 * Search recursively for directories and files, optionally filtering the directories.
 *
 * @param {string}            root   The root directory to walk.
 * @param {Function<string>?} filter A callback for subdirectories:  returns true if we should not walk its contents.
 * @returns {Promise<{dirs: string[]; files: string[]}>} The results of the search.
 */
export default function readDirsDeep(root: string, filter?: ((value: string) => boolean)): Promise<DirsAndFiles>;
export {};
