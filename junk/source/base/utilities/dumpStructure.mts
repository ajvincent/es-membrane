import {
  SourceFile,
  Node
} from "ts-morph";

import {
  ModuleSourceDirectory,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

export default function dumpStructure(
  startDir: ModuleSourceDirectory,
  sourceLocation: string,
  callback: (sourceFile: SourceFile) => Node,
) : void
{
  const sourceFile = getTS_SourceFile(startDir, sourceLocation);
  const sourceNode = callback(sourceFile);

  if (!Node.hasStructure(sourceNode)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.error("No structure found for node");
    return;
  }

  const structure = sourceNode.getStructure();
  console.log(JSON.stringify(structure, null, 2));
}
