import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  SourceFile,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "./AsyncSpecModules.js";

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

const project = new Project(TSC_CONFIG);
//project.resolveSourceFileDependencies();

export default function getTS_SourceFile(
  startDir: ModuleSourceDirectory,
  sourceLocation: string,
) : SourceFile
{
  const pathToSourceFile = pathToModule(startDir, sourceLocation);

  const sourceFile = project.addSourceFileAtPathIfExists(pathToSourceFile);
  if (sourceFile)
    return sourceFile;

  return project.createSourceFile(pathToSourceFile);
}
