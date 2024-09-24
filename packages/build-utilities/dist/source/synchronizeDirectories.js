import fs from "node:fs/promises";
import path from "node:path";
import { PromiseAllParallel, PromiseAllSequence, } from "./PromiseTypes.js";
import { overwriteFileIfDifferent } from "./overwriteFileIfDifferent.js";
import { readDirsDeep } from "./readDirsDeep.js";
export async function synchronizeDirectories(sourceTopDir, destinationTopDir) {
    const { dirs: sourceDirs, files: sourceFiles } = await readDirsDeep(sourceTopDir);
    const { dirs: destinationDirs, files: destinationFiles } = await readDirsDeep(destinationTopDir);
    const sourceDirSet = new Set(sourceDirs.map(d => path.relative(sourceTopDir, d)));
    const destDirSet = new Set(destinationDirs.slice().reverse().map(d => path.relative(destinationTopDir, d)));
    const sourceFilesSet = new Set(sourceFiles.map(f => path.relative(sourceTopDir, f)));
    const destFilesSet = new Set(destinationFiles.slice().reverse().map(f => path.relative(destinationTopDir, f)));
    const now = new Date();
    await createRequiredDirectories(sourceDirSet, destDirSet, destinationTopDir);
    await copyRequiredFiles(sourceFilesSet, destFilesSet, sourceTopDir, destinationTopDir, now);
    await removeUnusedFiles(sourceFilesSet, destFilesSet, destinationTopDir);
    await removeUnusedDirectories(sourceDirSet, destDirSet, destinationTopDir, now);
}
async function createRequiredDirectories(sourceDirSet, destDirSet, destinationTopDir) {
    const dirsToCreate = [];
    for (const relativeDir of sourceDirSet) {
        if (destDirSet.has(relativeDir))
            continue;
        dirsToCreate.push(path.join(destinationTopDir, relativeDir));
    }
    await PromiseAllSequence(dirsToCreate, dir => fs.mkdir(dir));
}
async function copyRequiredFiles(sourceFilesSet, destFileSet, sourceTopDir, destinationTopDir, now) {
    const fileTuples = [];
    for (const relativeFile of sourceFilesSet) {
        fileTuples.push([
            path.normalize(path.join(sourceTopDir, relativeFile)),
            path.normalize(path.join(destinationTopDir, relativeFile)),
        ]);
    }
    await PromiseAllParallel(fileTuples, ([sourceFile, destFile]) => overwriteFileIfDifferent(false, sourceFile, destFile, now));
}
async function removeUnusedFiles(sourceFilesSet, destFilesSet, destinationTopDir) {
    const filesToRemove = [];
    for (const relativeFile of destFilesSet) {
        if (sourceFilesSet.has(relativeFile))
            continue;
        filesToRemove.push(path.join(destinationTopDir, relativeFile));
    }
    await PromiseAllParallel(filesToRemove, f => fs.rm(f, { force: true }));
}
async function removeUnusedDirectories(sourceDirSet, destDirSet, destinationTopDir, now) {
    const dirsToDelete = [];
    for (const relativeDir of destDirSet) {
        if (sourceDirSet.has(relativeDir))
            continue;
        dirsToDelete.push(path.normalize(path.join(destinationTopDir, relativeDir)));
    }
    await PromiseAllSequence(dirsToDelete, d => fs.rmdir(d));
}
