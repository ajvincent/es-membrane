import path from "path";

import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
} from "ts-morph";

import {
  ImportManager,
  SourceFileImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import {
  distDir
} from "../build/constants.js";

import {
  publicExports,
  internalExports
} from "./ExportsModule.js";

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": true,
    "declaration": true,
  },
  skipAddingFilesFromTsConfig: true,
  skipFileDependencyResolution: true,
};

const project = new Project(TSC_CONFIG);

export default
abstract class BaseModule
{
  static readonly #importsEnum = {
    "ts-morph": "ts-morph",
    "mixin-decorators": "mixin-decorators",
    "type-fest": "type-fest",
    "public": publicExports.absolutePathToExportFile,
    "internal": internalExports.absolutePathToExportFile,
  };

  static async saveExports(): Promise<void>
  {
    const publicSource = new SourceFileImpl;
    publicSource.statements.push(
      "// This file is generated.  Do not edit.",
      ...publicExports.getDeclarations()
    );
    const publicFile = project.createSourceFile(
      publicExports.absolutePathToExportFile,
      publicSource
    );

    const internalSource = new SourceFileImpl;
    internalSource.statements.push(
      "// This file is generated.  Do not edit.",
      ...internalExports.getDeclarations()
    );
    const internalFile = project.createSourceFile(
      internalExports.absolutePathToExportFile,
      internalSource
    );

    await Promise.all([publicFile.save(), internalFile.save()]);
  }

  readonly defaultExportName: string;
  readonly importManager: ImportManager;

  constructor(
    pathToParentDirectory: string,
    defaultExportName: string,
    isTypeFile: boolean
  )
  {
    this.defaultExportName = defaultExportName;

    this.importManager = new ImportManager(
      path.join(
        pathToModule(distDir, pathToParentDirectory),
        `${defaultExportName}${isTypeFile ? ".d" : ""}.ts`
      )
    );
  }

  protected abstract getSourceFileImpl(): SourceFileImpl;

  public addImports(
    fromModule: "ts-morph" | "mixin-decorators" | "type-fest" | "public" | "internal",
    values: string[],
    types: string[]
  ): void
  {
    const pathToImportedModule: string = BaseModule.#importsEnum[fromModule];
    const isPackageImport = (fromModule !== "public") && (fromModule !== "internal");

    if (values.length > 0) {
      this.importManager.addImports({
        pathToImportedModule,
        isPackageImport,
        isDefaultImport: false,
        isTypeOnly: false,
        importNames: values
      });
    }

    if (types.length > 0) {
      this.importManager.addImports({
        pathToImportedModule,
        isPackageImport,
        isDefaultImport: false,
        isTypeOnly: true,
        importNames: types
      });
    }
  }

  public addToExport(
    isPublic: boolean,
    defaultExportName: string,
    values: string[],
    types: string[]
  ): void
  {
    const exportManager = isPublic ? publicExports : internalExports;
    if (defaultExportName) {
      exportManager.addExports({
        pathToExportedModule: this.importManager.absolutePathToModule,
        isDefaultExport: true,
        exportNames: [defaultExportName],
        isType: false
      });
    }

    if (values.length) {
      exportManager.addExports({
        pathToExportedModule: this.importManager.absolutePathToModule,
        isDefaultExport: false,
        exportNames: values,
        isType: false
      });
    }

    if (types.length) {
      exportManager.addExports({
        pathToExportedModule: this.importManager.absolutePathToModule,
        isDefaultExport: false,
        exportNames: types,
        isType: true
      });
    }
  }

  public addStarExport(
    isPublic: boolean,
    isType: boolean
  ): void
  {
    const exportManager = isPublic ? publicExports : internalExports;
    exportManager.addExports({
      pathToExportedModule: this.importManager.absolutePathToModule,
      isDefaultExport: false,
      exportNames: [],
      isType
    });
  }

  public async saveFile(): Promise<void>
  {
    const sourceStructure: SourceFileImpl = this.getSourceFileImpl();
    const file = project.createSourceFile(this.importManager.absolutePathToModule, sourceStructure);
    await file.save()
  }

  public toJSON(): object {
    return {
      defaultExportName: this.defaultExportName,
      imports: this.importManager.getDeclarations(),
    }
  }
}
