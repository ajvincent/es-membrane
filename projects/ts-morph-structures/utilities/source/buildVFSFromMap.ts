import fs from "node:fs";
import path from "node:path";
// @ts-expect-error unknown module until @types/node update
import vfs_raw from "node:vfs";

import {
  PromiseAllParallel
} from "./PromiseTypes.js";

import type {
  Class
} from "type-fest";

type MemoryProvider = { setReadonly(): void };

interface VFS {
  create(provider?: object, options?: {
    emitExperimentalWarning?: boolean
  }): typeof fs;
  VirtualProvider: Class<object, []>,
  MemoryProvider: Class<MemoryProvider, []>,
  RealFSProvider: Class<{ rootPath: string }, [ string ]>,
}

const vfs = vfs_raw as VFS;

export async function buildVFSFromMap(
  sourceFileMap: ReadonlyMap<string, string>
): Promise<[typeof fs, MemoryProvider]>
{
  const provider = new vfs.MemoryProvider();
  const fileSystem = vfs.create(
    provider,
    { emitExperimentalWarning: false }
  );
  const dirKeys: readonly string[] = getDirKeys(sourceFileMap);

  await PromiseAllParallel(dirKeys, dir => fileSystem.promises.mkdir(dir, { recursive: true }));
  const entries: readonly (readonly [string, string])[] = Array.from(sourceFileMap.entries());
  await PromiseAllParallel(
    entries,
    ([pathToFile, contents]) => fileSystem.promises.writeFile(pathToFile, contents, { encoding: "utf-8"})
  );

  return [fileSystem, provider];
}

function getDirKeys(sourceFileMap: ReadonlyMap<string, string>): readonly string[] {
  const dirKeys = new Set<string>;
  for (const filePath of sourceFileMap.keys()) {
    dirKeys.add(path.dirname(filePath));
  }
  return Array.from(dirKeys);
}
