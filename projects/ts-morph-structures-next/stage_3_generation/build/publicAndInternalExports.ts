import fs from "node:fs/promises";
import path from "node:path";

import {
  distDir,
} from "./constants.js";

import {
  pathToModule,
  projectDir
} from "#utilities/source/AsyncSpecModules.js";

import {
  internalExports,
  publicExports,
} from "../moduleClasses/exports.js";

export default async function defineExistingExports(
): Promise<void> {
  definePublicExports();
  defineInternalExports();
  await Promise.all([
    defineStatementStructurePublicExports(),
    defineTypeStructurePublicExports(),
  ]);
}

function definePublicExports(): void
{
  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/StatementStructureKind.ts"),
    exportNames: ["StatementStructureKind"],
    isDefaultExport: false,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/StatementStructureKind.ts"),
    exportNames: ["KindedStatementStructure"],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/TypeStructureKind.ts"),
    exportNames: ["TypeStructureKind"],
    isDefaultExport: false,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/TypeStructureKind.ts"),
    exportNames: ["KindedTypeStructure"],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/bootstrap/getTypeAugmentedStructure.ts"),
    exportNames: [
      "getTypeAugmentedStructure",
    ],
    isDefaultExport: true,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/bootstrap/getTypeAugmentedStructure.ts"),
    exportNames: [
      "TypeNodeToTypeStructureConsole"
    ],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/bootstrap/parseLiteralType.ts"),
    exportNames: [
      "parseLiteralType"
    ],
    isDefaultExport: true,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/bootstrap/typeNodeConsoles.ts"),
    exportNames: [
      "VoidTypeNodeToTypeStructureConsole"
    ],
    isDefaultExport: false,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/statements/AugmentedStatements.ts"),
    exportNames: ["AugmentedStatementStructures"], // export all the union types
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/ConditionalTypeStructureImpl.ts"),
    exportNames: ["ConditionalTypeStructureParts"],
    isDefaultExport: false,
    isType: true,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/FunctionTypeStructureImpl.ts"),
    exportNames: ["FunctionWriterStyle"],
    isDefaultExport: false,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/FunctionTypeStructureImpl.ts"),
    exportNames: ["FunctionTypeContext"],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/PrefixOperatorsTypeStructureImpl.ts"),
    exportNames: ["PrefixUnaryOperator"],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/TypeStructures.ts"),
    exportNames: [
      "TypeStructures",
      "TypeStructuresOrNull"
    ],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/ClassFieldStatementsMap.ts"),
    exportNames: ["ClassFieldStatementsMap"],
    isDefaultExport: true,
    isType: false,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/ClassMembersMap.ts"),
    exportNames: ["ClassMembersMap"],
    isDefaultExport: true,
    isType: false,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/ExportManager.ts"),
    exportNames: ["ExportManager"],
    isDefaultExport: true,
    isType: false,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/ImportManager.ts"),
    exportNames: ["ImportManager"],
    isDefaultExport: true,
    isType: false,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/MemberedTypeToClass.ts"),
    exportNames: ["MemberedTypeToClass"],
    isDefaultExport: true,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/MemberedTypeToClass.ts"),
    exportNames: ["ClassSupportsStatementsFlags"],
    isDefaultExport: false,
    isType: false
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/TypeMembersMap.ts"),
    exportNames: ["TypeMembersMap"],
    isDefaultExport: true,
    isType: false,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/TypeMembersMap.ts"),
    exportNames: ["ReadonlyTypeMembersMap"],
    isDefaultExport: false,
    isType: true,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/forEachAugmentedStructureChild.ts"),
    exportNames: ["forEachAugmentedStructureChild"],
    isDefaultExport: true,
    isType: false,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/types/toolbox.d.ts"),
    exportNames: [
      "AccessorMirrorGetter",
      "AddExportContext",
      "AddImportContext",
      "ClassAbstractMemberQuestion",
      "ClassAsyncMethodQuestion",
      "ClassBodyStatementsGetter",
      "ClassFieldStatement",
      "ClassGeneratorMethodQuestion",
      "ClassHeadStatementsGetter",
      "ClassMemberImpl",
      "ClassScopeMemberQuestion",
      "ClassStatementsGetter",
      "ClassTailStatementsGetter",
      "ConstructorBodyStatementsGetter",
      "ConstructorHeadStatementsGetter",
      "ConstructorTailStatementsGetter",
      "IndexSignatureResolver",
      "MemberedStatementsKey",
      "NamedClassMemberImpl",
      "NamedTypeMemberImpl",
      "PropertyInitializerGetter",
      "TypeMemberImpl",
      "stringWriterOrStatementImpl",
    ],
    isDefaultExport: false,
    isType: true,
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/AugmentedStructures.d.ts"),
    exportNames: ["AugmentedStructures"],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/StructureImplUnions.d.ts"),
    exportNames: [], // export all the union types
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/TypeAndTypeStructureInterfaces.d.ts"),
    exportNames: [],
    isDefaultExport: false,
    isType: true
  });

  publicExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/stringOrWriterFunction.d.ts"),
    exportNames: ["stringOrWriterFunction"],
    isDefaultExport: false,
    isType: true
  });
}

function defineInternalExports(): void
{
  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/array-utilities/ShadowArrayImpl.ts"),
    exportNames: ["GET_OUTER_TYPE"],
    isDefaultExport: false,
    isType: false,
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/array-utilities/ShadowArrayImpl.ts"),
    exportNames: ["InnerTypeElement"],
    isDefaultExport: false,
    isType: true,
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/bootstrap/structureToSyntax.ts"),
    exportNames: ["StructureKindToSyntaxKindMap"],
    isDefaultExport: true,
    isType: false,
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/StatementStructureClassesMap.ts"),
    exportNames: ["StatementStructureClassesMap"],
    isDefaultExport: false,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/StructureBase.ts"),
    exportNames: ["StructureBase"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/StructureClassesMap.ts"),
    exportNames: ["StructureClassesMap"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/TypeAccessors.ts"),
    exportNames: ["TypeAccessors"],
    isDefaultExport: true,
    isType: false,
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/TypeStructureSequence.ts"),
    exportNames: ["TypeStructureSequence"],
    isDefaultExport: false,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/symbolKeys.ts"),
    exportNames: [
      "COPY_FIELDS",
      "REPLACE_WRITER_WITH_STRING",
      "STRUCTURE_CHILDREN"
    ],
    isDefaultExport: false,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/base/TypeStructureClassesMap.ts"),
    exportNames: ["TypeStructureClassesMap"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/TypeStructuresBase.ts"),
    exportNames: ["TypeStructuresBase"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/TypeStructuresWithChildren.ts"),
    exportNames: ["TypeStructuresWithChildren"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/type/TypeStructuresWithTypeParameters.ts"),
    exportNames: ["TypeStructuresWithTypeParameters"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/DefaultMap.ts"),
    exportNames: [
      "DefaultMap",
      "DefaultWeakMap",
    ],
    isDefaultExport: false,
    isType: false,
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/toolbox/MemberedStatementsKeyClass.ts"),
    exportNames: ["MemberedStatementsKeyClass"],
    isDefaultExport: true,
    isType: false
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/CloneableStructure.d.ts"),
    exportNames: [
      "CloneableStatementStructure",
      "CloneableStructure",
      "CloneableTypeStructure",
    ],
    isDefaultExport: false,
    isType: true
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/ExtractStructure.d.ts"),
    exportNames: ["ExtractStructure"],
    isDefaultExport: false,
    isType: true
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/RightExtendsLeft.d.ts"),
    exportNames: ["RightExtendsLeft"],
    isDefaultExport: false,
    isType: true
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/types/StructureClassToJSON.d.ts"),
    exportNames: ["StructureClassToJSON"],
    isDefaultExport: false,
    isType: true
  });

  internalExports.addExports({
    pathToExportedModule: pathToModule(distDir, "source/structures/WriterStructuresBase.ts"),
    exportNames: ["WRITER_FUNCTION_KEY", "DEREGISTER_WRITER"],
    isDefaultExport: false,
    isType: false,
  });
}

async function defineTypeStructurePublicExports(): Promise<void>
{
  const sourceDir = path.join(projectDir, "stage_2_integration/source/structures/type");
  const typeStructureFiles = (await fs.readdir(
    sourceDir
  )).filter(f => f.endsWith("TypeStructureImpl.ts"));
  typeStructureFiles.forEach((moduleFileName) => {
    publicExports.addExports({
      pathToExportedModule: pathToModule(distDir, "source/structures/type" + path.sep + moduleFileName),
      exportNames: [moduleFileName.replace(".ts", "")],
      isDefaultExport: false,
      isType: false
    });
  });
}

async function defineStatementStructurePublicExports(): Promise<void>
{
  const sourceDir = path.join(projectDir, "stage_2_integration/source/structures/statements");
  const structureFiles = (await fs.readdir(
    sourceDir
  )).filter(f => f.endsWith("StatementImpl.ts"));
  structureFiles.forEach((moduleFileName) => {
    publicExports.addExports({
      pathToExportedModule: pathToModule(distDir, "source/structures/statements" + path.sep + moduleFileName),
      exportNames: [moduleFileName.replace(".ts", "")],
      isDefaultExport: false,
      isType: false
    });
  });
}
