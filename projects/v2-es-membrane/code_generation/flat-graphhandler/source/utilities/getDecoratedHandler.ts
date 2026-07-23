import assert from "node:assert";
import path from "node:path";

import {
  type SourceFile,
  StructureKind,
} from "ts-morph";

import {
  getTypeAugmentedStructure,
  ImportManager,
  SourceFileImpl,
  VoidTypeNodeToTypeStructureConsole,
} from "ts-morph-structures";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.js";

import {
  projectDir
} from "#stage_utilities/source/AsyncSpecModules.js";

import type {
  ClassAndImportManager
} from "../types/ClassAndImportManager.js";

export async function getDecoratedHandler(): Promise<ClassAndImportManager> {
  const writeFileLocation = "membranes_flat/source/ObjectGraphHandler.ts";
  const tempSourceFileLocation = "membranes_flat/source/ObjectGraphHandler.tmp.ts";
  let sourceFile: SourceFileImpl;
  {
    let sourceFileNative: SourceFile = getTS_SourceFile({
      isAbsolutePath: true,
      pathToDirectory: projectDir,
    }, "membranes_decorated/source/ObjectGraphHandler.ts");

    sourceFileNative = sourceFileNative.copyToDirectory(
      path.join(projectDir, tempSourceFileLocation),
      { overwrite: true }
    );

    sourceFile = getTypeAugmentedStructure(
      sourceFileNative, VoidTypeNodeToTypeStructureConsole, true, StructureKind.SourceFile
    ).rootStructure;
    await sourceFileNative.deleteImmediately();
  }

  const classDecl = sourceFile.statements.at(-1);
  assert(typeof classDecl === "object", "expected ClassDeclarationImpl");
  assert(classDecl.kind === StructureKind.Class, "expected ClassDeclarationImpl");

  const mixinImports = [];

  for (const statement of sourceFile.statements) {
    if (typeof statement !== "object")
      continue;

    if (statement.kind === StructureKind.ImportDeclaration) {
      mixinImports.unshift(statement);
    } else if (statement.kind === StructureKind.Class)
      continue;
    else
      assert(false, "unexpected statement kind " + statement.kind);
  }

  assert(classDecl.ctors.length === 0, "unexpected constructor");
  assert(classDecl.staticBlocks.length === 0, "unexpected static blocks");
  assert(classDecl.properties.length === 0, "unexpected properties");
  assert(classDecl.methods.length === 0, "unexpected methods");
  assert(classDecl.getAccessors.length === 0, "unexpected getAccessors");
  assert(classDecl.setAccessors.length === 0, "unexpected setAccessors");
  assert(classDecl.typeParameters.length === 0, "unexpected type parameters");

  const importManager = ImportManager.fromSourceFile(
    path.join(projectDir, writeFileLocation),
    sourceFile
  );

  return {
    classDecl,
    importManager,
  };
}
