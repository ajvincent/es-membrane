// #region preamble
import path from "path";

import {
  type AddExportContext,
  ExportDeclarationImpl,
  ExportSpecifierImpl,
} from "../../snapshot/source/exports.js";

import {
  DefaultMap,
  DefaultWeakMap,
} from "../../snapshot/source/internal-exports.js";

// #endregion preamble


/**
 * This manages export declarations and specifiers, for including in a source file.
 *
 * @example
 * ```typescript
 * publicExports.addExports({
 *   pathToExportedModule: path.join(distDir, "source/toolbox/ExportManager.ts"),
 *   exportNames: ["ExportManager"],
 *   isDefaultExport: true,
 *   isType: false,
 * });
 * // ...
 * sourceFile.statements.push(...publicExports.getDeclarations());
 * ```
 */
export default class ExportManager
{
  static #compareDeclarations(
    this: void,
    a: [string, ExportDeclarationImpl],
    b: [string, ExportDeclarationImpl],
  ): number
  {
    return a[0].localeCompare(b[0]);
  }

  static #compareSpecifiers(
    this: void,
    a: ExportSpecifierImpl,
    b: ExportSpecifierImpl,
  ): number
  {
    return a.name.localeCompare(b.name);
  }

  /** Where the file will live on the file system. */
  readonly absolutePathToExportFile: string;

  readonly #pathToDeclarationMap = new DefaultMap<string, ExportDeclarationImpl>;
  readonly #declarationToNamesMap = new DefaultWeakMap<
    ExportDeclarationImpl, Map<string, ExportSpecifierImpl>
  >;

  /**
   * @param absolutePathToExportFile - Where the file will live on the file system.
   */
  constructor(
    absolutePathToExportFile: string,
  )
  {
    this.absolutePathToExportFile = absolutePathToExportFile;
  }

  /**
   * @param context - a description of the exports to add.
   */
  addExports(
    context: AddExportContext
  ): void
  {
    const { pathToExportedModule, exportNames, isDefaultExport, isType } = context;
    if (!pathToExportedModule.endsWith(".ts"))
      throw new Error("path to module must end with .ts");

    if (isDefaultExport && (exportNames.length !== 1)) {
      throw new Error("at most one default export name");
    }

    const declaration = this.#pathToDeclarationMap.getDefault(
      pathToExportedModule, () => this.#buildDeclaration(pathToExportedModule)
    );

    if (!isType && declaration.isTypeOnly) {
      declaration.namedExports.forEach((specifier): void => {
        (specifier as ExportSpecifierImpl).isTypeOnly = true;
      });
      declaration.isTypeOnly = false;
    }

    const specifiers: ExportSpecifierImpl[] = [];
    const namesMap = this.#declarationToNamesMap.getDefault(declaration, () => new Map);
    exportNames.forEach(exportName => {
      let specifier: ExportSpecifierImpl | undefined = namesMap.get(exportName);

      if (specifier) {
        if (specifier.isTypeOnly && !isType) {
          specifier.isTypeOnly = false;
        }
      }
      else {
        specifier = new ExportSpecifierImpl(exportName);
        if (isType && !declaration.isTypeOnly)
          specifier.isTypeOnly = true;
        namesMap.set(exportName, specifier);
        specifiers.push(specifier);
      }
    });

    if (isDefaultExport) {
      specifiers[0].name = "default";
      specifiers[0].alias = exportNames[0];
    }

    declaration.namedExports.push(...specifiers);
  }

  #buildDeclaration(
    pathToExportedModule: string
  ): ExportDeclarationImpl
  {
    const decl = new ExportDeclarationImpl;

    decl.moduleSpecifier = path.relative(
      path.dirname(this.absolutePathToExportFile),
      pathToExportedModule.replace(/(\.d)?\.(m?)ts$/, ".$2js")
    );
    if (!decl.moduleSpecifier.startsWith("../"))
      decl.moduleSpecifier = "./" + decl.moduleSpecifier;

    decl.isTypeOnly = true;
    return decl;
  }

  /** Get the export declarations, sorted by path to file, then internally by specified export values. */
  getDeclarations(): ExportDeclarationImpl[] {
    const declarationEntries = Array.from(this.#pathToDeclarationMap.entries());
    declarationEntries.sort(ExportManager.#compareDeclarations);

    const declarations = declarationEntries.map(entry => entry[1]);
    declarations.forEach(decl => {
      (decl.namedExports as ExportSpecifierImpl[]).sort(ExportManager.#compareSpecifiers);
    });

    return declarations;
  }
}
