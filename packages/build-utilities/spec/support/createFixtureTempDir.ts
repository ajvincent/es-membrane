import fs from "node:fs/promises";
import path from "node:path";

import {
  type TemporaryDirWithPromise,
  tempDirWithCleanup,
} from "../../source/tempDirWithCleanup.js";

import {
  projectRoot
} from "../../source/constants.js";
import {
  DESTINATION_DATE,
  SOURCE_DATE,
  updateTimestampsInDir
} from "./fileTimestamps.js";

export default async function createFixtureTempDir(
  fixtureDir: string
): Promise<TemporaryDirWithPromise>
{
  const withCleanup = await tempDirWithCleanup();
  const tempDir = withCleanup.tempDir;

  await fs.cp(
    path.join(projectRoot, "fixtures", fixtureDir),
    tempDir,
    { recursive: true }
  );

  const tempDest = path.join(tempDir, "dest");
  const tempSrc = path.join(tempDir, "src");

  await Promise.all([
    updateTimestampsInDir(tempSrc, SOURCE_DATE),
    updateTimestampsInDir(tempDest, DESTINATION_DATE)
  ]);

  return withCleanup;
}
