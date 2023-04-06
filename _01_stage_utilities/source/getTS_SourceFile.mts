import ts from "ts-morph";
import {
  ModuleSourceDirectory,
  pathToModule,
} from "./AsyncSpecModules.mjs";

const TSC_CONFIG = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ts.ModuleKind.ESNext,
    "target": ts.ScriptTarget.ESNext,
    "moduleResolution": ts.ModuleResolutionKind.NodeNext,
    "sourceMap": true,
    "declaration": true,
  },
  skipAddingFilesFromTsConfig: true,
};

export default function getTS_SourceFile(
  startDir: ModuleSourceDirectory,
  sourceLocation: string,
) : ts.SourceFile
{
  const pathToSourceFile = pathToModule(startDir, sourceLocation);
  const project = new ts.Project(TSC_CONFIG);
  project.addSourceFileAtPath(pathToSourceFile);
  project.resolveSourceFileDependencies();

  return project.getSourceFileOrThrow(pathToSourceFile);
}
