import {
  fork
} from "node:child_process";
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

import {
  InvokeTSC_excludeDirs,
} from "@ajvincent/build-utilities";

const projectRoot: string = path.normalize(path.dirname(
  fileURLToPath(import.meta.url)
));

const monoRepoRoot: string = path.dirname(path.dirname(projectRoot));
const pathToGulp: string = path.join(monoRepoRoot, "node_modules/gulp/bin/gulp.js");

async function runChildGulpfile(): Promise<void> {
  const child = fork(pathToGulp, [], {
    cwd: cwd(),
    stdio: ["ignore", "inherit", "inherit", "ipc"]
  });

  const p = new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (code)
        reject(code);
      else
        resolve();
    });
  });

  try {
    await p;
  }
  catch (code) {
    throw new Error(`Failed on "${pathToGulp}" with code ${code}`);
  }
}

async function invokeChildGulpFile(
  localPathToDir: string
): Promise<void>
{
  //const Gulpfile_JS = path.join(projectRoot, localPathToDir, "Gulpfile.js");
  let targetDir: string = "";

  let previousDir: string;
  function pushd(): Promise<void> {
    console.log(`pushd(${localPathToDir})`);
    previousDir = cwd();
    targetDir = path.normalize(path.join(previousDir, localPathToDir));
    chdir(targetDir);
    return Promise.resolve();
  }

  function popd(): Promise<void> {
    console.log(`popd(${localPathToDir})`);
    chdir(previousDir);
    return Promise.resolve();
  }

  await pushd();
  try {
    await InvokeTSC_excludeDirs(projectRoot);
    await runChildGulpfile();
  }
  finally {
    await popd();
  }
}

function namedChildGulpFile(
  localPathToDir: string
): ReturnType<typeof series>
{
  const callback = () => invokeChildGulpFile(localPathToDir);
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
