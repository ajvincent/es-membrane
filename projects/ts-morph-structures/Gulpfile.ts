import path from "node:path";
import {
  chdir,
  cwd,
} from "node:process";
import {
  fileURLToPath,
} from "node:url"

import {
  series
} from "gulp";

import { InvokeTSC_main /*, InvokeTSC_prebuild */ } from "#gulp-utilities/InvokeTSC.js";

const projectRoot: string = path.normalize(path.dirname(
  fileURLToPath(import.meta.url)
));

type VoidCallbackArray = (() => Promise<void>)[];

async function childGulpfile(
  localPathToDir: string
): Promise<void>
{
  const fullPathToDir = path.join(projectRoot, localPathToDir);

  let stackDir: string;
  function pushd(): Promise<void> {
    stackDir = cwd();
    chdir(path.normalize(path.join(stackDir, localPathToDir)));
    return Promise.resolve();
  }
  pushd.displayName = `pushd(${localPathToDir})`;

  function popd(): Promise<void> {
    chdir(stackDir);
    return Promise.resolve();
  }
  popd.displayName = `popd(${localPathToDir})`;

  await pushd();
  try {
    await InvokeTSC_main();
    const importCallbacks = (await import(path.join(fullPathToDir, "Gulpfile.js"))).default as VoidCallbackArray;
    for (const callback of importCallbacks) {
      await callback();
    }
  }
  finally {
    await popd();
  }
}

function namedChildGulpFile(
  localPathToDir: string
): ReturnType<typeof series>
{
  const callback = () => childGulpfile(localPathToDir);
  callback.displayName = localPathToDir;
  return callback;
}

export const stage_one = series([
  namedChildGulpFile("utilities"),
  namedChildGulpFile("stage_0_references"),
  namedChildGulpFile("stage_1_snapshot"),
]);

export const stage_two = series([
  namedChildGulpFile("stage_2_generation"),
  namedChildGulpFile("stage_2_integration/pre-build"),
  namedChildGulpFile("stage_2_integration"),
  namedChildGulpFile("stage_2_snapshot/pre-build"),
  namedChildGulpFile("stage_2_snapshot"),
]);

export const stage_three = series([
  namedChildGulpFile("stage_3_generation"),
  namedChildGulpFile("stage_3_integration/pre-build"),
  namedChildGulpFile("stage_3_integration"),
  namedChildGulpFile("stage_3_snapshot/pre-build"),
  namedChildGulpFile("stage_3_snapshot"),
]);

export const use_cases = namedChildGulpFile("use-cases");

export default series([
  stage_one,
  stage_two,
  stage_three,
  use_cases
]);
