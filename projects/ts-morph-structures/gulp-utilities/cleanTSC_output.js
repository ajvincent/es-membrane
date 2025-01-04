import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  cleanTSC_Output,
} from "@ajvincent/build-utilities";

const projectRoot = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

const dirEntries = await fs.readdir(
  projectRoot,
  {
    encoding: "utf-8",
    withFileTypes: true,
    recursive: false,
  }
);
const topDirs = dirEntries.filter(dirEnt => dirEnt.isDirectory())
    .map(dirEnt => dirEnt.name)
    .filter(dirName => /^stage_\d+_/.test(dirName))
    .sort();
topDirs.push("gulp-utilities", "utilities", "use-cases");

await cleanTSC_Output(projectRoot, topDirs);
