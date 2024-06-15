import {
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  SourceFileImpl,
} from "#ts-morph_structures/exports.mjs";

export default class ImportManager {
  readonly targetFile: SourceFileImpl;
  readonly targetFilePath: string;

  readonly #declarationsMap = new Map<string, ImportDeclarationImpl>;
  readonly #knownSpecifiers = new Set<string>;

  constructor(
    targetFile: SourceFileImpl,
    targetFilePath: string,
  )
  {
    this.targetFile = targetFile;
    this.targetFilePath = targetFilePath;
  }

  addImport(
    pathToSourceFile: string,
    isFinalSourcePath: boolean,
    nameToImport: string,
    isDefaultImport: boolean,
    isTypeOnly: boolean,
  ): void
  {
    if (this.#knownSpecifiers.has(nameToImport))
      throw new Error("this import is already known.");

    let importDecl = this.#declarationsMap.get(pathToSourceFile);
    if (!importDecl) {
      importDecl = new ImportDeclarationImpl(pathToSourceFile);
      this.#declarationsMap.set(pathToSourceFile, importDecl);
      this.targetFile.statements.push(importDecl);
    }

    if (isDefaultImport) {
      if (importDecl.defaultImport) {
        throw new Error("You already have a default import.");
      }
      importDecl.defaultImport = nameToImport;
    }
    else {
      const specifier = new ImportSpecifierImpl(nameToImport);
      specifier.isTypeOnly = isTypeOnly;
      importDecl.namedImports.push(specifier);
    }
  }
}
