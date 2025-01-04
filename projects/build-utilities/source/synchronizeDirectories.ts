import fs from "node:fs/promises";
import path from "node:path";

import {
  Deferred,
  PromiseAllParallel,
  PromiseAllSequence,
} from "./PromiseTypes.js";

import {
  overwriteFileIfDifferent
} from "./overwriteFileIfDifferent.js";

import {
  readDirsDeep
} from "./readDirsDeep.js";

export async function synchronizeDirectories(
  sourceTopDir: string,
  destinationTopDir: string,
): Promise<boolean>
{
  const {
    dirs: sourceDirs,
    files: sourceFiles
  } = await readDirsDeep(sourceTopDir);
  const {
    dirs: destinationDirs,
    files: destinationFiles
  } = await readDirsDeep(destinationTopDir);

  const sourceDirSet: ReadonlySet<string> = new Set(
    sourceDirs.map(d => path.relative(sourceTopDir, d))
  );
  const destDirSet: ReadonlySet<string> = new Set(
    destinationDirs.slice().reverse().map(d => path.relative(destinationTopDir, d))
  );

  const sourceFilesSet: ReadonlySet<string> = new Set(
    sourceFiles.map(f => path.relative(sourceTopDir, f))
  );
  const destFilesSet: ReadonlySet<string> = new Set(
    destinationFiles.slice().reverse().map(f => path.relative(destinationTopDir, f))
  );

  const now = new Date();

  const results: boolean[] = [];
  results.push(await createRequiredDirectories(sourceDirSet, destDirSet, destinationTopDir));
  results.push(await copyRequiredFiles(sourceFilesSet, destFilesSet, sourceTopDir, destinationTopDir));
  results.push(await removeUnusedFiles(sourceFilesSet, destFilesSet, destinationTopDir));
  results.push(await removeUnusedDirectories(sourceDirSet, destDirSet, destinationTopDir, now));

  return results.some(Boolean);
}

async function createRequiredDirectories(
  sourceDirSet: ReadonlySet<string>,
  destDirSet: ReadonlySet<string>,
  destinationTopDir: string,
): Promise<boolean>
{
  const dirsToCreate: string[] = [];

  for (const relativeDir of sourceDirSet) {
    if (destDirSet.has(relativeDir))
      continue;
    dirsToCreate.push(path.join(destinationTopDir, relativeDir));
  }
  if (dirsToCreate.length === 0)
    return false;

  await PromiseAllSequence<string, void>(dirsToCreate, dir => fs.mkdir(dir));
  return true;
}

async function copyRequiredFiles(
  sourceFilesSet: ReadonlySet<string>,
  destFileSet: ReadonlySet<string>,
  sourceTopDir: string,
  destinationTopDir: string,
): Promise<boolean>
{
  const fileTuples: [string, string][] = [];

  for (const relativeFile of sourceFilesSet) {
    fileTuples.push([
      path.normalize(path.join(sourceTopDir, relativeFile)),
      path.normalize(path.join(destinationTopDir, relativeFile)),
    ]);
  }

  const results: readonly boolean[] = await PromiseAllParallel<[string, string], boolean>(fileTuples,
    ([sourceFile, destFile]) => overwriteFileIfDifferent(false, sourceFile, destFile)
  );
  return results.some(Boolean);
}

async function removeUnusedFiles(
  sourceFilesSet: ReadonlySet<string>,
  destFilesSet: ReadonlySet<string>,
  destinationTopDir: string,
): Promise<boolean>
{
  const filesToRemove: string[] = [];
  for (const relativeFile of destFilesSet) {
    if (sourceFilesSet.has(relativeFile))
      continue;

    filesToRemove.push(path.join(destinationTopDir, relativeFile));
  }

  if (filesToRemove.length === 0)
    return false;

  await PromiseAllParallel<string, void>(filesToRemove, f => fs.rm(f, { force: true }));
  return true;
}

async function removeUnusedDirectories(
  sourceDirSet: ReadonlySet<string>,
  destDirSet: ReadonlySet<string>,
  destinationTopDir: string,
  now: Date
): Promise<boolean>
{
  const dirsToDelete: string[] = [];
  for (const relativeDir of destDirSet) {
    if (sourceDirSet.has(relativeDir))
      continue;
    dirsToDelete.push(path.normalize(path.join(destinationTopDir, relativeDir)))
  }

  if (dirsToDelete.length === 0)
    return false;

  await PromiseAllSequence(dirsToDelete, d => fs.rmdir(d));
  return true;
}
