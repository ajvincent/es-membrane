import path from "path";

import {
  ClassDeclarationImpl,
  InterfaceDeclarationImpl,
  SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  distDir
} from "#stage_two/generation/build/constants.js";

import StructureDictionaries, {
  DecoratorParts,
  MetaPartsType,
} from "#stage_two/generation/build/StructureDictionaries.js";
import type {
  DecoratorImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import defineCopyFieldsMethod from "#stage_two/generation/build/utilities/defineCopyFieldsMethod.js";
import defineDecoratorImports from "#stage_two/generation/build/utilities/defineDecoratorImports.js";
import defineDecoratorWrapper from "#stage_two/generation/build/utilities/defineDecoratorWrapper.js";
import defineFieldsType from "#stage_two/generation/build/utilities/defineFieldsType.js";

import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import TypeMembersMap from "#stage_two/generation/build/utilities/public/TypeMembersMap.js";
import ImportManager from "#stage_two/generation/build/utilities/public/ImportManager.js";

import {
  getClassInterfaceName,
  getStructureMixinName,
} from "#utilities/source/StructureNameTransforms.js";

export default function createDecoratorParts(
  name: string,
  meta: DecoratorImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts: Partial<DecoratorParts> = {
    partsType: MetaPartsType.DECORATOR,
  };
  parts.classDecl = new ClassDeclarationImpl;
  parts.classDecl.name = getStructureMixinName(meta.structureName);
  parts.classDecl.extends = "baseClass";

  parts.classFieldsStatements = new ClassFieldStatementsMap;
  parts.classMembersMap = new ClassMembersMap;

  parts.classImplementsMap = new TypeMembersMap;
  parts.classImplementsIfc = new InterfaceDeclarationImpl(getClassInterfaceName(meta.structureName));
  parts.classImplementsIfc.isExported = true;
  parts.implementsImports = new ImportManager(
    path.join(distDir, "source/interfaces/standard", parts.classImplementsIfc.name + ".d.ts")
  );

  parts.importsManager = defineDecoratorImports(meta, parts.classDecl.name);
  parts.sourceFile = new SourceFileImpl;

  parts.copyFields = defineCopyFieldsMethod(
    meta,
    parts as Pick<
      DecoratorParts,
      "classDecl" | "classFieldsStatements" | "classMembersMap" | "importsManager"
    >,
    dictionaries
  );

  const {
    fieldType,
    instanceFieldsArgumented
  } = defineFieldsType(meta.structureName, parts.importsManager, dictionaries);

  parts.fieldsTypeAlias = fieldType;
  parts.fieldsInstanceType = instanceFieldsArgumented;
  if (!parts.fieldsTypeAlias.name) {
    throw new Error("no type alias name?  " + name);
  }
  parts.wrapperFunction = defineDecoratorWrapper(meta, parts.classDecl, parts.fieldsTypeAlias);
  if (!parts.wrapperFunction.name) {
    throw new Error("no name for wrapper function? " + name);
  }

  parts.moduleInterfaces = [];

  dictionaries.publicExports.addExports({
    absolutePathToModule: parts.implementsImports.absolutePathToModule,
    isDefaultExport: false,
    isType: true,
    exportNames: [ parts.classImplementsIfc.name ]
  });

  dictionaries.decoratorParts.set(meta, parts as DecoratorParts);
}
