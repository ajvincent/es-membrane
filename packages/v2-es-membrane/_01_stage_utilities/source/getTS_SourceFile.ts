import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ScriptTarget,
  SourceFile,
  SourceFileStructure,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "./AsyncSpecModules.js";

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

export function addSeveralSourceFiles(
  absolutePaths: string[]
): readonly SourceFile[]
{
  return project.addSourceFilesAtPaths(absolutePaths);
}

export async function createSourceFileFromStructure(
  absolutePath: string,
  sourceStructure: SourceFileStructure
): Promise<void> {
  const sourceFile: SourceFile = project.createSourceFile(absolutePath, sourceStructure);
  return sourceFile.save();
}
