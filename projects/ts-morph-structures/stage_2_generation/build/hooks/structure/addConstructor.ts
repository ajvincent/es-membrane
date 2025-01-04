import {
  StructureKind
} from "ts-morph";

import StructureDictionaries from "#stage_two/generation/build/StructureDictionaries.js";

import {
  PropertyName,
  PropertyValue,
  StructureImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";

import {
  ConstructorDeclarationImpl,
  ParameterDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

const groupName = ClassMembersMap.keyFromName(StructureKind.Constructor, false, "constructor");

export default function addConstructor(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts = dictionaries.structureParts.get(meta)!;

  let constructor: ConstructorDeclarationImpl | undefined;

  const isStatic_property = parts.classMembersMap.getAsKind<StructureKind.Property>("isStatic", StructureKind.Property);
  const hasNamed = meta.decoratorKeys.has("NamedNodeStructure");

  if (Boolean(isStatic_property) || hasNamed) {
    constructor = new ConstructorDeclarationImpl;
  }

  if (isStatic_property) {
    isStatic_property.isReadonly = false;
    isStatic_property.typeStructure = ConstantTypeStructures.boolean;

    const staticParam = new ParameterDeclarationImpl("isStatic");
    staticParam.typeStructure = ConstantTypeStructures.boolean;
    constructor!.parameters.push(staticParam);
    parts.classFieldsStatements.set(
      "isStatic",
      groupName,
      ["this.isStatic = isStatic;"]
    );

    parts.classFieldsStatements.delete(
      "isStatic",
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
    );
  }

  if (hasNamed) {
    const nameParam = new ParameterDeclarationImpl("name");
    nameParam.typeStructure = ConstantTypeStructures.string;
    constructor!.parameters.push(nameParam);
    parts.classFieldsStatements.set(
      "name",
      groupName,
      ["this.name = name;"]
    );
  }

  meta.structureFields.forEach((value: PropertyValue, key: PropertyName) => {
    if (value.hasQuestionToken || value.mayBeUndefined)
      return;
    if (key === "kind")
      return;
    constructor ??= new ConstructorDeclarationImpl;

    const param = new ParameterDeclarationImpl(key);
    const existingProp = parts.classMembersMap.getAsKind<StructureKind.Property>(key, StructureKind.Property)!

    const fieldName = ClassMembersMap.keyFromName(StructureKind.Property, false, key);
    const initializerStatements = parts.classFieldsStatements.get(
      fieldName,
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
    );
    if (existingProp.typeStructure) {
      param.typeStructure = existingProp.typeStructure;
      parts.classFieldsStatements.delete(
        fieldName,
        ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
      );
    }
    else if ((initializerStatements?.length === 1) && (initializerStatements[0] === `""`)) {
      param.typeStructure = ConstantTypeStructures.string;
      existingProp.typeStructure = ConstantTypeStructures.string;
      parts.classFieldsStatements.delete(
        fieldName,
        ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
      );
    }

    constructor.parameters.push(param);
    parts.classFieldsStatements.set(
      key,
      groupName,
      [`this.${key} = ${key};`]
    );
  });

  if (constructor) {
    parts.classMembersMap.addMembers([constructor]);
    parts.classFieldsStatements.set(
      ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL,
      groupName,
      ["super()"]
    );
  }
}
