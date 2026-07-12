import path from "node:path";

import type {
  AddImportContext
} from "./types/toolbox.js";

import {
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  type SourceFileImpl,
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
  public static fromSourceFile(
    absolutePathToModule: string,
    sourceFile: SourceFileImpl
  ): ImportManager
  {
    void absolutePathToModule;
    void sourceFile;
    throw new Error("not yet implemented");
  }

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

  static #separateNamedImportDeclByType(
    this: void,
    decl: ImportDeclarationImpl
  ): [ImportDeclarationImpl] | [ImportDeclarationImpl, ImportDeclarationImpl]
  {
    if (decl.isTypeOnly)
      return [ImportDeclarationImpl.clone(decl)];

    let foundNonTypedImports = Boolean(decl.defaultImport), foundTypedImports: boolean = false;
    for (const namedImport of (decl.namedImports as ImportSpecifierImpl[])) {
      if (namedImport.isTypeOnly)
        foundTypedImports = true;
      else
        foundNonTypedImports = true;
    }

    if (!foundTypedImports) {
      return [ImportDeclarationImpl.clone(decl)];
    }

    if (!foundNonTypedImports) {
      decl = ImportDeclarationImpl.clone(decl);
      decl.isTypeOnly = true;
      for (const namedImport of (decl.namedImports as ImportSpecifierImpl[])) {
        namedImport.isTypeOnly = false;
      }
      return [decl];
    }

    return [
      ImportDeclarationImpl.clone(decl, "excludeTypes"),
      ImportDeclarationImpl.clone(decl, "typesOnly")
    ];
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

  /** If you have a declaration, add its imported names. */
  public addFromDeclaration(
    decl: ImportDeclarationImpl
  ): void
  {
    void decl;
    throw new Error("not yet implemented");
  }

  /**
   * @param context - a description of the imports to add.
   */
  public addImports(
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

  public clone(
    resolver?: (sourceSpecifier: string, targetSpecifier: string) => string,
    relativePathToModule?: string
  ): ImportManager
  {
    void relativePathToModule;
    throw new Error("not yet implemented");
  }

  /**
   * Get a map of all imported names.  Each key will have its own metadata,
   * which excludes information about other names.
   */
  public getAllNamesMap(): ReadonlyMap<string, AddImportContext>
  {
    throw new Error("not yet implemented");
  }

  /** Get the import declarations, sorted by path to file, then internally by specified import values. */
  public getDeclarations(
    separateTypeOnlyDeclarations: boolean = false
  ): ImportDeclarationImpl[]
  {
    const entries = Array.from(this.#declarationsMap);
    entries.sort(ImportManager.#compareDeclarations);
    let decls = entries.map(entry => entry[1]);

    decls.forEach(decl => {
      (decl.namedImports as ImportSpecifierImpl[]).sort(ImportManager.#compareSpecifiers);
    });

    if (separateTypeOnlyDeclarations) {
      decls = decls.map(ImportManager.#separateNamedImportDeclByType).flat();
    }

    return decls;
  }

  public getNameContext(
    name: string
  ): AddImportContext | undefined
  {
    void name;
    throw new Error("not yet implemented");
  }

  /** Remove a key's metadata. */
  public removeImportName(
    name: string
  ): void
  {
    void name;
    throw new Error("not yet implemented");
  }
}
