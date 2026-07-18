import fs from "fs/promises";
import path from "path";
import StructureDictionaries from "./StructureDictionaries.js";

import {
  projectDir,
} from "./constants.js";

import {
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

export default async function defineExistingExports(
  dictionaries: StructureDictionaries,
  distDir: string
): Promise<void> {
  definePublicExports(dictionaries, distDir);
  defineInternalExports(dictionaries, distDir);
  await defineTypeStructurePublicExports(dictionaries, distDir);
}

function definePublicExports(
  dictionaries: StructureDictionaries,
  distDir: string
): void
{
  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/TypeStructureKind.ts"),
    exportNames: ["TypeStructureKind"],
    isDefaultExport: false,
    isType: false
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/TypeStructureKind.ts"),
    exportNames: ["KindedTypeStructure"],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/TypeStructureSet.ts"),
    exportNames: ["TypeStructureSet"],
    isDefaultExport: false,
    isType: true,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/bootstrap/getTypeAugmentedStructure.ts"),
    exportNames: [
      "getTypeAugmentedStructure",
    ],
    isDefaultExport: true,
    isType: false
  });


  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/bootstrap/getTypeAugmentedStructure.ts"),
    exportNames: [
      "TypeNodeToTypeStructureConsole"
    ],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/bootstrap/parseLiteralType.ts"),
    exportNames: [
      "parseLiteralType"
    ],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/bootstrap/typeNodeConsoles.ts"),
    exportNames: [
      "VoidTypeNodeToTypeStructureConsole"
    ],
    isDefaultExport: false,
    isType: false
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/ConditionalTypeStructureImpl.ts"),
    exportNames: ["ConditionalTypeStructureParts"],
    isDefaultExport: false,
    isType: true,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/FunctionTypeStructureImpl.ts"),
    exportNames: ["FunctionWriterStyle"],
    isDefaultExport: false,
    isType: false
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/FunctionTypeStructureImpl.ts"),
    exportNames: ["FunctionTypeContext"],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/PrefixOperatorsTypeStructureImpl.ts"),
    exportNames: ["PrefixUnaryOperator"],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/TypeStructures.ts"),
    exportNames: [
      "TypeStructures",
      "TypeStructuresOrNull"
    ],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/ClassFieldStatementsMap.ts"),
    exportNames: ["ClassFieldStatementsMap"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/ClassMembersMap.ts"),
    exportNames: ["ClassMembersMap"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/ExportManager.ts"),
    exportNames: ["ExportManager"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/ImportManager.ts"),
    exportNames: ["ImportManager"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/MemberedTypeToClass.ts"),
    exportNames: ["MemberedTypeToClass"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/MemberedTypeToClass.ts"),
    exportNames: ["ClassSupportsStatementsFlags"],
    isDefaultExport: false,
    isType: false
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/TypeMembersMap.ts"),
    exportNames: ["TypeMembersMap"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/TypeMembersMap.ts"),
    exportNames: ["ReadonlyTypeMembersMap"],
    isDefaultExport: false,
    isType: true,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/forEachAugmentedStructureChild.ts"),
    exportNames: ["forEachAugmentedStructureChild"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/types/toolbox.d.ts"),
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

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/StructureImplUnions.d.ts"),
    exportNames: [], // export all the union types
    isDefaultExport: false,
    isType: true
  });

  dictionaries.publicExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/TypeAndTypeStructureInterfaces.d.ts"),
    exportNames: [],
    isDefaultExport: false,
    isType: true
  });
}

function defineInternalExports(
  dictionaries: StructureDictionaries,
  distDir: string
): void
{
  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/array-utilities/ReadonlyArrayProxyHandler.ts"),
    exportNames: ["ReadonlyArrayProxyHandler"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/bootstrap/structureToSyntax.ts"),
    exportNames: ["StructureKindToSyntaxKindMap"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/StructureBase.ts"),
    exportNames: ["StructureBase"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/StructureClassesMap.ts"),
    exportNames: ["StructureClassesMap"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/TypeAccessors.ts"),
    exportNames: ["TypeAccessors"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/TypeStructureClassesMap.ts"),
    exportNames: ["TypeStructureClassesMap"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/TypeStructureSet.ts"),
    exportNames: ["TypeStructureSetInternal"],
    isDefaultExport: true,
    isType: false,
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/base/symbolKeys.ts"),
    exportNames: [
      "COPY_FIELDS",
      "REPLACE_WRITER_WITH_STRING",
      "STRUCTURE_AND_TYPES_CHILDREN"
    ],
    isDefaultExport: false,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/TypeStructuresBase.ts"),
    exportNames: ["TypeStructuresBase"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/TypeStructuresWithChildren.ts"),
    exportNames: ["TypeStructuresWithChildren"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/structures/type/TypeStructuresWithTypeParameters.ts"),
    exportNames: ["TypeStructuresWithTypeParameters"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/DefaultMap.ts"),
    exportNames: [
      "DefaultMap",
      "DefaultWeakMap",
    ],
    isDefaultExport: false,
    isType: false,
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/toolbox/MemberedStatementsKeyClass.ts"),
    exportNames: ["MemberedStatementsKeyClass"],
    isDefaultExport: true,
    isType: false
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/CloneableStructure.d.ts"),
    exportNames: [
      "CloneableStructure",
      "CloneableTypeStructure",
    ],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/ExtractStructure.d.ts"),
    exportNames: ["ExtractStructure"],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/RightExtendsLeft.d.ts"),
    exportNames: ["RightExtendsLeft"],
    isDefaultExport: false,
    isType: true
  });

  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/StructureClassToJSON.d.ts"),
    exportNames: ["StructureClassToJSON"],
    isDefaultExport: false,
    isType: true
  });


  dictionaries.internalExports.addExports({
    absolutePathToModule: path.join(distDir, "source/types/ts-morph-typednodewriter.ts"),
    exportNames: ["TypedNodeWriter"],
    isDefaultExport: false,
    isType: true
  });
}

async function defineTypeStructurePublicExports(
  dictionaries: StructureDictionaries,
  distDir: string,
): Promise<void>
{
  const sourceDir = pathToModule(projectDir, "stage_2_integration/source/structures/type");
  const typeStructureFiles = (await fs.readdir(
    sourceDir
  )).filter(f => f.endsWith("TypeStructureImpl.ts"));
  typeStructureFiles.forEach((moduleFileName) => {
    dictionaries.publicExports.addExports({
      absolutePathToModule: path.join(distDir, "source/structures/type", moduleFileName),
      exportNames: [moduleFileName.replace(".ts", "")],
      isDefaultExport: true,
      isType: false
    });
  });
}
