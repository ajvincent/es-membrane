//#region preamble
import path from "node:path";

import type {
  ClassDeclarationImpl,
  ClassMembersMap,
  DecoratorImpl,
  ImportManager,
  SourceFileImpl,
} from "ts-morph-structures";

import {
  projectDir
} from "#stage_utilities/source/AsyncSpecModules.js";

import type {
  ClassAndImportManager
} from "./types/ClassAndImportManager.js";

import {
  MethodStacks
} from "./utilities/MethodStacks.js";

import {
  getDecoratedHandler,
} from "./utilities/getDecoratedHandler.js";

import {
  getSubclassAndImports
} from "./utilities/getSubclassAndImports.js";

import {
  getTailHandler
} from "./utilities/getTailHandler.js";

import {
  mergeImportManagers
} from "./utilities/mergeImportManagers.js";

import {
  weldToConvertingHead
} from "./utilities/weldToConvertingHead.js";
//#endregion preamble

export async function buildFlatGraphHandler(): Promise<void> {
  const {
    classDecl: decoratedClassDecl,
    importManager: decoratedSourceImportManager,
  }: ClassAndImportManager = getDecoratedHandler();

  const {
    classDecl: tailClass,
    importManager: tailImports
  }: ClassAndImportManager = getTailHandler(decoratedSourceImportManager);

  const methodStacks = new MethodStacks;
  methodStacks.addClass(tailClass);

  const classToImportManager = new Map<ClassDeclarationImpl, ImportManager>;
  classToImportManager.set(tailClass, tailImports);

  const bottomUpDecorators: DecoratorImpl[] = decoratedClassDecl.decorators.toReversed();
  for (const decorator of bottomUpDecorators) {
    const {
      classDecl,
      importManager,
    } = getSubclassAndImports(decorator.name, decoratedSourceImportManager);
    methodStacks.addClass(classDecl);
    classToImportManager.set(classDecl, importManager);
  }

  const outModulePath = "membranes_flat/source/ObjectGraphHandler.ts";
  const outModuleFilePath = path.join(projectDir, outModulePath);

  const allTailClassMembers: ClassMembersMap = methodStacks.getFlattenedClassMembers();
  const consolidatedImports: ImportManager = mergeImportManagers(
    classToImportManager.values(), outModulePath
  );

  const FlatObjectGraphHandler_Source: SourceFileImpl = weldToConvertingHead(
    allTailClassMembers, consolidatedImports
  );

  // TODO: write the source file to generated/raw.
  void FlatObjectGraphHandler_Source;
  void outModuleFilePath;
  return Promise.reject(new Error("not yet writing source"));
}
