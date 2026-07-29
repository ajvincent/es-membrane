//#region preamble
import assert from "node:assert";
import path from "node:path";
import url from "node:url";

import {
  resolve as importResolve
} from "import-meta-resolve";

import {
  StructureKind,
} from "ts-morph";

import {
  ImportDeclarationImpl,
  ClassDeclarationImpl,
  SourceFileImpl,
  ImportManager,
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
//#endregion preamble

export function getTailHandler(
  decoratedSourceImportManager: ImportManager
): ClassAndImportManager
{
  const baseImportManager: ImportDeclarationImpl = decoratedSourceImportManager.getDeclarations().find(
    importDecl => importDecl.moduleSpecifier.endsWith("/ObjectGraphTailHandler.js")
  )!;

  // import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
  const pathToModule: string = url.fileURLToPath(importResolve(
    baseImportManager.moduleSpecifier,
    import.meta.url
  ));

  const sourceFile: SourceFileImpl = getSourceStructure(path.relative(projectDir, pathToModule));

  const tailImports: ImportDeclarationImpl[] = [];
  let classDecl: ClassDeclarationImpl | undefined;

  const importManager: ImportManager = ImportManager.fromSourceFile(
    pathToModule.replace(/\.js$/, ".ts"), sourceFile
  );

  for (const statement of sourceFile.statements) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    assert(typeof statement === "object", "expected a StructureImpl: " + statement.toString());
    if (statement.kind === StructureKind.ImportDeclaration)
      tailImports.push(statement);
    else if (statement.kind === StructureKind.Class) {
      assert(classDecl === undefined, "there should only be one class");
      classDecl = statement;
    }
    else {
      assert(false, "unexpected statement kind " + statement.kind);
    }
  }

  assert(classDecl, "should have found the tail handler class by now");

  return {
    classDecl,
    importManager,
  };
}
