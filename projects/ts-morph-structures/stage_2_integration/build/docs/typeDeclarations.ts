import fs from "node:fs/promises";
import path from "node:path";
import { cwd, chdir } from 'node:process';
import url from "node:url";

import {
  asyncFork,
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
  const popDir: string = cwd();

  try {
    await asyncFork(
      pathToTSC,
      ["--project", tsconfigSourceFile],
      projectDir
    );
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
