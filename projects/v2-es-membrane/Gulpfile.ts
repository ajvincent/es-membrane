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

// Remember to update gulp-utilities/cleanTSC_output.js when you change this.
const dirs: readonly string[] = [
  "ecma_references",
  "stage_utilities",
  "code_generation",
  "objectgraph_handlers",
  "membranes_decorated",
  "exported_decorators",
];

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
