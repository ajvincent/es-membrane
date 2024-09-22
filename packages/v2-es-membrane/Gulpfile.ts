import fs from "fs/promises";
import path from "path";
import {
  fileURLToPath,
} from "url"

import {
  series
} from "gulp";

import PushAndPopDirSeries from "./gulp-utilities/PushAndPopDirs.js"
import InvokeTSC from "#gulp-utilities/InvokeTSC.js";

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
dirs.unshift("build-utilities");

const dependencies = series(dirs.map(d => {
  const callback = PushAndPopDirSeries(d, [InvokeTSC]);
  callback.displayName = d;
  return callback;
}));
export default dependencies;
