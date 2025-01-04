// #region preamble
import { performance } from "perf_hooks";

import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
} from "ts-morph";

import {
  SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";
// #endregion preamble

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": false,
    "declaration": false,
    "noEmit": true,
  },
  skipAddingFilesFromTsConfig: true,
  skipFileDependencyResolution: true,
};

const project = new Project(TSC_CONFIG);

export default async function saveSourceFile(
  pathToSourceFile: string,
  structure: SourceFileImpl
): Promise<number>
{
  const start = performance.now();
  const source = project.createSourceFile(pathToSourceFile, structure);
  await source.save();
  const end = performance.now();
  return end - start;
}
