import path from "path";
import fs from "fs/promises";

import StructureDictionaries from "../StructureDictionaries.js";

import {
  SourceFileImpl,
  LiteralTypedStructureImpl,
  TypeAliasDeclarationImpl,
  UnionTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  getStructureImplName,
  getUnionOfStructuresName,
} from "#utilities/source/StructureNameTransforms.js";

import ImportManager from "./public/ImportManager.js";

import saveSourceFile from "./saveSourceFile.js";
import type {
  StructureUnionMeta
} from "../structureMeta/DataClasses.js";

export default async function buildImplUnions(
  dictionary: StructureDictionaries,
  distDir: string
): Promise<void>
{
  const sourceFile = new SourceFileImpl;
  const sourcePath = path.join(distDir, "source/types/StructureImplUnions.d.ts");

  const importManager = new ImportManager(sourcePath);
  const typesToImport = new Set<string>;

  const aliases: TypeAliasDeclarationImpl[] = [];

  dictionary.unions.forEach((unionStructure: StructureUnionMeta, nameOfUnion: string) => {
    const typeAlias = new TypeAliasDeclarationImpl(getUnionOfStructuresName(nameOfUnion));
    typeAlias.isExported = true;
    const unionElements: LiteralTypedStructureImpl[] = [];

    unionStructure.structureNames.forEach(name => {
      name = getStructureImplName(name);
      typesToImport.add(name);
      unionElements.push(new LiteralTypedStructureImpl(name));
    });
    unionStructure.unionKeys.forEach(name => unionElements.push(
      new LiteralTypedStructureImpl(getUnionOfStructuresName(name))
    ));

    unionElements.sort((a, b) => a.stringValue.localeCompare(b.stringValue));
    typeAlias.typeStructure = new UnionTypedStructureImpl(unionElements.filter(Boolean));

    aliases.push(typeAlias);
  });
  aliases.sort(
    (a, b) => a.name.localeCompare(b.name)
  );
  sourceFile.statements.push(...aliases);

  dictionary.publicExports.addExports({
    absolutePathToModule: sourcePath,
    isDefaultExport: false,
    isType: true,
    exportNames: [],
  });

  importManager.addImports({
    pathToImportedModule: dictionary.publicExports.absolutePathToExportFile,
    isDefaultImport: false,
    isPackageImport: false,
    isTypeOnly: true,
    importNames: Array.from(typesToImport)
  });

  sourceFile.statements.unshift(...importManager.getDeclarations());
  await fs.rm(sourcePath, { force: true });

  await saveSourceFile(sourcePath, sourceFile);
}
