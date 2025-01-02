// #region preamble
import path from "path";

import ImportManager from "./public/ImportManager.js";

import type {
  DecoratorImplMeta
} from "../structureMeta/DataClasses.js";

import {
  distDir
} from "../constants.js";

// #endregion preamble

export default function defineDecoratorImports(
  meta: DecoratorImplMeta,
  className: string,
): ImportManager
{
  const importManager = new ImportManager(
    path.join(distDir, "source", "decorators", "standard", className + ".ts")
  );

  importManager.addImports({
    pathToImportedModule: "mixin-decorators",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "MixinClass",
      "SubclassDecorator",
      "StaticAndInstance"
    ]
  });

  importManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      meta.structureName,
      "Structures",
    ]
  });

  importManager.addImports({
    pathToImportedModule: path.join(distDir, "source/internal-exports.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "RightExtendsLeft",
    ]
  });

  importManager.addImports({
    pathToImportedModule: path.join(distDir, "source/internal-exports.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: [
      "StructureBase"
    ]
  });

  return importManager;
}
