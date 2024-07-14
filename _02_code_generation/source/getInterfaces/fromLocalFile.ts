import {
  StructureKind,
} from "ts-morph";

import getTS_SourceFile, {
  addSeveralSourceFiles
} from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  InterfaceDeclarationImpl,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "ts-morph-structures";

export default function getLocalFileInterface(
  moduleLocation: string,
  interfaceName: string
): InterfaceDeclarationImpl
{
  const sourceFile = getTS_SourceFile({
    importMeta: import.meta,
    pathToDirectory: "../.."
  }, moduleLocation);
  const interfaceNode = sourceFile.getInterfaceOrThrow(interfaceName);

  return getTypeAugmentedStructure<StructureKind.Interface>(
    interfaceNode, VoidTypeNodeToTypeStructureConsole, true, StructureKind.Interface
  ).rootStructure;
}
