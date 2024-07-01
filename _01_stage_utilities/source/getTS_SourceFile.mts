import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ScriptTarget,
  SourceFile,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "./AsyncSpecModules.mjs";

const project = new Project({
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": true,
    "declaration": true,
  },
  skipAddingFilesFromTsConfig: true,
});

export default function getTS_SourceFile(
  startDir: ModuleSourceDirectory,
  sourceLocation: string,
) : SourceFile
{
  const pathToSourceFile = pathToModule(startDir, sourceLocation);
  project.addSourceFileAtPath(pathToSourceFile);
  project.resolveSourceFileDependencies();

  return project.getSourceFileOrThrow(pathToSourceFile);
}
