import {
  WriterFunction,
} from "ts-morph";

import {
  SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import StructureDictionaries, { DecoratorParts } from "#stage_two/generation/build/StructureDictionaries.js";
import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";
import defineSatisfiesWriter from "#stage_two/generation/build/utilities/defineSatisfiesWriter.js";
import saveSourceFile from "#stage_two/generation/build/utilities/saveSourceFile.js";

import type {
  DecoratorImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

export default async function saveFiles(
  name: string,
  meta: DecoratorImplMeta,
  dictionaries: StructureDictionaries
): Promise<void>
{
  const parts = dictionaries.decoratorParts.get(meta);
  if (!parts)
    return Promise.resolve();

  await Promise.all([
    saveDecoratorFile(name, meta, dictionaries, parts),
    saveClassInterfaceFile(name, meta, dictionaries, parts)
  ]);
}

async function saveDecoratorFile(
  name: string,
  meta: DecoratorImplMeta,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts
): Promise<void>
{
  parts.sourceFile.statements = [
    "//#region preamble",
    ...parts.importsManager.getDeclarations(),
    "//#endregion preamble",
    declareConstSymbol(meta.structureName),
    parts.fieldsTypeAlias,
    ...parts.moduleInterfaces,
    parts.wrapperFunction,
    defineSatisfiesWriter(parts.wrapperFunction, parts.fieldsTypeAlias),
  ];

  const sourceFilePath = parts.importsManager.absolutePathToModule;
  dictionaries.internalExports.addExports({
    absolutePathToModule: sourceFilePath,
    isDefaultExport: true,
    isType: false,
    exportNames: [
      parts.classDecl.name!
    ]
  });
  dictionaries.internalExports.addExports({
    absolutePathToModule: sourceFilePath,
    isDefaultExport: false,
    isType: true,
    exportNames: [
      parts.fieldsTypeAlias.name
    ]
  });

  await saveSourceFile(
    sourceFilePath,
    parts.sourceFile
  );
}

function declareConstSymbol(
  name: string
): WriterFunction
{
  return writer => {
    writer.write("declare const " + name + "Key: ");
    ConstantTypeStructures.uniqueSymbol.writerFunction(writer);
    writer.writeLine(";");
  };
}

async function saveClassInterfaceFile(
  name: string,
  meta: DecoratorImplMeta,
  dictionaries: StructureDictionaries,
  parts: DecoratorParts
): Promise<void>
{
  parts.classImplementsMap.moveMembersToType(parts.classImplementsIfc);

  const sourceFile = new SourceFileImpl;
  sourceFile.statements.push(
    ...parts.implementsImports.getDeclarations(),
    parts.classImplementsIfc,
  );
  await saveSourceFile(
    parts.implementsImports.absolutePathToModule,
    sourceFile
  );
}
