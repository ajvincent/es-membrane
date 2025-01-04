import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  series
} from "gulp";

import {
  recursiveGulp,
} from "@ajvincent/build-utilities";

const projectRoot = path.normalize(path.dirname(
  fileURLToPath(import.meta.url)
));

const monorepoRoot = path.normalize(path.join(projectRoot, "../.."));
console.log(monorepoRoot);

const dirEntries = await fs.readdir(projectRoot, { encoding: "utf-8", withFileTypes: true });
const dirs = dirEntries.filter(dirEnt => dirEnt.isDirectory())
  .map(dirEnt => dirEnt.name)
  .filter(dirName => /^\_\d+\_/.test(dirName));
dirs.sort();

async function buildDirectory(
  this: void,
  dir: string
): Promise<ReturnType<typeof series>[]>
{
  const descendantDirs: string[] = [dir];
  try {
    const prebuildStat = await fs.stat(path.join(projectRoot, dir, "pre-build"));
    if (prebuildStat?.isDirectory()) {
      descendantDirs.unshift(dir + "/pre-build");
    }
  }
  catch {
    // do nothing
  }

  return descendantDirs.map(d => recursiveGulp(projectRoot, d));
}

const tasks: ReturnType<typeof series>[] = (await Promise.all(dirs.map(buildDirectory))).flat();
export default series(tasks);
