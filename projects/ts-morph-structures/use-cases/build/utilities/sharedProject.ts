import fs from "fs/promises";
import path from "path";
import url from "url";

import {
  ModuleKind,
  ModuleResolutionKind,
  type Node,
  Project,
  type ProjectOptions,
  ScriptTarget,
  type Structures,
  SourceFile,
} from "ts-morph";

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": true,
    "declaration": true,
  },
  skipAddingFilesFromTsConfig: true,
  skipFileDependencyResolution: true,
};

export interface NodeWithStructures extends Node {
  getStructure(): Structures;
}

export const stageDir = path.normalize(path.join(url.fileURLToPath(import.meta.url), "../../../"));
export const distDir = path.join(stageDir, "dist");
export const projectDir = path.dirname(stageDir);

export const project = new Project(TSC_CONFIG);

export function getFullPath(pathToLocalFile: string): string {
  return path.join(stageDir, "dist", pathToLocalFile);
}

export async function removeDistFile(
  pathToLocalFile: string
): Promise<void>
{
  await fs.rm(getFullPath(pathToLocalFile), { force: true, recursive: true });
}

export function getExistingSourceFile(
  absolutePathToFile: string
): SourceFile
{
  return project.getSourceFile(absolutePathToFile) ?? project.addSourceFileAtPath(absolutePathToFile);
}

