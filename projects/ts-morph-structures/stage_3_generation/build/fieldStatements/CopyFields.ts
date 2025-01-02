//#region preamble
import assert from "node:assert/strict";

import {
  CodeBlockWriter,
  StructureKind,
  VariableDeclarationKind,
  WriterFunction,
} from "ts-morph";

import {
  ArrayTypeStructureImpl,
  type ClassBodyStatementsGetter,
  type ClassHeadStatementsGetter,
  GetAccessorDeclarationImpl,
  LiteralTypeStructureImpl,
  MemberedStatementsKey,
  ParenthesesTypeStructureImpl,
  QualifiedNameTypeStructureImpl,
  type PropertySignatureImpl,
  TypeArgumentedTypeStructureImpl,
  TypeStructureKind,
  type TypeStructures,
  UnionTypeStructureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringWriterOrStatementImpl,
  type stringOrWriterFunction,
  ClassSupportsStatementsFlags,
} from "#stage_two/snapshot/source/exports.js";

import {
  getClassInterfaceName,
  getStructureImplName,
  getStructureNameFromModified,
} from "#utilities/source/StructureNameTransforms.js";

import BlockStatementImpl from "../../pseudoStatements/BlockStatement.js";
import CallExpressionStatementImpl from "../../pseudoStatements/CallExpression.js";
import {
  BaseClassModule,
  InterfaceModule,
} from "../../moduleClasses/exports.js";
import FlatInterfaceMap from "#stage_three/generation/vanilla/FlatInterfaceMap.js";
import StatementGetterBase from "./GetterBase.js";
//#endregion preamble

const booleanType = LiteralTypeStructureImpl.get("boolean");
const stringType = LiteralTypeStructureImpl.get("string");
const stringOrWriterFunctionType = LiteralTypeStructureImpl.get("stringOrWriterFunction");

export default class CopyFieldsStatements extends StatementGetterBase
implements ClassHeadStatementsGetter, ClassBodyStatementsGetter
{
  static #getStructureKind(
    structureName: string
  ): string
  {
    const vanillaInterface = FlatInterfaceMap.get(structureName)!;
    const kindProperty = vanillaInterface.properties.find(prop => prop.name === "kind")!;
    assert.equal(kindProperty.typeStructure?.kind,
      TypeStructureKind.QualifiedName,
      "expected qualified name for structure name's kind: " + structureName
    );

    assert.equal(kindProperty.typeStructure.childTypes[0], "StructureKind");
    return kindProperty.typeStructure.childTypes[1];
  }

  constructor(
    module: BaseClassModule,
  )
  {
    super(
      module,
      "CopyFieldsStatements",
      ClassSupportsStatementsFlags.HeadStatements |
      ClassSupportsStatementsFlags.BodyStatements
    );
  }

  filterHeadStatements(key: MemberedStatementsKey): boolean {
    return this.#accept(key);
  }

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.fieldKey === "kind")
      return false;
    return this.#accept(key);
  }

  #accept(
    key: MemberedStatementsKey
  ): boolean
  {
    if (key.statementGroupKey !== "static [COPY_FIELDS]")
      return false;
    if (key.isFieldStatic === true)
      return false;
    if (key.fieldKey.endsWith("Set"))
      return false;

    return true;
  }

  getHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [
      `super[COPY_FIELDS](source, target);`
    ];
  }

  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    if (key.fieldType?.kind === StructureKind.GetAccessor) {
      return this.#getCopyTypeStatements(key.fieldType);
    }

    assert.equal(
      key.fieldType?.kind,
      StructureKind.PropertySignature,
      "not a property?  " + (key.fieldType ? StructureKind[key.fieldType.kind] : "(undefined)"));

    if (key.fieldType.name.startsWith("#"))
      return [];

    assert(key.fieldType.typeStructure, "no type structure?");

    switch (key.fieldType.typeStructure.kind) {
      case TypeStructureKind.Literal:
        return this.#getStatementsForLiteralType(key.fieldType, key.fieldType.typeStructure);
      case TypeStructureKind.Array:
        return this.#getStatementsForArrayType(key.fieldType, key.fieldType.typeStructure.objectType);
      case TypeStructureKind.Union:
        return this.#getStatementsForUnionType(key.fieldType, key.fieldType.typeStructure.childTypes);
    }

    throw new Error(
      `unexpected field type structure: ${this.baseName}:${key.fieldType.name}, ${
        TypeStructureKind[key.fieldType.typeStructure.kind]
      }`
    );
  }

  //#region literal type
  #getStatementsForLiteralType(
    fieldType: PropertySignatureImpl,
    typeStructure: LiteralTypeStructureImpl
  ): readonly stringOrWriterFunction[]
  {
    let statement: stringOrWriterFunction;

    if (fieldType.name === "scope")
      this.module.addImports("ts-morph", [], ["Scope"]);

    switch (fieldType.name) {
      case "declarationKind":
      case "initializer":
      case "name":
      case "scope":
      case "variance":
        statement = this.#getAssignmentStatement(fieldType.name);
        if (fieldType.hasQuestionToken)
          statement = this.#getIfSourceStatement(false, fieldType.name, statement);
        return [statement];
    }

    const originalField = this.#getOriginalField(fieldType.name);

    switch (typeStructure) {
      case booleanType:
        statement = this.#getAssignmentStatement(fieldType.name);
        if (originalField.hasQuestionToken) {
          statement += " ?? false";
        }
        return [statement];

      case stringType:
      case stringOrWriterFunctionType:
        statement = `target.${fieldType.name} = source.${fieldType.name}`;
        if (fieldType.hasQuestionToken) {
          statement = this.#getIfSourceStatement(false, fieldType.name, statement);
        }
        else if (originalField.hasQuestionToken) {
          statement += ` ?? ""`;
        }
        return [statement];
    }

    return [];
  }

  #getAssignmentStatement(
    name: string
  ): string
  {
    return `target.${name} = source.${name}`;
  }

  #getIfSourceStatement(
    isElse: boolean,
    name: string,
    body: string,
  ): WriterFunction
  {
    return new BlockStatementImpl(
      `${isElse ? "else " : ""}if (source.${name})`,
      [body],
    ).writerFunction;
  }

  #getCopyTypeStatements(
    member: GetAccessorDeclarationImpl
  ): readonly stringWriterOrStatementImpl[]
  {
    const { name, returnTypeStructure } = member;
    if (returnTypeStructure?.kind === TypeStructureKind.Array) {
      const setName = name + "Set";

      const setStatement = (writer: CodeBlockWriter): void => {
        writer.write(`const { ${setName} } = source as unknown as ${this.module.exportName};`);
      }

      this.module.addImports("internal", ["TypeStructureSetInternal"], []);
      return [
        setStatement,
        new BlockStatementImpl(
          `if (${setName} instanceof TypeStructureSetInternal)`,
          [`target.${setName}.cloneFromTypeStructureSet(${setName});`]
        ).writerFunction,

        new BlockStatementImpl(
          `else if (Array.isArray(source.${name}))`,
          [`target.${setName}.replaceFromTypeArray(source.${name});`]
        ).writerFunction,

        new BlockStatementImpl(
          `else if (typeof source.${name} === "function")`,
          [`target.${setName}.replaceFromTypeArray([source.${name}]);`]
        ).writerFunction,
      ];
    }

    this.module.addImports("internal", ["TypeStructureClassesMap"], []);

    const name_Structure = name + "Structure";
    return [
      `const { ${name_Structure} } = source as unknown as ${this.module.exportName};`,

      new BlockStatementImpl(
        `if (${name_Structure})`,
        [`target.${name_Structure} = TypeStructureClassesMap.clone(${name_Structure});`],
      ).writerFunction,

      this.#getIfSourceStatement(true, name, `target.${name} = source.${name}`),
    ];
  }
  //#endregion literal type

  #getStatementsForArrayType(
    fieldType: PropertySignatureImpl,
    objectType: TypeStructures
  ): readonly stringWriterOrStatementImpl[]
  {
    const { name } = fieldType;

    if ((this.module.baseName === "StatementedNodeStructure") && (name === "statements")) {
      return this.#getStatementsForCloneStatements();
    }

    if ((this.module.baseName === "Structure") && (
      (name === "leadingTrivia") || (name === "trailingTrivia")
    ))
    {
      return this.#getStatementsForTrivia(name);
    }

    if (this.baseName.startsWith("Jsx")) {
      return this.#getStatementsForJSXArray(fieldType);
    }

    if (objectType.kind === TypeStructureKind.Parentheses)
      objectType = objectType.childTypes[0];

    const types = objectType.kind === TypeStructureKind.Union ? objectType.childTypes : [objectType];
    assert(types.every(t => t.kind === TypeStructureKind.Literal), `unexpected type for ${this.module.baseName}:${fieldType.name}`);

    const childTypes = types as readonly LiteralTypeStructureImpl[];

    let generatedClassName = "";

    for (const childType of childTypes) {
      if (childType === LiteralTypeStructureImpl.get("stringOrWriterFunction")) {
        this.module.addImports("public", [], ["stringOrWriterFunction"]);
      }
      else if (getStructureNameFromModified(childType.stringValue) !== childType.stringValue) {
        assert(generatedClassName === "", "generatedClassName: " + generatedClassName + ", string value: " + childType.stringValue);

        this.module.addImports("public", [], [childType.stringValue]);
        this.module.addImports("internal", ["StructureClassesMap"], []);

        generatedClassName = childType.stringValue;
      }
    }

    const originalField = this.#getOriginalField(fieldType.name);

    if (generatedClassName === "") {
      return this.#getStatementsForTSMorphArray(name, fieldType, originalField);
    }

    return this.#getStatementsForGeneratedClassArray(
      name, fieldType, objectType, generatedClassName, originalField
    );
  }

  #getStatementsForJSXArray(
    fieldType: PropertySignatureImpl
  ): stringOrWriterFunction[]
  {
    const originalField = this.#getOriginalField(fieldType.name);
    assert(originalField.hasQuestionToken, "hasQuestionToken is false: " + this.baseName + ":" + fieldType.name);
    let { typeStructure } = originalField;
    assert.equal(
      typeStructure?.kind,
      TypeStructureKind.Array,
      "expected array, got " + TypeStructureKind[typeStructure!.kind] + " " + this.baseName + ":" + fieldType.name
    );
    typeStructure = typeStructure.objectType;
    assert.equal(
      typeStructure.kind,
      TypeStructureKind.Parentheses,
      "expected parentheses, got " + TypeStructureKind[typeStructure.kind] + " " + this.baseName + ":" + fieldType.name
    );
    typeStructure = typeStructure.childTypes[0];
    assert.equal(
      typeStructure.kind,
      TypeStructureKind.Union,
      "expected union, got " + TypeStructureKind[typeStructure.kind] + " " + this.baseName + ":" + fieldType.name
    );
    assert.equal(
      typeStructure.childTypes.length,
      2,
      "expected union of two types, found " + typeStructure.childTypes.length
    );

    // eslint-disable-next-line prefer-const
    let [optionalType, requiredType] = typeStructure.childTypes;
    assert.equal(optionalType.kind, TypeStructureKind.TypeArgumented);
    assert.equal(optionalType.objectType, LiteralTypeStructureImpl.get("OptionalKind"));
    assert.equal(optionalType.childTypes.length, 1, "Expected one optional child:" + this.baseName + ":" + fieldType.name);
    optionalType = optionalType.childTypes[0];
    assert.equal(
      optionalType.kind,
      TypeStructureKind.Literal,
      "Expected one literal child for the optional: " + this.baseName + ":" + fieldType.name
    );

    assert.equal(
      requiredType.kind,
      TypeStructureKind.Literal,
      "Expected one literal child for the required: " + this.baseName + ":" + fieldType.name
    );

    this.module.addImports(
      "ts-morph",
      ["StructureKind"],
      ["OptionalKind", optionalType.stringValue, requiredType.stringValue]
    );

    const optionalKind = CopyFieldsStatements.#getStructureKind(optionalType.stringValue);
    const requiredKind = CopyFieldsStatements.#getStructureKind(requiredType.stringValue);

    let callStatement = new CallExpressionStatementImpl({
      name: "...StructureClassesMap.cloneRequiredAndOptionalArray",
      typeParameters: [
        requiredType,
        new QualifiedNameTypeStructureImpl(["StructureKind", requiredKind]),
        new TypeArgumentedTypeStructureImpl(
          LiteralTypeStructureImpl.get("OptionalKind"),
          [optionalType]
        ),
        new QualifiedNameTypeStructureImpl(["StructureKind", optionalKind]),
        LiteralTypeStructureImpl.get(getStructureImplName(requiredType.stringValue)),
        LiteralTypeStructureImpl.get(getStructureImplName(optionalType.stringValue))
      ],
      parameters: [
        `source.${fieldType.name}`,
        `StructureKind.${requiredKind}`,
        `StructureKind.${optionalKind}`
      ]
    });

    callStatement = new CallExpressionStatementImpl({
      name: `target.${fieldType.name}.push`,
      parameters: [callStatement]
    });

    return [
      new BlockStatementImpl(
        `if (source.${fieldType.name})`,
        [callStatement.writerFunction]
      ).writerFunction
    ];
  }

  #getStatementsForTSMorphArray(
    name: string,
    fieldType: PropertySignatureImpl,
    originalField: PropertySignatureImpl
  ): stringOrWriterFunction[]
  {
    let statement = new CallExpressionStatementImpl({
      name: `target.${name}.push`,
      parameters: [
        `...source.${name}`
      ]
    }).writerFunction;

    if (fieldType.hasQuestionToken) {
      statement = new BlockStatementImpl(
        `if (source.${name})`, [statement]
      ).writerFunction;
    }
    else if (originalField.hasQuestionToken) {
      statement = new BlockStatementImpl(
        `if (Array.isArray(source.${name}))`,
        [statement]
      ).writerFunction;
      return [
        statement,
        `else if (source.${name} !== undefined) { target.${name}.push(source.${name}); }`
      ]
    }

    return [statement];
  }

  #getStatementsForGeneratedClassArray(
    name: string,
    fieldType: PropertySignatureImpl,
    objectType: TypeStructures,
    generatedClassName: string,
    originalField: PropertySignatureImpl
  ): WriterFunction[]
  {
    const generatedStructureName = getStructureNameFromModified(generatedClassName);
    const generatedInterfaceName = getClassInterfaceName(generatedStructureName);
    const generatedStructureKind = InterfaceModule.structuresMap.get(generatedInterfaceName)!.structureKindName!;

    this.module.addImports(
      "ts-morph", ["StructureKind"], [generatedStructureName]
    );

    const callClone = new CallExpressionStatementImpl({
      name: "...StructureClassesMap.cloneArrayWithKind",
      typeParameters: [
        LiteralTypeStructureImpl.get(generatedStructureName),
        new QualifiedNameTypeStructureImpl([
          "StructureKind",
          generatedStructureKind
        ]),
        objectType
      ],
      parameters: [
        `StructureKind.${generatedStructureKind}`,
        new CallExpressionStatementImpl({
          name: `StructureClassesMap.forceArray`,
          parameters: [
            `source.${name}`
          ]
        })
      ]
    });

    let statement: WriterFunction = new CallExpressionStatementImpl({
      name: `target.${name}.push`,
      parameters: [
        callClone
      ]
    }).writerFunction;

    if (originalField.hasQuestionToken) {
      const statementArray: stringOrWriterFunction[] = [statement];
      if (fieldType.hasQuestionToken) {
        statementArray.unshift(`target.${name} = [];`);
      }

      statement = new BlockStatementImpl(
        `if (source.${name})`,
        statementArray
      ).writerFunction;
    }

    return [statement];
  }

  #getStatementsForUnionType(
    fieldType: PropertySignatureImpl,
    childTypes: TypeStructures[]
  ): readonly stringWriterOrStatementImpl[]
  {
    void(childTypes);
    let statement: stringWriterOrStatementImpl = `target.${fieldType.name} = source.${fieldType.name};`
    if (fieldType.hasQuestionToken) {
      statement = this.#getIfSourceStatement(false, fieldType.name, statement);
    }
    return [statement];
  }

  #getStatementsForTrivia(
    name: string
  ): readonly stringWriterOrStatementImpl[]
  {
    return [
      new BlockStatementImpl(
        `if (Array.isArray(source.${name}))`,
        [`target.${name}.push(...source.${name});`],
      ).writerFunction,

      new BlockStatementImpl(
        `else if (source.${name} !== undefined)`,
        [`target.${name}.push(source.${name});`],
      ).writerFunction
    ];
  }

  #getStatementsForCloneStatements(): readonly stringWriterOrStatementImpl[]
  {
    const letStatement = new VariableStatementImpl;
    letStatement.declarationKind = VariableDeclarationKind.Let;

    const statementsArrayDecl = new VariableDeclarationImpl("statementsArray");
    statementsArrayDecl.typeStructure = new ArrayTypeStructureImpl(
      new ParenthesesTypeStructureImpl(
        new UnionTypeStructureImpl([
          LiteralTypeStructureImpl.get("StatementStructureImpls"),
          LiteralTypeStructureImpl.get("stringOrWriterFunction"),
        ])
      )
    );
    statementsArrayDecl.initializer = `[]`;
    letStatement.declarations.push(statementsArrayDecl);

    const isArrayStatement = new BlockStatementImpl(
      `if (Array.isArray(source.statements))`,
      [
        "statementsArray = source.statements as (StatementStructureImpls | stringOrWriterFunction)[];"
      ],
    );

    const isDefined = new BlockStatementImpl(
      `else if (source.statements !== undefined)`,
      [
        `statementsArray = [source.statements];`
      ],
    )

    const pushCall = new CallExpressionStatementImpl({
      name: `target.statements.push`,
      parameters: [
        new CallExpressionStatementImpl({
          name: "...statementsArray.map",
          parameters: [
            '(statement) => StatementedNodeStructureMixin.#cloneStatement(statement)'
          ]
        }).writerFunction
      ]
    })

    this.module.addImports(
      "public",
      [], [
        "StatementStructureImpls",
        "stringOrWriterFunction",
      ]
    );

    return [
      letStatement,
      isArrayStatement.writerFunction,
      isDefined.writerFunction,
      pushCall.writerFunction
    ];
  }

  #getOriginalField(
    propertyName: string,
  ): PropertySignatureImpl
  {
    return FlatInterfaceMap.get(this.baseName)!.properties.find(prop => prop.name === propertyName)!;
  }
}
