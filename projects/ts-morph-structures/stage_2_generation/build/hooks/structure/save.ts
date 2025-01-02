import {
  WriterFunction,
  type CodeBlockWriter
} from "ts-morph";

import StructureDictionaries, { StructureParts } from "#stage_two/generation/build/StructureDictionaries.js";
import saveSourceFile from "#stage_two/generation/build/utilities/saveSourceFile.js";

import type {
  StructureImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  ClassDeclarationImpl,
  IndexedAccessTypedStructureImpl,
  IntersectionTypedStructureImpl,
  LiteralTypedStructureImpl,
  SourceFileImpl,
  TypeArgumentedTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";

export default async function saveFiles(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): Promise<void>
{
  const parts = dictionaries.structureParts.get(meta);
  if (!parts)
    return Promise.resolve();

  await Promise.all([
    saveStructureFile(name, meta, dictionaries, parts),
    saveClassInterfaceFile(name, meta, dictionaries, parts),
  ]);
}

async function saveStructureFile(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries,
  parts: StructureParts,
): Promise<void>
{
  parts.importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: ["StructureKind"]
  });

  parts.sourceFile.statements = [
    "//#region preamble",
    ...parts.importsManager.getDeclarations(),
    "//#endregion preamble",
    parts.mixinBaseWriter,
    ...parts.moduleInterfaces,
    parts.classDecl,
    satisfiesCloneableWriter(meta.structureName, parts.classDecl),
    addToCloneableMapWriter(meta.structureKindName, parts.classDecl)
  ];

  const sourceFilePath = parts.importsManager.absolutePathToModule;
  dictionaries.publicExports.addExports({
    absolutePathToModule: sourceFilePath,
    isDefaultExport: true,
    isType: false,
    exportNames: [
      parts.classDecl.name!
    ]
  });

  await saveSourceFile(
    sourceFilePath,
    parts.sourceFile
  );
}

function satisfiesCloneableWriter(
  structureName: string,
  classDecl: ClassDeclarationImpl
): WriterFunction
{
  const structureAsLiteral = new LiteralTypedStructureImpl(structureName);
  const classNameAsLiteral = new LiteralTypedStructureImpl(classDecl.name!);

  const intersection = new IntersectionTypedStructureImpl([
    new TypeArgumentedTypedStructureImpl(
      ConstantTypeStructures.CloneableStructure, [
        structureAsLiteral,
        classNameAsLiteral
      ]
    ),

    new TypeArgumentedTypedStructureImpl(
      ConstantTypeStructures.Class, [
        new TypeArgumentedTypedStructureImpl(
          ConstantTypeStructures.ExtractStructure,
          [
            new IndexedAccessTypedStructureImpl(
              structureAsLiteral,
              ConstantTypeStructures.kind
            )
          ],
        )
      ]
    )
  ]);

  return function(writer: CodeBlockWriter): void {
    writer.writeLine(`${classDecl.name!} satisfies `);
    intersection.writerFunction(writer);
  }
}

function addToCloneableMapWriter(
  structureKindName: string,
  classDecl: ClassDeclarationImpl
): WriterFunction
{
  return function(writer: CodeBlockWriter): void {
    writer.writeLine(`StructureClassesMap.set(StructureKind.${structureKindName}, ${classDecl.name!});`);
  }
}

async function saveClassInterfaceFile(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries,
  parts: StructureParts
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
