import path from "node:path";

import {
  chdir,
  cwd
} from 'node:process';

import { fork } from 'node:child_process';

import {
  monorepoRoot
} from "@ajvincent/build-utilities";


import {
  projectDir,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import type {
  PromiseRejecter,
  PromiseResolver,
} from "#utilities/source/PromiseTypes.js";

import {
  stageDir,
} from "../../pre-build/constants.js";

export default
async function runAPIDocumenter(): Promise<void>
{
  const popDir: string = cwd();
  try {
    chdir(projectDir);

    let resolve: PromiseResolver<void>, reject: PromiseRejecter;
    const apiPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // cwd is important for ts-node/tsimp hooks to run.
    const apiDocumenter = fork(
      path.join(monorepoRoot, "node_modules/@microsoft/api-documenter/bin/api-documenter"),
      [
        "markdown",

        "--input-folder",
        pathToModule(stageDir, "typings-snapshot/extracted"),

        "--output-folder",
        path.join(monorepoRoot, "docs/ts-morph-structures/api")
      ],
      {
        cwd: projectDir,
        // this ensures you can see TypeScript error messages
        stdio: ["ignore", "inherit", "inherit", "ipc"]
      }
    );
    apiDocumenter.on("exit", code => code ? reject(code) : resolve());
    await apiPromise;
  }
  finally {
    chdir(popDir);
  }
}
