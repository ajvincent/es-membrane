import { spawn } from 'child_process';
import fs from "fs/promises";
import path from "path";
import { cwd, chdir } from 'process';
import url from "url";

import {
  monorepoRoot
} from "@ajvincent/build-utilities";


const projectDir = path.normalize(path.join(url.fileURLToPath(import.meta.url), "../../../.."));
const sourceDir = path.join(projectDir, "stage_2_integration/snapshot");
const snapshotDir = path.join(projectDir, "stage_2_integration/typings-snapshot");

const tsconfigFile = path.join(
  url.fileURLToPath(import.meta.url), "../typings-tsconfig.json"
);
const tsconfigSourceFile = path.join(sourceDir, "typings-tsconfig.json");

export default
async function compileTypeDefinitions(): Promise<void>
{
  await fs.rm(snapshotDir, { force: true, recursive: true });
  await fs.mkdir(snapshotDir);

  await fs.copyFile(
    tsconfigFile,
    tsconfigSourceFile
  );

  const pathToTSC = path.join(monorepoRoot, `node_modules/typescript/bin/tsc`);
  const parameters = [
    pathToTSC,
    "--project", tsconfigSourceFile
  ];

  const popDir: string = cwd();

  try {
    // set up a promise to resolve or reject when tsc exits
    type PromiseResolver<T> = (value: T | PromiseLike<T>) => unknown;
    type PromiseRejecter = (reason?: unknown) => unknown;

    let resolve: PromiseResolver<void>, reject: PromiseRejecter;
    const tscPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // run the TypeScript compiler!
    // cwd is important for ts-node/tsimp hooks to run.
    const tsc = spawn(process.argv0, parameters, {
      cwd: projectDir,
      // this ensures you can see TypeScript error messages
      stdio: ["ignore", "inherit", "inherit", "ipc"]
    });
    tsc.on("exit", code => code ? reject(code) : resolve());

    await tscPromise;
  }
  finally {
    // clean up
    await fs.rm(tsconfigSourceFile);
    chdir(popDir);
  }

  let files = await fs.readdir(sourceDir, { encoding: "utf-8", recursive: true });
  files = files.filter(f => f.endsWith(".d.ts"));

  await Promise.all(files.map(async file => {
    await fs.mkdir(path.dirname(path.join(snapshotDir, file)), { recursive: true });
    await fs.copyFile(
      path.join(sourceDir, file), path.join(snapshotDir, file)
    );
  }));
}
