import {
  /*
  type AddImportContext,
  type ClassDeclarationImpl,
  */
  type ImportManager,
} from "ts-morph-structures";

import type {
  ClassAndImportManager
} from "../types/ClassAndImportManager.js";

/*
import {
  getSourceStructure
} from "./getSourceStructure.js";
*/

export function getSubclassAndImports(
  decoratorName: string,
  originalImportManager: ImportManager
): ClassAndImportManager
{
  void decoratorName;
  void originalImportManager;
  throw new Error("not yet implemented");
}
