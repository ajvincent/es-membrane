import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";

import {
  type InterfaceDeclaration,
  SourceFile,
  StructureKind,
} from "ts-morph";

import {
  monorepoDir
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import {
  addSeveralSourceFiles
} from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  InterfaceDeclarationImpl,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "ts-morph-structures";

export const TYPESCRIPT_LIB_SOURCEFILES: readonly SourceFile[] = await getLibraryFiles();

async function getLibraryFiles(): Promise<readonly SourceFile[]>
{
  const TYPESCRIPT_LIBS_PATH = path.join(monorepoDir, "node_modules/typescript/lib");
  let fileList: string[] = await fs.readdir(TYPESCRIPT_LIBS_PATH);
  fileList = fileList.filter(f => /^lib\..*\.d.ts$/.test(f));
  fileList = fileList.map(f => path.join(TYPESCRIPT_LIBS_PATH, f));
  return addSeveralSourceFiles(fileList);
}

export default function getLibraryInterface(identifier: string): InterfaceDeclarationImpl
{
  let matchedDecl: InterfaceDeclarationImpl | undefined;

  if (matchedDecl)
    return matchedDecl;

  let decl: InterfaceDeclarationImpl | undefined;
  for (const file of TYPESCRIPT_LIB_SOURCEFILES) {
    let rawDeclaration: InterfaceDeclaration | undefined = file.getInterface(identifier);
    if (rawDeclaration) {
      assert(decl === undefined, "we should only get one interface");
      decl = getTypeAugmentedStructure<StructureKind.Interface>(
        rawDeclaration,
        VoidTypeNodeToTypeStructureConsole,
        true,
        StructureKind.Interface
      ).rootStructure;
    }
  }

  assert(decl, "don't we have the declaration yet?");
  matchedDecl = decl;
  return decl;
}
