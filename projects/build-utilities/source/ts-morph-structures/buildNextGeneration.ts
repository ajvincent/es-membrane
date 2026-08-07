import fs from "node:fs/promises";
import path from "node:path";

import {
  PromiseAllParallel
} from "../PromiseTypes.js";

import {
  asyncFork
} from "../childProcess.js";

import {
  monorepoRoot
} from "../constants.js";

const localRootSource = "ts-morph-structures";
const localRootTarget = "ts-morph-structures-next";
const allProjectsDir = path.join(monorepoRoot, "projects");

await asyncFork(
  path.join(allProjectsDir, localRootSource, "gulp-utilities/cleanTSC_output.js"),
  [],
  path.join(allProjectsDir, localRootSource)
);

//#region build directories structure
{
  type RoutingCallback = (localPath: string, teePath: string | null) => Promise<void>;

  const fileRoutingMap = new Map<string, readonly [RoutingCallback, string | null]>([
    ["dist", [doNothing, null]],
    ["gulp-utilities", [directCopyFile, null]],
    ["node_modules", [doNothing, null]],
    ["package.json", [modifyPackageJSON, null]],
    ["stage_0_references", [directCopyFile, null]],
    ["stage_1_snapshot", [doNothing, null]], // copied from stage_2
    ["stage_2_generation", [doNothing, null]], // copied from stage_3
    ["stage_2_integration", [directCopyFile, null]],
    ["stage_2_snapshot", [recurseOverFiles, "stage_1_snapshot"]],
    ["stage_2_snapshot/build", [doNothing, null]], // copied from stage_3
    ["stage_2_snapshot/fixtures", [directCopyFile, "stage_1_snapshot/fixtures"]],
    ["stage_2_snapshot/pre-build", [doNothing, null]], // copied from stage_3
    ["stage_2_snapshot/snapshot", [directCopyFile, "stage_1_snapshot/snapshot"]],
    ["stage_2_snapshot/spec-snapshot", [directCopyFile, "stage_1_snapshot/spec-snapshot"]],
    ["stage_2_snapshot/tsc-excludes.json", [directCopyFile, null]],
    ["stage_3_generation", [directCopyFile, "stage_2_generation"]],
    ["stage_3_integration", [directCopyFile, null]],
    ["stage_3_snapshot", [recurseOverFiles, null]],
    ["stage_3_snapshot/build", [directCopyFile, "stage_2_snapshot/build"]],
    ["stage_3_snapshot/pre-build", [directCopyFile, "stage_2_snapshot/pre-build"]],
    ["stage_3_snapshot/snapshot", [doNothing, null]],
    ["stage_3_snapshot/spec-snapshot", [directCopyFile, null]],
    ["stage_3_documentation", [directCopyFile, null]],
    ["use-cases", [directCopyFile, null]],
    ["utilities", [directCopyFile, null]],
  ]);

  await fs.mkdir(path.join(allProjectsDir, localRootTarget));
  await recurseOverFiles("", null);

  async function routeFile(
    localPath: string,
    teePath: string | null,
    leafName: string,
  ): Promise<void>
  {
    localPath = path.join(localPath, leafName);
    if (teePath)
      teePath = path.join(teePath, leafName);

    const [callback, teePathOverride] = fileRoutingMap.get(localPath) ?? [recurseOverFiles, teePath];
    teePath = teePathOverride;
    await callback(localPath, teePath);
  }

  function doNothing(): Promise<void> {
    return Promise.resolve();
  }
  doNothing satisfies RoutingCallback;

  function debugCallback(
    callback: RoutingCallback
  ): RoutingCallback
  {
    return function(
      localPath: string,
      teePath: string | null
    ): Promise<void>
    {
      //eslint-disable-next-line no-debugger;
      debugger;
      return callback(localPath, teePath);
    }
  }
  void debugCallback;

  async function recurseOverFiles(
    localPath: string,
    teePath: string | null
  ): Promise<void>
  {
    const filePath = path.join(allProjectsDir, localRootSource, localPath);
    const stats = await fs.stat(filePath);
    if (stats.isFile()) {
      return await directCopyFile(localPath, teePath);
    }

    const files: readonly string[] = await fs.readdir(filePath);
    await PromiseAllParallel(files, f => routeFile(localPath, teePath, f))
  }
  recurseOverFiles satisfies RoutingCallback;

  async function directCopyFile(
    localPath: string,
    teePath: string | null,
  ): Promise<void>
  {
    const sourceFile: string = path.join(allProjectsDir, localRootSource, localPath);
    const targetFile: string = path.join(allProjectsDir, localRootTarget, localPath);

    let promises: Promise<void>[] = [];
    promises.push(fs.cp(sourceFile, targetFile, { recursive: true }));
    if (teePath) {
      const teeFile: string = path.join(allProjectsDir, localRootTarget, teePath);
      promises.push(fs.cp(sourceFile, teeFile, { recursive: true }));
    }
    await Promise.all(promises);
  }
  directCopyFile satisfies RoutingCallback;

  async function modifyPackageJSON(
    localPath: string
  ): Promise<void>
  {
    const sourcePath = path.join(allProjectsDir, localRootSource, localPath);
    let contents: string = await fs.readFile(sourcePath, { encoding: "utf-8" });
    const packageJSON: { "private": boolean, "name": string } = JSON.parse(contents);
    packageJSON.name += "-next";
    packageJSON.private = true;
    contents = JSON.stringify(packageJSON, null, 2);

    const targetPath = path.join(allProjectsDir, localRootTarget, localPath);
    await fs.writeFile(targetPath, contents, { encoding: "utf-8" });
  }
  modifyPackageJSON satisfies RoutingCallback;
}
//#endregion build directories structure
