import assert from "node:assert";
import path from "node:path";

import {
  StructureKind,
} from "ts-morph";

import {
  type AddImportContext,
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

export function getSubclassAndImports(
  decoratorName: string,
  originalImportManager: ImportManager
): ClassAndImportManager
{
  const context: AddImportContext = originalImportManager.getNameContext(decoratorName)!;
  const relativePathToModule = context.pathToImportedModule.replace(/^#/, "").replace(/js$/, "ts");
  const sourceFile: SourceFileImpl = getSourceStructure(relativePathToModule);

  const fnStructure = sourceFile.statements.at(-2);
  assert(typeof fnStructure === "object", "expected a function");
  assert.equal(typeof fnStructure, "object", "expected a function");
  assert(fnStructure.kind === StructureKind.Function, "expected a function");
  assert.equal(fnStructure.name, decoratorName, "expected the function name to match");

  const classDecl = fnStructure.statements.at(-2);
  assert(typeof classDecl === "object", "expected a class declaration");
  assert(classDecl.kind === StructureKind.Class, "expected a class declaration");
  assert.equal(classDecl.name, decoratorName, "expected the class name to match");

  const absolutePathToModule = path.normalize(path.join(
    projectDir, relativePathToModule
  ));

  const importManager = ImportManager.fromSourceFile(absolutePathToModule, sourceFile);
  return {
    classDecl,
    importManager
  };
}
