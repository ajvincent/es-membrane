import {
  fork
} from "node:child_process";

import path from "node:path";

import {
  monorepoRoot,
  projectRoot,
} from "./internal/constants.js";

import {
  series
} from "gulp";

import {
  clean
} from "./clean.js"

const TSC = path.resolve(monorepoRoot, "node_modules/typescript/bin/tsc");

async function invokeTSC() {
  const child = fork(TSC, [], {
    cwd: projectRoot,
    stdio: ["ignore", "inherit", "inherit", "ipc"]
  });

  const p = new Promise((resolve, reject) => {
      child.on("exit", (code) => {
          code ? reject(code) : resolve(code);
      });
  });

  try {
    await p;
  }
  catch (code) {
    throw new Error(`Failed on "${TSC}" with code ${code}`);
  }
}

export default series(clean, invokeTSC);
