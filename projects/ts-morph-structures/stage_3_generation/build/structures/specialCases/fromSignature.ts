// #region preamble
import assert from "node:assert/strict";

import {
  CodeBlockWriter,
  StructureKind,
  VariableDeclarationKind,
  WriterFunction,
} from "ts-morph";

import {
  type ClassBodyStatementsGetter,
  type ClassHeadStatementsGetter,
  type ClassTailStatementsGetter,
  ClassSupportsStatementsFlags,
  type GetAccessorDeclarationImpl,
  LiteralTypeStructureImpl,
  type MemberedStatementsKey,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  type PropertySignatureImpl,
  TypeStructureKind,
  type TypeStructures,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringOrWriterFunction,
  type stringWriterOrStatementImpl,
  ReadonlyTypeMembersMap,
} from "#stage_two/snapshot/source/exports.js";

import {
  getClassInterfaceName,
  getStructureNameFromModified,
} from "#utilities/source/StructureNameTransforms.js";

import FlatInterfaceMap from "../../../vanilla/FlatInterfaceMap.js";

import {
  type BaseClassModule,
  InterfaceModule,
  type StructureModule,
} from "../../../moduleClasses/exports.js";

import BlockStatementImpl from "../../../pseudoStatements/BlockStatement.js";
import CallExpressionStatementImpl from "../../../pseudoStatements/CallExpression.js";
import StatementGetterBase from "../../fieldStatements/GetterBase.js";
// #endregion preamble

const DeclarationToSignature: ReadonlyMap<string, string> = new Map<string, string>([
  ["ConstructorDeclarationImpl", "ConstructSignatureDeclarationImpl"],
  ["MethodDeclarationImpl", "MethodSignatureImpl"],
  ["PropertyDeclarationImpl", "PropertySignatureImpl"]
]);

const booleanType = LiteralTypeStructureImpl.get("boolean");
const stringType = LiteralTypeStructureImpl.get("string");

export function getFromSignatureMethod(
  module: StructureModule
): MethodSignatureImpl | undefined
{
  const signatureName = DeclarationToSignature.get(module.defaultExportName);
  if (!signatureName)
    return undefined;

  module.addImports("public", [], [signatureName, "JSDocImpl"]);
  module.addImports("internal", ["TypeStructureClassesMap"], []);
  if (module.defaultExportName !== "PropertyDeclarationImpl") {
    module.addImports("public", [], ["ParameterDeclarationImpl", "TypeParameterDeclarationImpl"]);
  }

  const fromSignature = new MethodSignatureImpl("fromSignature");
  if (module.defaultExportName !== "ConstructorDeclarationImpl") {
    const param = new ParameterDeclarationImpl("isStatic");
    param.typeStructure = LiteralTypeStructureImpl.get("boolean");
    fromSignature.parameters.push(param);
  }

  {
    const param = new ParameterDeclarationImpl("signature");
    param.typeStructure = LiteralTypeStructureImpl.get(signatureName);
    fromSignature.parameters.push(param);
  }

  fromSignature.returnTypeStructure = LiteralTypeStructureImpl.get(module.defaultExportName);
  return fromSignature;
}

export class FromSignatureStatements extends StatementGetterBase
implements ClassHeadStatementsGetter, ClassBodyStatementsGetter, ClassTailStatementsGetter
{
  readonly #ctorParameters: readonly ParameterDeclarationImpl[];

  readonly declarationFlatTypeMembers: ReadonlyTypeMembersMap;
  readonly sharedKeys: ReadonlySet<string>;

  constructor(
    module: BaseClassModule,
    ctorParameters: ParameterDeclarationImpl[],
  )
  {
    super(
      module,
      "FromSignatureStatements",
      ClassSupportsStatementsFlags.HeadStatements |
      ClassSupportsStatementsFlags.BodyStatements |
      ClassSupportsStatementsFlags.TailStatements
    );
    this.#ctorParameters = ctorParameters;

    const signatureName = DeclarationToSignature.get(module.defaultExportName)!;
    const declarationTypeMembers = InterfaceModule.flatTypesMap.get(
      getClassInterfaceName(module.baseName)
    )!;
    const signatureTypeMembers = InterfaceModule.flatTypesMap.get(
      getClassInterfaceName(getStructureNameFromModified(signatureName))
    )!;

    const sharedKeys = new Set<string>;
    for (const name of declarationTypeMembers.keys()) {
      if (signatureTypeMembers.has(name)) {
        sharedKeys.add(name);
      }
    }
    this.sharedKeys = sharedKeys;
    this.declarationFlatTypeMembers = declarationTypeMembers;
  }

  filterHeadStatements(key: MemberedStatementsKey): boolean {
    return (key.statementGroupKey === "static fromSignature");
  }

  getHeadStatements(): readonly stringWriterOrStatementImpl[]
  {
    const declStatement = new VariableStatementImpl;
    declStatement.declarationKind = VariableDeclarationKind.Const;

    const declaration = new VariableDeclarationImpl("declaration");
    declStatement.declarations.push(declaration);

    /*
    const parameters: stringOrWriterFunction[] = this.#ctorParameters.map(param => {
      return `${param.name === "isStatic" ? "" : "signature."}${param.name}`;
    });
    */
    const paramWriter = (writer: CodeBlockWriter): void => {
      const lastIndex = this.#ctorParameters.length - 1;
      this.#ctorParameters.forEach((param, index) => {
        writer.conditionalWrite(param.name !== "isStatic", "signature.");
        writer.write(param.name);
        writer.conditionalWrite(index < lastIndex, ",");
      });
    };

    declaration.initializer = new CallExpressionStatementImpl({
      name: "new " + this.module.defaultExportName,
      parameters: [paramWriter],
    }).writerFunction;

    return [
      declStatement,
    ];
  }

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.statementGroupKey !== "static fromSignature")
      return false;

    if (key.fieldKey === "kind")
      return false;

    if (!this.sharedKeys.has(key.fieldKey))
      return false;

    const flatMap = FlatInterfaceMap.get(this.module.baseName)!;
    return flatMap.properties.some(prop => prop.name === key.fieldKey);
  }

  getBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    // The rest of this function borrows heavily from fieldStatements/CopyFields.ts

    if (key.fieldType?.kind === StructureKind.GetAccessor) {
      return this.#getCopyTypeStatements(key.fieldType);
    }

    const fieldType = this.declarationFlatTypeMembers.get(key.fieldKey);

    assert.equal(
      fieldType?.kind,
      StructureKind.PropertySignature,
      "not a property?  " + (key.fieldType ? StructureKind[key.fieldType.kind] : "(undefined)"));

    assert(fieldType.typeStructure, "no type structure?");

    switch (fieldType.typeStructure.kind) {
      case TypeStructureKind.Literal:
        return this.#getStatementsForLiteralType(fieldType, fieldType.typeStructure);
      case TypeStructureKind.Array:
        return this.#getStatementsForArrayType(fieldType, fieldType.typeStructure.objectType);
    }

    throw new Error(`unexpected field type structure: ${this.baseName}:${fieldType.name}, ${TypeStructureKind[fieldType.typeStructure.kind]}`);
  }

  #getStatementsForLiteralType(
    fieldType: PropertySignatureImpl,
    typeStructure: LiteralTypeStructureImpl
  ): readonly stringOrWriterFunction[]
  {
    if (fieldType.name === "name")
      return []; // handled in headStatements above

    if ((fieldType.name === "returnType") || (fieldType.name === "type")) {
      return [
        this.#getIfSourceStatement(
          false,
          `${fieldType.name}Structure`,
          `declaration.${fieldType.name}Structure = TypeStructureClassesMap.clone(
            signature.${fieldType.name}Structure,
          );`
        )
      ];
    }

    let statement: stringOrWriterFunction;
    const originalField = this.declarationFlatTypeMembers.getAsKind(StructureKind.PropertySignature, fieldType.name)!;
    switch (typeStructure) {
      case booleanType:
        statement = this.#getAssignmentStatement(fieldType.name);
        if (originalField.hasQuestionToken) {
          statement += " ?? false";
        }
        return [statement];

      case stringType:
        statement = `target.${fieldType.name} = source.${fieldType.name}`;
        if (originalField.hasQuestionToken) {
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
    return `declaration.${name} = signature.${name}`;
  }

  #getIfSourceStatement(
    isElse: boolean,
    name: string,
    body: string,
  ): WriterFunction
  {
    return new BlockStatementImpl(
      `${isElse ? "else " : ""}if (signature.${name})`,
      [body],
    ).writerFunction;
  }

  #getStatementsForArrayType(
    fieldType: PropertySignatureImpl,
    objectType: TypeStructures
  ): readonly stringWriterOrStatementImpl[]
  {
    const { name } = fieldType;
    void(objectType);

    if ((name === "leadingTrivia") || (name === "trailingTrivia"))
      return this.#getStatementsForTrivia(name);

    return [
      (new CallExpressionStatementImpl({
        name: `declaration.${name}.push`,
        parameters: [
          new CallExpressionStatementImpl({
            name: "...StructureClassesMap.cloneArray",
            typeParameters: [objectType, objectType],
            parameters: [`signature.${name}`]
          })
        ]
      })).writerFunction
    ];
  }

  #getStatementsForTrivia(
    name: string
  ): readonly stringWriterOrStatementImpl[]
  {
    return [
      `declaration.${name}.push(...signature.${name});`
    ];
  }

  #getCopyTypeStatements(
    member: GetAccessorDeclarationImpl
  ): readonly stringWriterOrStatementImpl[]
  {
    void(member);
    return [];
  }

  filterTailStatements(key: MemberedStatementsKey): boolean {
    return (key.statementGroupKey === "static fromSignature");
  }
  getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [`return declaration;`];
  }
}
