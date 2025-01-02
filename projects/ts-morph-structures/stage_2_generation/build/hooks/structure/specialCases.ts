import {
  CodeBlockWriter,
  StructureKind,
  VariableDeclarationKind,
  type WriterFunction
} from "ts-morph";

import StructureDictionaries, {
  type StructureParts
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  StructureImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  GetAccessorDeclarationImpl,
  LiteralTypedStructureImpl,
  ParameterDeclarationImpl,
  SetAccessorDeclarationImpl,
  UnionTypedStructureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ClassFieldStatementsMap from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";

import {
  COPY_FIELDS_NAME
} from "../../constants.js";

export default function structureSpecialCases(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts = dictionaries.structureParts.get(meta)!;
  switch (parts.classDecl.name) {
    case "ExportDeclarationImpl":
      makeAttributesPropertyOptional(parts, dictionaries);
      break;

    case "GetAccessorDeclarationImpl":
      addReturnTypeToGetAccessorCtor(parts, dictionaries);
      break;

    case "ImportDeclarationImpl":
      makeAttributesPropertyOptional(parts, dictionaries);
      break;

    case "IndexSignatureDeclarationImpl":
      convertKeyTypePropertyToAccessors(parts, dictionaries);
      break;

    case "SetAccessorDeclarationImpl":
      addParameterToSetAccessorCtor(parts, dictionaries);
      break;

    case "TypeAliasDeclarationImpl":
      allowTypeStructureInConstructor(parts, dictionaries);
      convertTypePropertyToAccessors(parts, dictionaries);
      break;
  }
}

function convertKeyTypePropertyToAccessors(
  parts: StructureParts,
  dictionaries: StructureDictionaries,
): void
{
  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: ["REPLACE_WRITER_WITH_STRING"],
    isDefaultImport: false,
    isTypeOnly: false,
  });

  const propertyName = ClassMembersMap.keyFromName(StructureKind.Property, false, "keyType");
  const getterName = ClassMembersMap.keyFromName(StructureKind.GetAccessor, false, "keyType");
  const setterName = ClassMembersMap.keyFromName(StructureKind.SetAccessor, false, "keyType");

  const setter = parts.classMembersMap.getAsKind(
    setterName,
    StructureKind.SetAccessor
  )!;

  const initializer = parts.classFieldsStatements.get(
    propertyName,
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
  )![0] as string;

  parts.classFieldsStatements.delete(
    propertyName,
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
  );

  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    getterName,
    [
      `const type = ${initializer};`,
      `return type ? StructureBase[REPLACE_WRITER_WITH_STRING](type) : undefined;`,
    ]
  );

  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    setterName,
    [
      `${initializer} = ${setter.parameters[0].name};`,
    ]
  );
}

function addReturnTypeToGetAccessorCtor(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: ["TypeStructures"],
    isDefaultImport: false,
    isTypeOnly: true
  });

  const returnTypeParam = new ParameterDeclarationImpl("returnType");
  returnTypeParam.hasQuestionToken = true;
  returnTypeParam.typeStructure = ConstantTypeStructures.TypeStructures;

  const ctor = parts.classMembersMap.getAsKind<StructureKind.Constructor>(
    "constructor", StructureKind.Constructor
  )!;
  ctor.parameters.push(returnTypeParam);

  parts.classFieldsStatements.set("returnType", "constructor", [
    `if (returnType) {
      this.returnTypeStructure = returnType;
    }`
  ]);
}

function addParameterToSetAccessorCtor(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: ["ParameterDeclarationImpl"],
    isDefaultImport: false,
    isTypeOnly: false
  });

  const setterParam = new ParameterDeclarationImpl("setterParameter");
  setterParam.typeStructure = new LiteralTypedStructureImpl("ParameterDeclarationImpl");

  const ctor = parts.classMembersMap.getAsKind<StructureKind.Constructor>(
    "constructor", StructureKind.Constructor
  )!;
  ctor.parameters.push(setterParam);

  parts.classFieldsStatements.set("setterParameter", "constructor", [
    "this.parameters.push(setterParameter);"
  ]);

  const cloneStatements = parts.classFieldsStatements.get(
    "(body)", "static clone"
  )!;

  const valueParamStatement = new VariableStatementImpl();
  valueParamStatement.declarationKind = VariableDeclarationKind.Const;
  const valueParamDeclaration = new VariableDeclarationImpl("valueParam");
  valueParamDeclaration.type = "ParameterDeclarationImpl";
  valueParamDeclaration.initializer = `new ParameterDeclarationImpl("value");`;
  valueParamStatement.declarations.push(valueParamDeclaration);

  cloneStatements.splice(
    0, 1,
    // harder to read, I know, but also a valuable unit test
    valueParamStatement,
    `const hasSourceParameter = source.parameters && source.parameters.length > 0;`,

    // `const target = new ${classDecl.name!}(${constructorArgs.join(", ")});`,
    (cloneStatements[0] as string).replace("source.name", "source.name, valueParam")
  );

  parts.classFieldsStatements.set("valueParam", "static clone", [
    `if (hasSourceParameter) {
      // copy-fields included copying the existing parameter, so we have to drop our artificial one
      target.parameters.shift();
    }`
  ]);
}

function allowTypeStructureInConstructor(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  const ctor = parts.classMembersMap.getAsKind<StructureKind.Constructor>("constructor", StructureKind.Constructor);
  const typeParam = ctor?.parameters.find(param => param.name === "type");
  if (!typeParam)
    throw new Error("no parameter named type?");

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    importNames: ["TypeStructures"],
    isTypeOnly: true,
  });

  typeParam.typeStructure = new UnionTypedStructureImpl([
    typeParam.typeStructure!,
    ConstantTypeStructures.TypeStructures
  ]);

  const statements = parts.classFieldsStatements.get("type", "constructor")!;
  parts.classFieldsStatements.set("type", "constructor", [
    (writer: CodeBlockWriter): void => {
      writer.write(`if (typeof type === "object")`);
      writer.block(() => {
        writer.write("this.typeStructure = type;");
      });
      writer.write("else");
      writer.block(() => {
        statements.forEach((statement, index) => {
          if (typeof statement !== "string")
            throw new Error(`unexpected statement at index ${index}: ${JSON.stringify(statement)}`);
          writer.writeLine(statement);
        });
      });
    }
  ]);
}

function convertTypePropertyToAccessors(
  parts: StructureParts,
  dictionaries: StructureDictionaries,
): void
{
  parts.classMembersMap.delete(
    ClassMembersMap.keyFromName(StructureKind.Property, false, "type")
  );

  /*
  get type(): stringOrWriterFunction {
    return super.type ?? "";
  }
  set type(value: stringOrWriterFunction) {
    super.type = value;
  }
  */
  const getter = new GetAccessorDeclarationImpl("type");
  getter.returnTypeStructure = ConstantTypeStructures.stringOrWriterFunction;
  //getter.statements.push(`return super.type ?? "";`);

  const setter = new SetAccessorDeclarationImpl("type");
  const setterParam = new ParameterDeclarationImpl("value");
  setterParam.typeStructure = ConstantTypeStructures.stringOrWriterFunction;
  setter.parameters.push(setterParam);

  parts.classMembersMap.addMembers([getter, setter]);

  parts.classFieldsStatements.delete(
    "type", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
  );

  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    ClassMembersMap.keyFromMember(getter),
    [
      `return super.type ?? "";`,
    ]
  );

  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    ClassMembersMap.keyFromMember(setter),
    [
      `super.type = value;`,
    ]
  );

  void(dictionaries);
}

function makeAttributesPropertyOptional(
  parts: StructureParts,
  dictionaries: StructureDictionaries,
): void
{
  const attrsSignature = parts.classImplementsMap.getAsKind<StructureKind.PropertySignature>(
    "attributes", StructureKind.PropertySignature
  )!;

  attrsSignature.hasQuestionToken = true;
  attrsSignature.isReadonly = false;

  const attrs = parts.classMembersMap.getAsKind(
    ClassMembersMap.keyFromName(StructureKind.Property, false, "attributes"),
    StructureKind.Property,
  )!;

  attrs.hasQuestionToken = true;
  attrs.isReadonly = false;

  parts.classFieldsStatements.delete(
    "attributes", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
  );

  parts.classImplementsMap.getAsKind<StructureKind.PropertySignature>(
    "attributes", StructureKind.PropertySignature
  )!.hasQuestionToken = true;

  {
    // if (source.attributes) { target.attributes =
    const originalStatement = parts.classFieldsStatements.get("attributes", COPY_FIELDS_NAME)![0] as WriterFunction;
    const writer = new CodeBlockWriter({
      indentNumberOfSpaces: 2
    });
    originalStatement(writer);
    let statement = writer.toString();
    statement = statement.replace("if (source.attributes) {", "if (source.attributes) {\ntarget.attributes = [];");
    parts.classFieldsStatements.set("attributes", COPY_FIELDS_NAME, [statement]);
  }

  {
    // toJSON, same fix
    // if (this.attributes) { rv.attributes =
    const originalStatement = parts.classFieldsStatements.get("attributes", "toJSON")![0] as string;
    const statement = `if (this.attributes) { ${originalStatement} } else { rv.attributes = undefined; }`;
    parts.classFieldsStatements.set("attributes", "toJSON", [statement]);
  }

  void(dictionaries);
}
