import path from "node:path";

import {
  ImportSpecifierStructure,
  StructureKind,
  type ImportDeclarationStructure,
} from "ts-morph";

import {
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  type SourceFileImpl,
} from "../exports.js";

import type { AddImportContext, ImportMapDefinition } from "./types/toolbox.js";

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
export default class ImportManager {
  /** Build an ImportManager from a source file. */
  public static fromSourceFile(
    absolutePathToModule: string,
    sourceFile: SourceFileImpl,
  ): ImportManager {
    const manager = new ImportManager(absolutePathToModule);
    for (const statement of sourceFile.statements) {
      if (typeof statement !== "object") continue;
      if (statement.kind === StructureKind.ImportDeclaration) {
        manager.addFromDeclaration(statement);
      }
    }
    return manager;
  }

  static #compareDeclarations(
    this: void,
    a: [string, ImportDeclarationImpl],
    b: [string, ImportDeclarationImpl],
  ): number {
    return a[0].localeCompare(b[0]);
  }

  static #compareSpecifiers(
    this: void,
    a: ImportSpecifierImpl,
    b: ImportSpecifierImpl,
  ): number {
    return a.name.localeCompare(b.name);
  }

  static #separateNamedImportDeclByType(
    this: void,
    decl: ImportDeclarationImpl,
  ): [ImportDeclarationImpl] | [ImportDeclarationImpl, ImportDeclarationImpl] {
    if (decl.isTypeOnly) return [ImportDeclarationImpl.clone(decl)];

    let foundNonTypedImports = Boolean(decl.defaultImport),
      foundTypedImports: boolean = false;
    for (const namedImport of decl.namedImports as ImportSpecifierImpl[]) {
      if (namedImport.isTypeOnly) foundTypedImports = true;
      else foundNonTypedImports = true;
    }

    if (!foundTypedImports) {
      return [ImportDeclarationImpl.clone(decl)];
    }

    if (!foundNonTypedImports) {
      decl = ImportDeclarationImpl.clone(decl);
      decl.isTypeOnly = true;
      for (const namedImport of decl.namedImports as ImportSpecifierImpl[]) {
        namedImport.isTypeOnly = false;
      }
      return [decl];
    }

    return [
      ImportDeclarationImpl.clone(decl, "excludeTypes"),
      ImportDeclarationImpl.clone(decl, "typesOnly"),
    ];
  }

  /** Where the file will live on the file system. */
  public readonly absolutePathToModule: string;

  /** key: pathToImportedModule */
  readonly #declarationsMap = new Map<string, ImportDeclarationImpl>();

  /** key: an imported field */
  readonly #knownSpecifiersMap = new Map<string, ImportSpecifierImpl>();

  /** key: an imported field */
  readonly #importedKeyToDeclMap = new Map<string, ImportDeclarationImpl>();

  /**
   * @param absolutePathToModule - Where the file will live on the file system.
   */
  public constructor(absolutePathToModule: string) {
    if (!absolutePathToModule.endsWith(".ts")) {
      throw new Error("path to module must end with .ts");
    }

    if (!path.isAbsolute(absolutePathToModule))
      throw new Error("path to module must be absolute");

    this.absolutePathToModule = path.normalize(absolutePathToModule);
  }

  /** Add imports from an existing import declaration. */
  public addFromDeclaration(declStructure: ImportDeclarationStructure): void {
    if (
      declStructure.defaultImport &&
      this.#importedKeyToDeclMap.has(declStructure.defaultImport)
    )
      throw new Error(
        `default import "${declStructure.defaultImport}" is already in the manager`,
      );

    const alreadyDefinedNames: string[] = [];
    if (typeof declStructure.namedImports === "object") {
      for (let specifier of declStructure.namedImports) {
        if (typeof specifier === "function")
          throw new Error(
            "writer functions not supported in declStructure.namedImports",
          );
        if (typeof specifier === "object") {
          if (specifier.alias) {
            // FIXME: there's no real reason we can't support them.
            throw new Error("aliases not supported");
          }
          specifier = specifier.name;
        }
        if (this.#importedKeyToDeclMap.has(specifier)) {
          alreadyDefinedNames.push(specifier);
        }
      }
    } else if (declStructure.namedImports !== undefined) {
      throw new Error("writer functions for named imports not supported");
    }
    if (alreadyDefinedNames.length > 0) {
      throw new Error(
        "These names are already in the manager: " +
          JSON.stringify(alreadyDefinedNames),
      );
    }

    const isPackageImport = !/^\.\.?\//.test(declStructure.moduleSpecifier);
    let { moduleSpecifier } = declStructure;
    if (!isPackageImport) {
      moduleSpecifier = path.normalize(
        path.join(this.absolutePathToModule, "..", moduleSpecifier),
      );
    }
    if (declStructure.defaultImport) {
      this.#addImports({
        pathToImportedModule: moduleSpecifier,
        isPackageImport,
        importNames: [declStructure.defaultImport],
        isDefaultImport: true,
        isTypeOnly: false,
      });
    }

    const nonTypesContext: AddImportContext = {
      pathToImportedModule: moduleSpecifier,
      isPackageImport,
      importNames: [],
      isDefaultImport: false,
      isTypeOnly: false,
    };

    const typesContext: AddImportContext = {
      pathToImportedModule: moduleSpecifier,
      isPackageImport,
      importNames: [],
      isDefaultImport: false,
      isTypeOnly: true,
    };

    if (declStructure.namedImports) {
      for (const specifierRaw of declStructure.namedImports) {
        let specifier = specifierRaw as string | ImportSpecifierStructure;
        let contextToUse = nonTypesContext;
        if (typeof specifier === "object" && specifier.isTypeOnly) {
          contextToUse = typesContext;
        }
        if (typeof specifier === "object") specifier = specifier.name;

        (contextToUse.importNames as string[]).push(specifier);
      }
    }

    if (declStructure.isTypeOnly) nonTypesContext.isTypeOnly = true;

    if (nonTypesContext.importNames.length > 0) {
      this.#addImports(nonTypesContext);
    }
    if (typesContext.importNames.length > 0) {
      this.#addImports(typesContext);
    }
  }

  /**
   * @param context - a description of the imports to add.
   */
  public addImports(context: AddImportContext): void {
    const { isPackageImport, isDefaultImport, importNames } = context;
    let { pathToImportedModule } = context;

    pathToImportedModule = path.normalize(
      pathToImportedModule.replace(/(\.d)?\.(m?)ts$/, ".$2js"),
    );
    if (!isPackageImport) {
      if (!path.isAbsolute(pathToImportedModule)) {
        throw new Error(
          "path to module must be absolute, or use isPackageImport: true to specify package import",
        );
      }

      pathToImportedModule = path.relative(
        path.dirname(this.absolutePathToModule),
        pathToImportedModule,
      );
      if (!pathToImportedModule.startsWith("../"))
        pathToImportedModule = "./" + pathToImportedModule;
    }

    const alreadyDefined: [string, string][] = [];
    for (const name of context.importNames) {
      const decl = this.#importedKeyToDeclMap.get(name);
      if (decl && decl.moduleSpecifier !== pathToImportedModule) {
        alreadyDefined.push([name, decl.moduleSpecifier]);
      }
    }
    if (alreadyDefined.length) {
      throw new Error(
        `These names are already in the manager in other declarations: ${JSON.stringify(
          alreadyDefined,
        )}, for pathToImportedModule "${pathToImportedModule}"`,
      );
    }

    if (isDefaultImport) {
      const importDecl = this.#declarationsMap.get(pathToImportedModule);
      if (importDecl?.defaultImport) {
        throw new Error("You already have a default import.");
      }
      if (importNames.length !== 1) {
        throw new Error("There must be one import name for a default import!");
      }
    }

    this.#addImports(context);
  }

  // If you've reached this, we should've passed all error handling.
  #addImports(context: AddImportContext): void {
    const { isPackageImport, isDefaultImport, isTypeOnly, importNames } =
      context;
    let { pathToImportedModule } = context;

    pathToImportedModule = path.normalize(
      pathToImportedModule.replace(/(\.d)?\.(m?)ts$/, ".$2js"),
    );
    if (!isPackageImport) {
      pathToImportedModule = path.relative(
        path.dirname(this.absolutePathToModule),
        pathToImportedModule,
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
      this.#moveTypeOnlyToSpecifiers(importDecl);
      importDecl.defaultImport = importNames[0];
    } else {
      if (!isTypeOnly) {
        this.#moveTypeOnlyToSpecifiers(importDecl);
      }
      for (const nameToImport of importNames) {
        let specifier: ImportSpecifierImpl | undefined =
          this.#knownSpecifiersMap.get(nameToImport);
        if (specifier) {
          if (!isTypeOnly) specifier.isTypeOnly = false;
          continue;
        }

        specifier = new ImportSpecifierImpl(nameToImport);
        if (isTypeOnly && !importDecl.isTypeOnly)
          specifier.isTypeOnly = isTypeOnly;
        importDecl.namedImports.push(specifier);
        this.#knownSpecifiersMap.set(nameToImport, specifier);
      }
    }

    for (const name of context.importNames) {
      this.#importedKeyToDeclMap.set(name, importDecl);
    }
  }

  #moveTypeOnlyToSpecifiers(importDecl: ImportDeclarationImpl): void {
    if (!importDecl.isTypeOnly) return;
    importDecl.namedImports.forEach((namedImport): void => {
      (namedImport as ImportSpecifierImpl).isTypeOnly = true;
    });
    importDecl.isTypeOnly = false;
  }

  public clone(
    relativePathToModule: string,
    importMap: ImportMapDefinition,
  ): ImportManager {
    void relativePathToModule;
    void importMap;
    throw new Error("not yet implemented");
  }

  /**
   * Get a map of all imported names.  Each key will have its own metadata,
   * which excludes information about other names.
   */
  public getAllNamesMap(): ReadonlyMap<string, AddImportContext> {
    const entries: [string, AddImportContext][] = [];
    for (const key of this.#importedKeyToDeclMap.keys()) {
      entries.push([key, this.getNameContext(key)!]);
    }
    return new Map(entries);
  }

  /** Get the import declarations, sorted by path to file, then internally by specified import values. */
  public getDeclarations(
    separateTypeOnlyDeclarations: boolean = false,
  ): ImportDeclarationImpl[] {
    const entries = Array.from(this.#declarationsMap);
    entries.sort(ImportManager.#compareDeclarations);
    let decls = entries.map((entry) => entry[1]);

    decls.forEach((decl) => {
      (decl.namedImports as ImportSpecifierImpl[]).sort(
        ImportManager.#compareSpecifiers,
      );
    });

    if (separateTypeOnlyDeclarations) {
      decls = decls.map(ImportManager.#separateNamedImportDeclByType).flat();
    }

    return decls;
  }

  /** Get contextual information about an existing name. */
  public getNameContext(name: string): AddImportContext | undefined {
    const decl: ImportDeclarationImpl | undefined =
      this.#importedKeyToDeclMap.get(name);
    if (!decl) return undefined;

    const isPackageImport = !/^\.\.?\//.test(decl.moduleSpecifier);

    if (decl.defaultImport === name) {
      return {
        pathToImportedModule: decl.moduleSpecifier,
        isPackageImport,
        importNames: [name],
        isDefaultImport: true,
        isTypeOnly: false,
      };
    }

    const specifier: ImportSpecifierImpl = this.#knownSpecifiersMap.get(name)!;

    return {
      pathToImportedModule: decl.moduleSpecifier,
      isPackageImport,
      importNames: [name],
      isDefaultImport: false,
      isTypeOnly: specifier.isTypeOnly,
    };
  }

  /**
   * Remove a key from its import declaration.
   *
   * @returns `true` if this deleted a key, `false` otherwise.
   */
  public removeImportName(name: string): boolean {
    const decl: ImportDeclarationImpl | undefined =
      this.#importedKeyToDeclMap.get(name);
    if (!decl) return false;

    if (decl.defaultImport === name) {
      decl.defaultImport = undefined;
    } else {
      const specifier: ImportSpecifierImpl =
        this.#knownSpecifiersMap.get(name)!;
      const index: number = decl.namedImports.indexOf(specifier);
      if (index === -1) return false;
      decl.namedImports.splice(index, 1);
    }

    this.#knownSpecifiersMap.delete(name);
    this.#importedKeyToDeclMap.delete(name);

    if (decl.defaultImport === undefined && decl.namedImports.length === 0) {
      this.#declarationsMap.delete(decl.moduleSpecifier);
    }

    return true;
  }
}
