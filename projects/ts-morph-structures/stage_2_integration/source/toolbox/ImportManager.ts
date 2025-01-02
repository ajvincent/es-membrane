import path from "path";

import {
  type AddImportContext,
  ImportDeclarationImpl,
  ImportSpecifierImpl,
} from "../../snapshot/source/exports.js";

/**
 * This manages import declarations and specifiers, for including in a source file.
 *
 * @example
 * ```typescript
 * importsManager.addImports({
 *   pathToImportedModule: "ts-morph",
 *   isPackageImport: true,
 *   importNames: ["Structure", "StructureKind"],
 *   isDefaultImport: false,
 *   isTypeOnly: true
 * });
 * // ...
 * sourceFile.statements.unshift(...importsManager.getDeclarations());
 * ```
 */
export default class ImportManager
{
  static #compareDeclarations(
    this: void,
    a: [string, ImportDeclarationImpl],
    b: [string, ImportDeclarationImpl],
  ): number
  {
    return a[0].localeCompare(b[0]);
  }

  static #compareSpecifiers(
    this: void,
    a: ImportSpecifierImpl,
    b: ImportSpecifierImpl,
  ): number
  {
    return a.name.localeCompare(b.name);
  }

  /** Where the file will live on the file system. */
  readonly absolutePathToModule: string;

  readonly #declarationsMap = new Map<string, ImportDeclarationImpl>;
  readonly #knownSpecifiersMap = new Map<string, ImportSpecifierImpl>;

  /**
   * @param absolutePathToModule - Where the file will live on the file system.
   */
  constructor(
    absolutePathToModule: string,
  )
  {
    if (!absolutePathToModule.endsWith(".ts")) {
      throw new Error("path to module must end with .ts");
    }

    if (!path.isAbsolute(absolutePathToModule))
      throw new Error("path to module must be absolute");

    this.absolutePathToModule = path.normalize(absolutePathToModule);
  }

  /**
   * @param context - a description of the imports to add.
   */
  addImports(
    context: AddImportContext
  ): void
  {
    const { isPackageImport, isDefaultImport, isTypeOnly, importNames } = context;
    let { pathToImportedModule } = context;

    if (!isPackageImport) {
      if (!pathToImportedModule.endsWith(".ts")) {
        throw new Error("path to module must end with .ts, or use isPackageImport: true to specify package import");
      }

      if (!isPackageImport && !path.isAbsolute(pathToImportedModule)) {
        throw new Error("path to module must be absolute, or use isPackageImport: true to specify package import");
      }
    }

    pathToImportedModule = path.normalize(
      pathToImportedModule.replace(/(\.d)?\.(m?)ts$/, ".$2js")
    );
    if (!isPackageImport) {
      pathToImportedModule = path.relative(
        path.dirname(this.absolutePathToModule), pathToImportedModule
      );
      if (!pathToImportedModule.startsWith("../"))
        pathToImportedModule = "./" + pathToImportedModule;
    }

    let importDecl = this.#declarationsMap.get(pathToImportedModule);
    if (!importDecl) {
      importDecl = new ImportDeclarationImpl(pathToImportedModule);
      importDecl.isTypeOnly = true;
      this.#declarationsMap.set(pathToImportedModule, importDecl);
    }

    if (isDefaultImport) {
      if (importDecl.defaultImport) {
        throw new Error("You already have a default import.");
      }
      if (importNames.length !== 1) {
        throw new Error("There must be one import name for a default import!")
      }
      this.#moveTypeOnlyToSpecifiers(importDecl);
      importDecl.defaultImport = importNames[0];
    }
    else {
      if (!isTypeOnly) {
        this.#moveTypeOnlyToSpecifiers(importDecl);
      }
      for (const nameToImport of importNames) {
        let specifier: ImportSpecifierImpl | undefined = this.#knownSpecifiersMap.get(nameToImport);
        if (specifier) {
          if (!isTypeOnly)
            specifier.isTypeOnly = false;
          continue;
        }

        specifier = new ImportSpecifierImpl(nameToImport);
        if (isTypeOnly && !(importDecl.isTypeOnly))
          specifier.isTypeOnly = isTypeOnly;
        importDecl.namedImports.push(specifier);
        this.#knownSpecifiersMap.set(nameToImport, specifier);
      }
    }
  }

  #moveTypeOnlyToSpecifiers(
    importDecl: ImportDeclarationImpl
  ): void
  {
    if (!importDecl.isTypeOnly)
      return;
    importDecl.namedImports.forEach((namedImport): void => {
      (namedImport as ImportSpecifierImpl).isTypeOnly = true;
    });
    importDecl.isTypeOnly = false;
  }

  /** Get the import declarations, sorted by path to file, then internally by specified import values. */
  getDeclarations(): ImportDeclarationImpl[]
  {
    const entries = Array.from(this.#declarationsMap);
    entries.sort(ImportManager.#compareDeclarations);
    return entries.map(entry => {
      (entry[1].namedImports as ImportSpecifierImpl[]).sort(ImportManager.#compareSpecifiers);
      return entry[1];
    });
  }
}
