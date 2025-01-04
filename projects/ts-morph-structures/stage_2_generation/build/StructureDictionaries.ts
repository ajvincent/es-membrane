//#region preamble
import assert from "node:assert/strict";

import {
  WriterFunction,
} from "ts-morph";

import {
  PromiseAllParallel,
} from "#utilities/source/PromiseTypes.js";

import {
  ClassDeclarationImpl,
  FunctionDeclarationImpl,
  InterfaceDeclarationImpl,
  LiteralTypedStructure,
  MethodDeclarationImpl,
  SourceFileImpl,
  TypeAliasDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  DecoratorImplMeta,
  StructureImplMeta,
  StructureMetaDictionaries,
} from "./structureMeta/DataClasses.js";

import ClassMembersMap from "./utilities/public/ClassMembersMap.js";

import ImportManager from "./utilities/public/ImportManager.js";

import {
  stageDir,
} from "./constants.js";

import { pathToModule } from "#utilities/source/AsyncSpecModules.js";
import ExportManagerCommit from "./utilities/ExportManagerCommit.js";
import ClassFieldStatementsMap from "./utilities/public/ClassFieldStatementsMap.js";
import TypeMembersMap from "./utilities/public/TypeMembersMap.js";
//#endregion preamble

export type DecoratorHook = (
  name: string,
  meta: DecoratorImplMeta,
  dictionaries: StructureDictionaries
) => void;

export type StructureHook = (
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
) => void;

export type DecoratorSaveHook = (
  name: string,
  meta: DecoratorImplMeta,
  dictionaries: StructureDictionaries
) => Promise<void>;

export type StructureSaveHook = (
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
) => Promise<void>;

export enum MetaPartsType {
  DECORATOR = "Decorator",
  STRUCTURE = "Structure",
}

export interface DecoratorParts {
  readonly partsType: MetaPartsType.DECORATOR;

  classDecl: ClassDeclarationImpl;
  classFieldsStatements: ClassFieldStatementsMap;
  classMembersMap: ClassMembersMap;
  importsManager: ImportManager;
  moduleInterfaces: InterfaceDeclarationImpl[];
  sourceFile: SourceFileImpl;
  copyFields: MethodDeclarationImpl;
  fieldsTypeAlias: TypeAliasDeclarationImpl;
  fieldsInstanceType: LiteralTypedStructure;
  wrapperFunction: FunctionDeclarationImpl;

  classImplementsMap: TypeMembersMap;
  classImplementsIfc: InterfaceDeclarationImpl;
  implementsImports: ImportManager;
}

export interface StructureParts {
  readonly partsType: MetaPartsType.STRUCTURE;

  mixinBaseWriter: WriterFunction;
  classDecl: ClassDeclarationImpl;

  classFieldsStatements: ClassFieldStatementsMap;
  classMembersMap: ClassMembersMap;
  importsManager: ImportManager;
  moduleInterfaces: InterfaceDeclarationImpl[];
  sourceFile: SourceFileImpl;
  copyFields: MethodDeclarationImpl;

  classImplementsMap: TypeMembersMap;
  classImplementsIfc: InterfaceDeclarationImpl;
  implementsImports: ImportManager;
}

const InternalExports = new ExportManagerCommit(
  pathToModule(stageDir, "dist/source/internal-exports.ts")
);
const PublicExports = new ExportManagerCommit(
  pathToModule(stageDir, "dist/source/exports.ts")
);

export default
class StructureDictionaries extends StructureMetaDictionaries
{
  readonly decoratorParts = new WeakMap<DecoratorImplMeta, DecoratorParts>;
  readonly structureParts = new WeakMap<StructureImplMeta, StructureParts>;

  readonly publicExports = PublicExports;
  readonly internalExports = InternalExports;

  readonly #decoratorHooks = new Map<string, DecoratorHook>;
  readonly #structureHooks = new Map<string, StructureHook>;

  saveDecoratorHook?: DecoratorSaveHook;
  saveStructureHook?: StructureSaveHook;

  addDecoratorHook(
    name: string,
    hook: DecoratorHook
  ): void
  {
    this.#decoratorHooks.set(name, hook);
  }

  addStructureHook(
    name: string,
    hook: StructureHook
  ): void
  {
    this.#structureHooks.set(name, hook);
  }

  async build(): Promise<void>
  {
    const decoratorNames: string[] = Array.from(this.decorators.keys());
    const structureNames: string[] = Array.from(this.structures.keys());

    await Promise.all([
      PromiseAllParallel(decoratorNames, name => this.runDecoratorHooks(name)),
      PromiseAllParallel(structureNames, name => this.runStructureHooks(name)),
    ]);
  }

  /** public for debugging purposes */
  async runDecoratorHooks(
    name: string
  ): Promise<void>
  {
    assert(this.saveDecoratorHook, "save decorator hook is missing?");

    const entries: [string, DecoratorHook][] = Array.from(this.#decoratorHooks.entries());
    const decorator: DecoratorImplMeta = this.decorators.get(name)!

    const errors: unknown[] = [];

    entries.forEach(([hookName, hook]) => {
      try {
        hook(name, decorator, this);
      }
      catch (ex) {
        console.error(`Failed on decorator ${name} with hook ${hookName}`);
        errors.push(ex);
      }
    }, this);

    if (errors.length === 0) {
      try {
        await this.saveDecoratorHook(name, decorator, this);
      }
      catch (ex) {
        console.error(`Failed on decorator ${name} with save hook`);
        errors.push(ex);
      }
    }
    if (errors.length) {
      throw new AggregateError(errors);
    }
  }

  /** public for debugging purposes */
  async runStructureHooks(
    name: string
  ): Promise<void>
  {
    assert(this.saveStructureHook, "save structure hook is missing?");

    const entries: [string, StructureHook][] = Array.from(this.#structureHooks.entries());
    const structure: StructureImplMeta = this.structures.get(name)!;

    const errors: unknown[] = [];

    entries.forEach(([hookName, hook]) => {
      try {
        hook(name, structure, this);
      }
      catch (ex) {
        console.error(`Failed on structure ${name} with hook ${hookName}`);
        errors.push(ex);
      }
    }, this);

    if (errors.length === 0) {
      try {
        await this.saveStructureHook(name, structure, this);
      }
      catch (ex) {
        console.error(`Failed on structure ${name} with save hook`);
        errors.push(ex);
      }
    }

    if (errors.length) {
      throw new AggregateError(errors);
    }
  }
}
