import {
  SourceFileImpl,
  TypeAliasDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  distDir,
} from "../build/constants.js";

import BaseModule from "./BaseModule.js";
import { pathToModule } from "#utilities/source/AsyncSpecModules.js";

class UnionsModuleBase extends BaseModule
{
  constructor() {
    super(pathToModule(distDir, "source/types"), "StructureImplUnions", true);
  }
  readonly aliases = new Map<string, TypeAliasDeclarationImpl>;

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
