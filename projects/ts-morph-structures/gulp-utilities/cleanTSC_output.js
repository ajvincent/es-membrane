import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const projectRoot = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

const dirEntries = await fs.readdir(
  projectRoot,
  {
    encoding: "utf-8",
    withFileTypes: true,
    recursive: false,
  }
);
const recursiveDirs = dirEntries.filter(dirEnt => dirEnt.isDirectory())
    .map(dirEnt => dirEnt.name)
    .filter(dirName => /^stage_\d+_/.test(dirName));
recursiveDirs.sort();
recursiveDirs.unshift("gulp-utilities", "utilities", "use-cases");

const TS_MODULE_EXT_RE = /(?<!\.d)\.ts$/;

const dirFilePromises = recursiveDirs.map(async recursiveDir => {
  const dirPath = path.join(projectRoot, recursiveDir);
  const descendants = await fs.readdir(dirPath, { "encoding": "utf-8", "recursive": true });
  return descendants.map(d => path.join(projectRoot, recursiveDir, d));
});
dirFilePromises.unshift(
  Promise.resolve(
    dirEntries.filter(dirEnt => dirEnt.isFile()).map(dirEnt => path.join(projectRoot, dirEnt.name))
  )
);

const allTSFiles = (await Promise.all(dirFilePromises)).flat().filter(f => TS_MODULE_EXT_RE.test(f));
const allCompiledFiles = allTSFiles.map(tsFile => [
  tsFile.replace(/\.ts$/, ".js"),
  tsFile.replace(/\.ts$/, ".d.ts"),
  tsFile.replace(/\.ts$/, ".js.map")
]).flat();
allCompiledFiles.sort();

await Promise.all(allCompiledFiles.map(cf => fs.rm(cf, { force: true })));
