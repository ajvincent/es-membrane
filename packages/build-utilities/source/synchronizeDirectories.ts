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
): Promise<void>
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
  await createRequiredDirectories(sourceDirSet, destDirSet, destinationTopDir);
  await copyRequiredFiles(sourceFilesSet, destFilesSet, sourceTopDir, destinationTopDir, now);
  await removeUnusedFiles(sourceFilesSet, destFilesSet, destinationTopDir);
  await removeUnusedDirectories(sourceDirSet, destDirSet, destinationTopDir, now);
}

async function createRequiredDirectories(
  sourceDirSet: ReadonlySet<string>,
  destDirSet: ReadonlySet<string>,
  destinationTopDir: string,
): Promise<void>
{
  const dirsToCreate: string[] = [];

  for (const relativeDir of sourceDirSet) {
    if (destDirSet.has(relativeDir))
      continue;
    dirsToCreate.push(path.join(destinationTopDir, relativeDir));
  }

  await PromiseAllSequence<string, void>(dirsToCreate, dir => fs.mkdir(dir));
}

async function copyRequiredFiles(
  sourceFilesSet: ReadonlySet<string>,
  destFileSet: ReadonlySet<string>,
  sourceTopDir: string,
  destinationTopDir: string,
  now: Date,
): Promise<void>
{
  const fileTuples: [string, string][] = [];

  for (const relativeFile of sourceFilesSet) {
    fileTuples.push([
      path.normalize(path.join(sourceTopDir, relativeFile)),
      path.normalize(path.join(destinationTopDir, relativeFile)),
    ]);
  }

  await PromiseAllParallel<[string, string], void>(fileTuples,
    ([sourceFile, destFile]) => overwriteFileIfDifferent(false, sourceFile, destFile, now)
  );
}

async function removeUnusedFiles(
  sourceFilesSet: ReadonlySet<string>,
  destFilesSet: ReadonlySet<string>,
  destinationTopDir: string,
): Promise<void>
{
  const filesToRemove: string[] = [];
  for (const relativeFile of destFilesSet) {
    if (sourceFilesSet.has(relativeFile))
      continue;

    filesToRemove.push(path.join(destinationTopDir, relativeFile));
  }

  await PromiseAllParallel<string, void>(filesToRemove, f => fs.rm(f, { force: true }));
}

async function removeUnusedDirectories(
  sourceDirSet: ReadonlySet<string>,
  destDirSet: ReadonlySet<string>,
  destinationTopDir: string,
  now: Date
): Promise<void>
{
  const dirsToDelete: string[] = [];
  for (const relativeDir of destDirSet) {
    if (sourceDirSet.has(relativeDir))
      continue;
    dirsToDelete.push(path.normalize(path.join(destinationTopDir, relativeDir)))
  }

  await PromiseAllSequence(dirsToDelete, d => fs.rmdir(d));
}
