import path from "node:path";

import type {
  PromiseResolver
} from "../source/PromiseTypes.js";

import {
  synchronizeDirectories
} from "../source/synchronizeDirectories.js";

import {
  readDirsDeep,
} from "../source/readDirsDeep.js";

import createFixtureTempDir from "./support/createFixtureTempDir.js";

describe("synchronizeDirectories", () => {
  let tempDir: string, tempDirResolve: PromiseResolver<void>, tempDirPromise: Promise<void>;
  let tempDest: string, tempSrc: string;

  beforeAll(async () => {
    const withCleanup = await createFixtureTempDir("synchronizeDirsBase");
    tempDir = withCleanup.tempDir;
    tempDirResolve = withCleanup.resolve;
    tempDirPromise = withCleanup.promise;

    tempDest = path.join(tempDir, "dest");
    tempSrc = path.join(tempDir, "src");
  });

  afterAll(async () => {
    tempDirResolve();
    await tempDirPromise;
  });

  it("makes the destination directory reflect the source directory", async () => {
    await expectAsync(
      synchronizeDirectories(tempSrc, tempDest)
    ).toBeResolved();

    let {
      dirs: destDirs,
      files: destFiles
    } = await readDirsDeep(tempDest);
    destDirs = destDirs.map(d => path.relative(tempDest, d));
    destFiles = destFiles.map(f => path.relative(tempDest, f));

    let {
      dirs: sourceDirs,
      files: sourceFiles
    } = await readDirsDeep(tempSrc);
    sourceDirs = sourceDirs.map(d => path.relative(tempSrc, d));
    sourceFiles = sourceFiles.map(f => path.relative(tempSrc, f));

    expect(destDirs).withContext("directories").toEqual(sourceDirs);
    expect(destFiles).withContext("files").toEqual(sourceFiles);
 });
});
