import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";

const TS_MODULE_EXT_RE = /(?<!\.d)\.ts$/;

function isTSFile(
  this: void,
  d: Dirent
): boolean
{
  return d.isFile() && TS_MODULE_EXT_RE.test(d.name);
}

async function getDescendantFiles(
  this: void,
  projectRoot: string,
  topDir: string
): Promise<string[]>
{
  const dirPath = path.join(projectRoot, topDir);
  const descendants = await fs.readdir(dirPath, {
    encoding: "utf-8",
    withFileTypes: true,
    recursive: true,
  });
  return descendants.filter(isTSFile).map(d => path.join(d.path, d.name));
}

async function getTopDirFiles(
  this: void,
  projectRoot: string
): Promise<string[]>
{
  const topDirEntries = await fs.readdir(
    projectRoot,
    {
      encoding: "utf-8",
      withFileTypes: true,
      recursive: false,
    }
  );

  return Promise.resolve(
    topDirEntries.filter(isTSFile).map(dirEnt => path.join(projectRoot, dirEnt.name))
  );
}

export async function cleanTSC_Output(
  this: void,
  projectRoot: string,
  topDirs: readonly string[],
): Promise<void>
{
  const filePromises: Promise<string[]>[] = topDirs.map(getDescendantFiles.bind(this, projectRoot));
  filePromises.unshift(getTopDirFiles(projectRoot));

  const allTSFiles: string[] = (await Promise.all(filePromises)).flat();
  const allCompiledFiles: string[] = allTSFiles.map(tsFile => [
    tsFile.replace(/\.ts$/, ".js"),
    tsFile.replace(/\.ts$/, ".d.ts"),
    tsFile.replace(/\.ts$/, ".js.map")
  ]).flat();

  await Promise.all(allCompiledFiles.map(cf => fs.rm(cf, { force: true })));
}
