//#region preamble
import {
  CodeBlockWriter,
} from "ts-morph";

import {
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  LiteralTypeStructureImpl,
  type MemberedStatementsKey,
  type MemberedTypeToClass,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  UnionTypeStructureImpl,
  type stringWriterOrStatementImpl,
} from "#stage_one/snapshot/source/exports.js";

import StatementGetterBase from "../../fieldStatements/GetterBase.js";

import type {
  DecoratorModule
} from "../../../moduleClasses/exports.js";

import BlockStatementImpl from "../../../pseudoExpressions/statements/BlockStatement.js";
import CallExpressionStatementImpl from "../../../pseudoExpressions/statements/CallExpression.js";

import type {
  DecoratorModuleModifierTraps
} from "../../../types/DecoratorModuleModifierTraps.js";

import {
  StatementsPriority
} from "../../fieldStatements/StatementsPriority.js";
//#endregion preamble

export const StatementedNodeSpecialCases: DecoratorModuleModifierTraps = {
  modifyTypeToClassBeforeBuild(
    module: DecoratorModule,
    typeToClass: MemberedTypeToClass
  ): void
  {
    void module;

    const cloneStatementFilter = new CloneStatement_Statements(module);
    typeToClass.addStatementGetters(StatementsPriority.DECORATOR_SPECIFIC, [cloneStatementFilter]);
    typeToClass.addTypeMember(true, cloneStatementFilter.getMethodSignature());

  }
};

class CloneStatement_Statements extends StatementGetterBase
implements ClassTailStatementsGetter
{
  constructor(
    module: DecoratorModule
  )
  {
    super(
      module,
      "CloneStatement_Statements",
      ClassSupportsStatementsFlags.TailStatements
    );
  }

  getMethodSignature(): MethodSignatureImpl
  {
    this.module.addImports("ts-morph", [], ["StatementStructures"]);
    this.module.addImports("public", [], ["stringOrWriterFunction", "StatementStructureImpls"]);
    const method = new MethodSignatureImpl("#cloneStatement");

    const param = new ParameterDeclarationImpl("source");
    param.typeStructure = new UnionTypeStructureImpl([
      LiteralTypeStructureImpl.get("StatementStructures"),
      LiteralTypeStructureImpl.get("stringOrWriterFunction"),
    ]);
    method.parameters.push(param);

    method.returnTypeStructure = new UnionTypeStructureImpl([
      LiteralTypeStructureImpl.get("StatementStructureImpls"),
      LiteralTypeStructureImpl.get("stringOrWriterFunction"),
    ]);

    return method;
  }

  filterTailStatements(
    key: MemberedStatementsKey
  ): boolean
  {
    return key.statementGroupKey === "static #cloneStatement";
  }

  getTailStatements(
    key: MemberedStatementsKey
  ): readonly stringWriterOrStatementImpl[]
  {
    void(key);
    this.module.addImports("internal", ["StructureClassesMap"], []);

    return [
      new BlockStatementImpl(
        `if (typeof source !== "object")`,
        [
          `return source;`
        ]
      ).writerFunction,

      (writer: CodeBlockWriter): void => {
        writer.write("return ");
        (new CallExpressionStatementImpl({
          name: "StructureClassesMap.clone",
          typeParameters: [
            LiteralTypeStructureImpl.get("StatementStructures"),
            LiteralTypeStructureImpl.get("StatementStructureImpls"),
          ],
          parameters: ["source"]
        })).writerFunction(writer);
      }
    ];
  }
}
