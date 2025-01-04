// #region preamble
import {
  type CodeBlockWriter,
  VariableDeclarationKind,
} from "ts-morph";

import {
  ClassHeadStatementsGetter,
  ClassSupportsStatementsFlags,
  ConstructorBodyStatementsGetter,
  LiteralTypeStructureImpl,
  type MemberedStatementsKey,
  ParameterDeclarationImpl,
  PropertySignatureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringWriterOrStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import type {
  BaseClassModule,
} from "../../../moduleClasses/exports.js";

import BlockStatementImpl from "../../../pseudoStatements/BlockStatement.js";
import CallExpressionStatementImpl from "../../../pseudoStatements/CallExpression.js";
import StatementGetterBase from "../../fieldStatements/GetterBase.js";
// #endregion preamble

export function getInsertedAccessorProperty(
  name: string
): PropertySignatureImpl | undefined
{
  if (name === "GetAccessorDeclarationStructure") {
    const prop = new PropertySignatureImpl("returnType");
    prop.hasQuestionToken = true;
    prop.typeStructure = LiteralTypeStructureImpl.get("TypeStructures");
    return prop;
  }

  if (name === "SetAccessorDeclarationStructure") {
    const prop = new PropertySignatureImpl("setterParameter");
    prop.typeStructure = LiteralTypeStructureImpl.get("ParameterDeclarationImpl");
    return prop;
  }

  return undefined;
}

export class AccessorExtraParameters extends StatementGetterBase
implements ConstructorBodyStatementsGetter, ClassHeadStatementsGetter
{
  readonly #ctorParameters: ParameterDeclarationImpl[];

  constructor(
    module: BaseClassModule,
    ctorParameters: ParameterDeclarationImpl[],
  )
  {
    super(
      module,
      "AccessorExtraParameters",
      ClassSupportsStatementsFlags.ConstructorBodyStatements |
      ClassSupportsStatementsFlags.HeadStatements
    );
    this.#ctorParameters = ctorParameters;
  }

  filterCtorBodyStatements(key: MemberedStatementsKey): boolean {
    if ((this.module.defaultExportName === "GetAccessorDeclarationImpl") && (key.fieldKey === "returnType"))
      return true;

    if ((this.module.defaultExportName === "SetAccessorDeclarationImpl") && (key.fieldKey === "setterParameter"))
      return true;

    return false;
  }

  getCtorBodyStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    if (key.fieldKey === "returnType") {
      this.module.addImports("public", [], ["TypeStructures"]);

      const parameter = new ParameterDeclarationImpl("returnType");
      parameter.hasQuestionToken = true;
      parameter.typeStructure = LiteralTypeStructureImpl.get("TypeStructures");
      this.#ctorParameters.push(parameter);

      return [
        new BlockStatementImpl(
          `if (returnType)`,
          [`this.returnTypeStructure = returnType;`]
        ).writerFunction,
      ];
    }

    if (key.fieldKey === "setterParameter") {
      this.module.addImports("public", ["ParameterDeclarationImpl"], []);

      const parameter = new ParameterDeclarationImpl("setterParameter");
      parameter.typeStructure = LiteralTypeStructureImpl.get("ParameterDeclarationImpl");
      this.#ctorParameters.push(parameter);

      return [`this.parameters.push(setterParameter);`]
    }

    return [];
  }

  filterHeadStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return (
      (key.statementGroupKey === "static clone") &&
      (this.module.defaultExportName === "GetAccessorDeclarationImpl")
    );
  }

  getHeadStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void(key);

    const targetDeclStatement = new VariableStatementImpl;
    targetDeclStatement.declarationKind = VariableDeclarationKind.Const;

    const targetDecl = new VariableDeclarationImpl("target");
    targetDecl.initializer = (writer: CodeBlockWriter): void => {
      const statement = new CallExpressionStatementImpl({
        name: "new " + this.module.exportName,
        parameters: [`source.isStatic ?? false`, `source.name`]
      });
      statement.writerFunction(writer);
    };

    targetDeclStatement.declarations.push(targetDecl);
    return [targetDeclStatement];
  }
}
