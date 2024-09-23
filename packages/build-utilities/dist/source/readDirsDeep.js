import fs from "node:fs/promises";
import path from "node:path";
/**
 * Search recursively for directories and files, optionally filtering the directories.
 *
 * @param root   - The root directory to walk.
 * @param filter - A callback for subdirectories:  returns false if we should not walk its contents.
 * @returns The results of the search.
 */
export async function readDirsDeep(root, filter = (() => true)) {
    const dirs = [path.normalize(root)], files = [];
    for (const currentDir of dirs) {
        const entries = await fs.readdir(currentDir, { encoding: "utf-8", withFileTypes: true });
        entries.forEach(entry => {
            if (entry.isFile()) {
                files.push(path.join(currentDir, entry.name));
            }
            else if (entry.isDirectory()) {
                const fullPath = path.join(currentDir, entry.name);
                if (filter(fullPath))
                    dirs.push(fullPath);
            }
        });
    }
    dirs.sort();
    files.sort();
    return { dirs, files };
}
