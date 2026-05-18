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

const topDirs = [
  "ecma_references",
  "stage_utilities",
  "code_generation",
  "objectgraph_handlers",
  "mirror_membranes",
  "exported_decorators",
  "gulp-utilities",
];

await cleanTSC_Output(projectRoot, topDirs);
