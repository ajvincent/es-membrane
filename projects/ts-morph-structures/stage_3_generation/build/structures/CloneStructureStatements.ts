import {
  CodeBlockWriter,
  VariableDeclarationKind,
} from "ts-morph";

import {
  type ClassHeadStatementsGetter,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  LiteralTypeStructureImpl,
  MemberedStatementsKey,
  type ParameterDeclarationImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringOrWriterFunction,
  type stringWriterOrStatementImpl
} from "#stage_two/snapshot/source/exports.js";

import {
  StructureModule
} from "../../moduleClasses/exports.js";

import CallExpressionStatementImpl from "../../pseudoStatements/CallExpression.js";
import StatementGetterBase from "../fieldStatements/GetterBase.js";

export default
class CloneStructureStatements extends StatementGetterBase
implements ClassHeadStatementsGetter, ClassTailStatementsGetter
{
  protected readonly module: StructureModule;
  readonly #constructorParameters: ParameterDeclarationImpl[];

  constructor(
    module: StructureModule,
    constructorParameters: ParameterDeclarationImpl[]
  )
  {
    super(
      module,
      "CloneStructureStatements",
      ClassSupportsStatementsFlags.HeadStatements |
      ClassSupportsStatementsFlags.TailStatements
    );
    this.module = module;
    this.#constructorParameters = constructorParameters;
  }

  filterHeadStatements(key: MemberedStatementsKey): boolean {
    return (key.statementGroupKey === "static clone");
  }

  getHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);

    const targetDeclStatement = new VariableStatementImpl;
    targetDeclStatement.declarationKind = VariableDeclarationKind.Const;

    const targetDecl = new VariableDeclarationImpl("target");
    targetDecl.initializer = (writer: CodeBlockWriter): void => {
      const statement = new CallExpressionStatementImpl({
        name: "new " + this.module.exportName,
        parameters: this.#constructorParameters.map(
          param => this.#getInitializerValue(param)
        )
      });
      statement.writerFunction(writer);
    };

    targetDeclStatement.declarations.push(targetDecl);
    return [targetDeclStatement];
  }

  #getInitializerValue(
    parameter: ParameterDeclarationImpl
  ): stringOrWriterFunction | CallExpressionStatementImpl
  {
    let value = `source.${parameter.name}`;
    if (parameter.name === "isStatic") {
      value += " ?? false";
    }
    else if (parameter.hasQuestionToken) {
      if (parameter.typeStructure === LiteralTypeStructureImpl.get("boolean"))
        value += " ?? false";
    }
    return value;
  }

  filterTailStatements(key: MemberedStatementsKey): boolean {
    return (key.statementGroupKey === "static clone");
  }
  getTailStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [
      new CallExpressionStatementImpl({
        name: `this[COPY_FIELDS]`,
        parameters: ["source", "target"]
      }).writerFunction,
      `return target;`
    ];
  }
}
