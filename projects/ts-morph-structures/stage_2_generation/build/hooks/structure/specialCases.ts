//#region preamble
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
  JSDocImpl,
  JSDocTagImpl,
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  SetAccessorDeclarationImpl,
  StringTypedStructureImpl,
  UnionTypedStructureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ClassFieldStatementsMap, {
  type StatementsArray
} from "#stage_two/generation/build/utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "#stage_two/generation/build/utilities/public/ClassMembersMap.js";
import ConstantTypeStructures from "#stage_two/generation/build/utilities/ConstantTypeStructures.js";

import {
  COPY_FIELDS_NAME
} from "../../constants.js";
//#endregion preamble

export default function structureSpecialCases(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts: StructureParts = dictionaries.structureParts.get(meta)!;
  switch (parts.classDecl.name) {
    case "ExportDeclarationImpl":
      makeAttributesPropertyOptional(parts, dictionaries);
      break;

    case "GetAccessorDeclarationImpl":
      addReturnTypeToGetAccessorCtor(parts, dictionaries);
      break;

    case "ImportDeclarationImpl":
      makeAttributesPropertyOptional(parts, dictionaries);
      addWithTypesArgumentToClone(parts, dictionaries);
      break;

    case "IndexSignatureDeclarationImpl":
      convertKeyTypePropertyDescriptor(parts, dictionaries);
      break;

    case "SetAccessorDeclarationImpl":
      addParameterToSetAccessorCtor(parts, dictionaries);
      break;

    case "TypeAliasDeclarationImpl":
      allowTypeStructureInConstructor(parts, dictionaries);
      setDefaultTypeAliasDeclarationType(parts, dictionaries);
      break;
  }
}

function convertKeyTypePropertyDescriptor(
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

  const ctorKey: string = ClassMembersMap.keyFromName(StructureKind.Constructor, false, "constructor");
  const accessorPropName = `#keyTypeAccessors`;

  parts.classFieldsStatements.set(
    accessorPropName,
    ctorKey,
    [
      `// keyType is getting lost in ts-morph clone operations`,
      `const keyTypeAccessors = new TypeAccessors;`,
      `this.${accessorPropName} = keyTypeAccessors`,
      `
      Reflect.defineProperty(this, "keyType", {
        configurable: false,
        enumerable: true,

        get: function(): string | undefined {
          const type = keyTypeAccessors.type;
          return type !== undefined ? StructureBase[REPLACE_WRITER_WITH_STRING](type) : undefined;
        },

        set: function(value: string | undefined): void {
          keyTypeAccessors.type = value;
        }
      });
      `
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

  // fix type initializer
  const typeProperty = parts.classMembersMap.getAsKind("type", StructureKind.Property)!;
  typeProperty.initializer = `""`;
}

function setDefaultTypeAliasDeclarationType(
  parts: StructureParts,
  dictionaries: StructureDictionaries
): void
{
  void dictionaries;

  const statements: StatementsArray = parts.classFieldsStatements.get("#typeAccessors", "constructor")!;
  let lastStatement = statements.pop() as string;
  lastStatement = lastStatement.replace(`(this, "type");`, `(this, "type", "");`);
  statements.push(lastStatement);

  const getterName: string = ClassMembersMap.keyFromName(StructureKind.GetAccessor, false, "typeStructure");

  const typeStructureGetter: GetAccessorDeclarationImpl = parts.classMembersMap.getAsKind(
    getterName,
    StructureKind.GetAccessor,
  )!;
  typeStructureGetter.returnTypeStructure = ConstantTypeStructures.TypeStructures;

  parts.classFieldsStatements.set(
    getterName,
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    [ `this.#typeAccessors.typeStructure!` ]
  );

  const typeStructureSetter: SetAccessorDeclarationImpl = parts.classMembersMap.getAsKind(
    ClassMembersMap.keyFromName(StructureKind.SetAccessor, false, "typeStructure"),
    StructureKind.SetAccessor
  )!;
  const firstParameter: ParameterDeclarationImpl = typeStructureSetter.parameters[0];
  firstParameter.typeStructure = ConstantTypeStructures.TypeStructures;
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

function addWithTypesArgumentToClone(
  parts: StructureParts,
  dictionaries: StructureDictionaries,
): void
{
  void dictionaries;

  const staticCloneKey = ClassMembersMap.keyFromName(StructureKind.Method, true, "clone");
  const cloneMethod: MethodDeclarationImpl = parts.classMembersMap.getAsKind(staticCloneKey, StructureKind.Method)!;
  const withTypesArg = new ParameterDeclarationImpl("withTypesArg");
  cloneMethod.parameters.push(withTypesArg);
  withTypesArg.hasQuestionToken = true;
  withTypesArg.typeStructure = new UnionTypedStructureImpl([
    new StringTypedStructureImpl("typesOnly"),
    new StringTypedStructureImpl("excludeTypes"),
  ]);

  {
    const jsDoc = cloneMethod.docs[0] as JSDocImpl;
    const withTypesTag = new JSDocTagImpl("param");
    withTypesTag.text = `withTypesArg - When "typesOnly", the clone has only type imports.  When "excludeTypes", the clone has no type imports.`;
    jsDoc.tags.push(withTypesTag);
  }

  /*
  classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    ClassMembersMap.keyFromMember(cloneMethod),
    [
      `return target;`
    ]
  );
  */
  {
    const statements: StatementsArray = parts.classFieldsStatements.get(
      ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
      staticCloneKey
    )!;
    statements.unshift(`
      if (withTypesArg) {
        const typesOnly = withTypesArg === "typesOnly";
        const filteredImports = target.namedImports.filter(
          namedImport => this.#namedImportsTypeFilter(namedImport, typesOnly)
        ) as readonly ImportSpecifierImpl[];
        for (const namedImport of filteredImports) {
          namedImport.isTypeOnly = false;
        }
        target.namedImports.splice(0, target.namedImports.length, ...filteredImports);
        target.isTypeOnly = typesOnly;
        if (typesOnly)
          delete target.defaultImport;
      }
    `);
  }

  const namedImportsTypeFilter = new MethodDeclarationImpl(
    "#namedImportsTypeFilter"
  );
  namedImportsTypeFilter.isStatic = true;
  namedImportsTypeFilter.returnTypeStructure = ConstantTypeStructures.boolean;
  {
    const thisParam = new ParameterDeclarationImpl("this");
    thisParam.typeStructure = ConstantTypeStructures.void;
    namedImportsTypeFilter.parameters.push(thisParam);
  }
  {
    const namedImport = new ParameterDeclarationImpl("namedImport");
    namedImport.typeStructure = new UnionTypedStructureImpl([
      new LiteralTypedStructureImpl("ImportSpecifierImpl"),
      ConstantTypeStructures.stringOrWriterFunction
    ]);
    namedImportsTypeFilter.parameters.push(namedImport);
  }
  {
    const withTypes = new ParameterDeclarationImpl("withTypes");
    withTypes.typeStructure = ConstantTypeStructures.boolean;
    namedImportsTypeFilter.parameters.push(withTypes);
  }

  namedImportsTypeFilter.statements.push(`
    if (typeof namedImport !== "object") {
      throw new Error("cannot process string or writer functions");
    }
    return namedImport.isTypeOnly === withTypes;
  `.trim());

  parts.classMembersMap.addMembers([namedImportsTypeFilter]);
}
