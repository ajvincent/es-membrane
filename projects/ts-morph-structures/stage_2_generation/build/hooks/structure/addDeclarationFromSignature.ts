import {
  Scope
} from "ts-morph";

import StructureDictionaries, {
  type StructureParts
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  StructureImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";

export default function addDeclarationFromSignature(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts = dictionaries.structureParts.get(meta)!;
  switch (parts.classDecl.name) {
    case "ConstructorDeclarationImpl":
      convertConstructor(parts, dictionaries);
      break;
    case "MethodDeclarationImpl":
      convertMethod(parts, dictionaries);
      break;
    case "PropertyDeclarationImpl":
      convertProperty(parts, dictionaries);
      break;
  }
}

function convertConstructor(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  addImport(parts, dictionaries, true, true, "JSDocImpl");
  addImport(parts, dictionaries, true, true, "ParameterDeclarationImpl");
  addImport(parts, dictionaries, true, true, "TypeParameterDeclarationImpl");
  addImport(parts, dictionaries, false, false, "TypeStructureClassesMap");
  const signatureImplClass = "ConstructSignatureDeclarationImpl";

  const groupName = createFromSignatureMethod(signatureImplClass, false, parts, dictionaries);
  setHeadAndTail(parts, groupName, "");
  copyDocs(parts, groupName);
  copyTrivia(parts, groupName);

  parts.classFieldsStatements.set("typeParameters", groupName, [
    `declaration.typeParameters.push(
      ...StructureClassesMap.cloneArray<
        TypeParameterDeclarationImpl | string,
        TypeParameterDeclarationImpl | string
      >(signature.typeParameters),
    );`
  ]);
  parts.classFieldsStatements.set("parameters", groupName, [
    `declaration.parameters.push(
      ...StructureClassesMap.cloneArray<
        ParameterDeclarationImpl,
        ParameterDeclarationImpl
      >(signature.parameters)
    );`,
  ]);
  parts.classFieldsStatements.set("returnType", groupName, [
    `if (signature.returnTypeStructure) {
      declaration.returnTypeStructure = TypeStructureClassesMap.clone(signature.returnTypeStructure);
    }`,
  ]);
}

function convertMethod(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  addImport(parts, dictionaries, true, true, "JSDocImpl");
  addImport(parts, dictionaries, true, true, "ParameterDeclarationImpl");
  addImport(parts, dictionaries, true, true, "TypeParameterDeclarationImpl");
  addImport(parts, dictionaries, false, false, "TypeStructureClassesMap");

  const signatureImplClass = "MethodSignatureImpl";
  const groupName = createFromSignatureMethod(signatureImplClass, true, parts, dictionaries);
  setHeadAndTail(parts, groupName, "isStatic, signature.name");
  copyDocs(parts, groupName);
  copyTrivia(parts, groupName);

  parts.classFieldsStatements.set("hasQuestionToken", groupName, [
    `declaration.hasQuestionToken = signature.hasQuestionToken;`
  ]);

  parts.classFieldsStatements.set("typeParameters", groupName, [
    `declaration.typeParameters.push(
      ...StructureClassesMap.cloneArray<
        TypeParameterDeclarationImpl | string,
        TypeParameterDeclarationImpl | string
      >(signature.typeParameters),
    );`
  ]);
  parts.classFieldsStatements.set("parameters", groupName, [
    `declaration.parameters.push(
      ...StructureClassesMap.cloneArray<
        ParameterDeclarationImpl,
        ParameterDeclarationImpl
      >(signature.parameters)
    );`,
  ]);
  parts.classFieldsStatements.set("returnType", groupName, [
    `if (signature.returnTypeStructure) {
      declaration.returnTypeStructure = TypeStructureClassesMap.clone(signature.returnTypeStructure);
    }`,
  ]);
}

function convertProperty(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  addImport(parts, dictionaries, true, true, "JSDocImpl");
  addImport(parts, dictionaries, false, false, "TypeStructureClassesMap");
  const signatureImplClass = "PropertySignatureImpl";
  const groupName = createFromSignatureMethod(signatureImplClass, true, parts, dictionaries);

  setHeadAndTail(parts, groupName, "isStatic, signature.name");
  copyDocs(parts, groupName);
  copyTrivia(parts, groupName);

  parts.classFieldsStatements.set("hasQuestionToken", groupName, [
    `declaration.hasQuestionToken = signature.hasQuestionToken;`
  ]);
  parts.classFieldsStatements.set("isReadonly", groupName, [
    `declaration.isReadonly = signature.isReadonly;`
  ]);
  parts.classFieldsStatements.set("type", groupName, [
    `if (signature.typeStructure) {
      declaration.typeStructure = TypeStructureClassesMap.clone(signature.typeStructure);
    }`,
  ]);
}

function createFromSignatureMethod(
  sourceType: string,
  canBeStatic: boolean,
  parts: StructureParts,
  dictionaries: StructureDictionaries
): string
{
  addImport(parts, dictionaries, true, true, sourceType);

  const method = new MethodDeclarationImpl("fromSignature");
  method.isStatic = true;
  method.scope = Scope.Public;

  if (canBeStatic) {
    const param = new ParameterDeclarationImpl("isStatic");
    param.typeStructure = ConstantTypeStructures.boolean;
    method.parameters.push(param);
  }

  {
    const param = new ParameterDeclarationImpl("signature");
    param.typeStructure = new LiteralTypedStructureImpl(sourceType);
    method.parameters.push(param);
  }
  method.returnType = parts.classDecl.name;
  parts.classMembersMap.addMembers([method]);
  return ClassMembersMap.keyFromMember(method);
}

function addImport(
  parts: StructureParts,
  dictionaries: StructureDictionaries,
  isPublic: boolean,
  isTypeOnly: boolean,
  name: string
): void
{
  const exportManager = isPublic ? dictionaries.publicExports : dictionaries.internalExports;
  parts.importsManager.addImports({
    pathToImportedModule: exportManager.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    importNames: [name],
    isTypeOnly
  });
}

function setHeadAndTail(
  parts: StructureParts,
  groupName: string,
  argumentsString?: string
): void
{
  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, groupName, [
      `const declaration = new ${parts.classDecl.name}${argumentsString ? `(${argumentsString})` : ``};`
    ]
  );

  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN, groupName, [
      `return declaration;`
    ]
  );
}

function copyDocs(
  parts: StructureParts,
  groupName: string
): void
{
  parts.classFieldsStatements.set("docs", groupName, [
    `declaration.docs.push(...StructureClassesMap.cloneArray<
      JSDocImpl | string,
      JSDocImpl | string
    >(signature.docs));`,
  ]);
}

function copyTrivia(
  parts: StructureParts,
  groupName: string
): void
{
  parts.classFieldsStatements.set("leadingTrivia", groupName, [
    `declaration.leadingTrivia.push(...signature.leadingTrivia);`,
  ]);
  parts.classFieldsStatements.set("trailingTrivia", groupName, [
    `declaration.trailingTrivia.push(...signature.trailingTrivia);`,
  ]);
}