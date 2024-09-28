import fs from "fs/promises";
import path from "path";
import {
  fileURLToPath,
} from "url"

import {
  series
} from "gulp";
import { InvokeTSC_main, InvokeTSC_prebuild } from "#gulp-utilities/InvokeTSC.js";
import { PushAndPopDirSeries } from "@ajvincent/build-utilities";

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

type VoidCallbackArray = (() => Promise<void>)[];

async function childGulpfile(
  localPathToDir: string
): Promise<ReturnType<typeof series>>
{
  const callbacks: VoidCallbackArray = [];
  const fullPathToDir = path.join(projectRoot, localPathToDir);

  const prebuildGulp = path.join(fullPathToDir, "pre-build", "Gulpfile.js");
  try {
    if (await fs.stat(prebuildGulp)) {
      let prebuildCallbacks = (await import(prebuildGulp)).default as VoidCallbackArray;
      if (prebuildCallbacks.length > 0)
      callbacks.push(InvokeTSC_prebuild, ...prebuildCallbacks);
    }
  }
  catch (ex) {
    // do nothing, this is normal
  }

  let importCallbacks = (await import(path.join(fullPathToDir, "Gulpfile.js"))).default as VoidCallbackArray;
  if (importCallbacks.length > 0) {
    callbacks.push(
      InvokeTSC_main,
      ...importCallbacks
    );
  }

  if (callbacks.length === 0) {
    let stageDir = () => Promise.resolve();
    Reflect.set(stageDir, "displayName", localPathToDir);
    return stageDir;
  }

  return PushAndPopDirSeries(localPathToDir, callbacks);
}

const tasks: ReturnType<typeof series>[] = [];

for (const d of dirs) {
  tasks.push(await childGulpfile(d));
}

const dependencies = series(tasks);
export default dependencies;
