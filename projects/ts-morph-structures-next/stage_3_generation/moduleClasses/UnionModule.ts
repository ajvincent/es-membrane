import {
  LiteralTypeStructureImpl,
  SourceFileImpl,
  TypeAliasDeclarationImpl,
  UnionTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  pathToModule
} from "#utilities/source/AsyncSpecModules.js";

import {
  getStructureImplName,
  getUnionOfStructuresName,
} from "#utilities/source/StructureNameTransforms.js";

import {
  distDir,
} from "../build/constants.js";

import initializeTypes from "../vanilla/initializer.js";

import {
  UnionMap
} from "../vanilla/UnionMap.js";

import BaseModule from "./BaseModule.js";

class UnionsModuleBase extends BaseModule
{
  static #literalComparator(
    this: void,
    a: LiteralTypeStructureImpl,
    b: LiteralTypeStructureImpl
  ): number
  {
    return a.stringValue.localeCompare(b.stringValue);
  }

  readonly aliases = new Map<string, TypeAliasDeclarationImpl>;

  constructor() {
    super(pathToModule(distDir, "source/types"), "StructureImplUnions", true);
  }

  public fillAliases(): string[] {
    initializeTypes();
    return this.#addStructureUnion("Structures");
  }

  #addStructureUnion(
    aliasName: string
  ): string[]
  {
    const originalNames = UnionMap.get(aliasName)!;
    const childTypes: LiteralTypeStructureImpl[] = [];

    const structures: string[] = [], unions: string[] = [];
    originalNames.forEach(child => {
      if (child.endsWith("Structures")) {
        const newName = getUnionOfStructuresName(child);
        childTypes.push(LiteralTypeStructureImpl.get(newName));
        unions.push(newName);
        structures.push(...this.#addStructureUnion(child));
      }
      else {
        const newName = getStructureImplName(child);
        childTypes.push(LiteralTypeStructureImpl.get(newName));
        structures.push(child);
      }
    });

    UnionModule.addImports("public", [], structures.map(getStructureImplName));
    UnionModule.addStarExport(true, true);

    this.defineAlias(getUnionOfStructuresName(aliasName), childTypes);
    return structures;
  }

  public defineAlias(
    aliasName: string,
    childTypes: LiteralTypeStructureImpl[]
  ): void
  {
    childTypes.sort(UnionsModuleBase.#literalComparator);
    const unionStructure = new UnionTypeStructureImpl(childTypes);
    const typeAlias = new TypeAliasDeclarationImpl(aliasName, unionStructure);
    typeAlias.isExported = true;
    this.aliases.set(aliasName, typeAlias);
  }

  protected getSourceFileImpl(): SourceFileImpl {
    const structure = new SourceFileImpl;

    const unions = Array.from(this.aliases.values());
    unions.sort((a, b): number => a.name.localeCompare(b.name));

    structure.statements.push(
      ...this.importManager.getDeclarations(),
      ...unions
    );

    return structure;
  }
}

const UnionModule = new UnionsModuleBase;
export default UnionModule;
