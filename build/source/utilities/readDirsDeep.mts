import fs from "fs/promises";
import path from "path";

type DirsAndFiles = {
  dirs: string[];
  files: string[];
}

/**
 * Search recursively for directories and files, optionally filtering the directories.
 *
 * @param root   - The root directory to walk.
 * @param filter - A callback for subdirectories:  returns false if we should not walk its contents.
 * @returns The results of the search.
 */
export default async function readDirsDeep(
  root: string,
  filter: ((value: string) => boolean) = (() : boolean => true)
) : Promise<DirsAndFiles>
{
  const dirs = [path.normalize(root)], files: string[] = [];

  for (let i = 0; i < dirs.length; i++) {
    const currentDir = dirs[i];
    const entries = await fs.readdir(currentDir, { encoding: "utf-8", withFileTypes: true});

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
  return {dirs, files};
}
