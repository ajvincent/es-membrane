import {
  type SourceFile,
  StructureKind,
} from "ts-morph";

import {
  type SourceFileImpl,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "ts-morph-structures";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.js";

import {
  projectDir
} from "#stage_utilities/source/AsyncSpecModules.js";

export function getSourceStructure(
  moduleLocation: string
): SourceFileImpl
{
  const sourceFile: SourceFile = getTS_SourceFile({
    isAbsolutePath: true,
    pathToDirectory: projectDir,
  }, moduleLocation);

  return getTypeAugmentedStructure(
    sourceFile, VoidTypeNodeToTypeStructureConsole, true, StructureKind.SourceFile
  ).rootStructure;
}
