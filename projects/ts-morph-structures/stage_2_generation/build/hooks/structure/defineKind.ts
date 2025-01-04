import StructureDictionaries from "#stage_two/generation/build/StructureDictionaries.js";
import { StructureImplMeta } from "#stage_two/generation/build/structureMeta/DataClasses.js";
import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";
import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import {
  LiteralTypedStructureImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  QualifiedNameTypedStructureImpl
} from "#stage_one/prototype-snapshot/exports.js";

export default function defineKindProperty(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts = dictionaries.structureParts.get(meta);
  if (!parts)
    return;

  const {
    classFieldsStatements,
    implementsImports,
    classImplementsMap,
    classMembersMap,
    importsManager
  } = parts;
  if (classMembersMap.has("kind"))
    return;

  const kindSignature = new PropertySignatureImpl("kind");
  kindSignature.isReadonly = true;
  kindSignature.typeStructure = new QualifiedNameTypedStructureImpl([
    ConstantTypeStructures.StructureKind,
    new LiteralTypedStructureImpl(meta.structureKindName)
  ]);
  classImplementsMap.addMembers([kindSignature]);

  implementsImports.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: ["StructureKind"]
  });

  const kindProperty = new PropertyDeclarationImpl("kind");
  kindProperty.isReadonly = true;
  kindProperty.typeStructure = new QualifiedNameTypedStructureImpl([
    ConstantTypeStructures.StructureKind,
    new LiteralTypedStructureImpl(meta.structureKindName)
  ]);

  classFieldsStatements.set("kind", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, [
    "StructureKind." + meta.structureKindName
  ]);
  classMembersMap.addMembers([kindProperty]);

  importsManager.addImports({
    pathToImportedModule: "ts-morph",
    isPackageImport: true,
    isDefaultImport: false,
    isTypeOnly: false,
    importNames: ["StructureKind"]
  });
}
