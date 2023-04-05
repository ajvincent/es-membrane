import ts from "ts-morph";
import {
  ModuleSourceDirectory,
  pathToModule,
} from "../../_01_stage_utilities/source/AsyncSpecModules.mjs";

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

export default function dumpStructure(
  startDir: ModuleSourceDirectory,
  sourceLocation: string,
  callback: (sourceFile: ts.SourceFile) => ts.Node,
) : void
{
  const pathToSourceFile = pathToModule(startDir, sourceLocation);
  const project = new ts.Project(TSC_CONFIG);
  project.addSourceFileAtPath(pathToSourceFile);
  project.resolveSourceFileDependencies();

  const sourceFile = project.getSourceFileOrThrow(pathToSourceFile);
  const sourceNode = callback(sourceFile);

  if (!ts.Node.hasStructure(sourceNode)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.error("No structure found for node");
    return;
  }

  const structure = sourceNode.getStructure();
  console.log(JSON.stringify(structure, null, 2));
}
