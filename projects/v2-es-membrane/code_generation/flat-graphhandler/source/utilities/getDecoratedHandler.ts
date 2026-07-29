import assert from "node:assert";
import path from "node:path";

import {
  StructureKind,
} from "ts-morph";

import {
  ImportManager,
  type SourceFileImpl,
} from "ts-morph-structures";

import {
  projectDir
} from "#stage_utilities/source/AsyncSpecModules.js";

import type {
  ClassAndImportManager
} from "../types/ClassAndImportManager.js";

import {
  getSourceStructure
} from "./getSourceStructure.js";

export function getDecoratedHandler(): ClassAndImportManager {
  const writeFileLocation = "membranes_flat/source/ObjectGraphHandler.ts";
  const sourceFile: SourceFileImpl = getSourceStructure("membranes_decorated/source/ObjectGraphHandler.ts");

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
