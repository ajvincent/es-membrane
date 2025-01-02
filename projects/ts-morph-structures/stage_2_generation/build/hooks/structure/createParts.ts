import path from "path";

import {
  ClassDeclarationImpl,
  LiteralTypedStructureImpl,
  InterfaceDeclarationImpl,
  SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import StructureDictionaries, {
  MetaPartsType,
  type StructureParts
} from "#stage_two/generation/build/StructureDictionaries.js";

import type {
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import StructureMixinWriter from "#stage_two/generation/build/utilities/StructureMixinWriter.js";

import {
  distDir
} from "#stage_two/generation/build/constants.js";
import defineCopyFieldsMethod from "#stage_two/generation/build/utilities/defineCopyFieldsMethod.js";

import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import ImportManager from "#stage_two/generation/build/utilities/public/ImportManager.js";
import TypeMembersMap from "#stage_two/generation/build/utilities/public/TypeMembersMap.js";

import {
  getClassInterfaceName,
  getStructureClassBaseName,
  getStructureImplName,
} from "#utilities/source/StructureNameTransforms.js";

export default function createStructureParts(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts: Partial<StructureParts> = {
    partsType: MetaPartsType.STRUCTURE,
  };
  parts.classDecl = new ClassDeclarationImpl;
  parts.classDecl.name = getStructureImplName(meta.structureName);
  parts.classDecl.isDefaultExport = true;
  parts.classDecl.extendsStructure = new LiteralTypedStructureImpl(getStructureClassBaseName(name));

  parts.classFieldsStatements = new ClassFieldStatementsMap;
  parts.classMembersMap = new ClassMembersMap;

  parts.classImplementsMap = new TypeMembersMap;
  parts.classImplementsIfc = new InterfaceDeclarationImpl(getClassInterfaceName(meta.structureName));
  parts.classImplementsIfc.isExported = true;
  //parts.classImplementsIfc.extendsSet.add(meta.structureName);
  parts.implementsImports = new ImportManager(
    path.join(distDir, "source/interfaces/standard", parts.classImplementsIfc.name + ".d.ts")
  );

  parts.classDecl.implementsSet.add(new LiteralTypedStructureImpl(parts.classImplementsIfc.name));

  parts.sourceFile = new SourceFileImpl;

  parts.importsManager = new ImportManager(
    path.join(distDir, "source", "structures", "standard", parts.classDecl.name + ".ts")
  );

  // still necessary for the "satisfies" statement
  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      name,
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: "type-fest",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "Class",
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "ExtractStructure",
    ]
  });

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      parts.classImplementsIfc.name,
    ]
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: parts.implementsImports.absolutePathToModule,
    isDefaultExport: false,
    isType: true,
    exportNames: [ parts.classImplementsIfc.name ]
  });

  parts.mixinBaseWriter = StructureMixinWriter(
    meta, parts.importsManager, dictionaries, dictionaries.getDecoratorCountMap()
  );

  parts.copyFields = defineCopyFieldsMethod(
    meta,
    parts as Pick<
      StructureParts,
      "classDecl" | "classFieldsStatements" | "classMembersMap" | "importsManager"
    >,
    dictionaries
  );

  parts.moduleInterfaces = [];

  dictionaries.structureParts.set(meta, parts as StructureParts);
}
