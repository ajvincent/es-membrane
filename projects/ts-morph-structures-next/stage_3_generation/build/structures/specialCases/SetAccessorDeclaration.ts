//#region preamble
import assert from "node:assert/strict";

import {
  CodeBlockWriter,
  StructureKind,
  VariableDeclarationKind,
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  type MemberedTypeToClass,
  PropertySignatureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import InterfaceModule from "../../../moduleClasses/InterfaceModule.js";
import type {
  StructureModule
} from "../../../moduleClasses/StructureModule.js";

import BlockStatementImpl from "../../../pseudoExpressions/statements/BlockStatement.js";
import CallExpressionStatementImpl from "../../../pseudoExpressions/statements/CallExpression.js";

import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  StatementsPriority,
} from "../../fieldStatements/StatementsPriority.js";

import {
  AccessorExtraParameters
} from "./utilities/AccessorExtraParameters.js";

import {
  ClassMemberDeclarationSpecialCases
} from "./ClassMemberDeclaration.js";
//#endregion preamble

export const SetAccessorDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass): void {
    void interfaceModule;

    const prop = new PropertySignatureImpl("setterParameter");
    prop.typeStructure = LiteralTypeStructureImpl.get("ParameterDeclarationImpl");
    typeToClass.insertMemberKey(false, prop, false, "constructor");

    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new AccessorExtraParameters(module, typeToClass.constructorParameters)
    ]);

    ClassMemberDeclarationSpecialCases.buildTypeToClass!(module, interfaceModule, typeToClass);
  },

  postProcessClassMembers(module: StructureModule): void {
    // removeExtraParameterFromSetAccessor_Clone
    {
      assert(module.classMembersMap);

      const cloneMethod = module.classMembersMap.getAsKind(StructureKind.Method, true, "clone")!;
      cloneMethod.statements.splice(
        cloneMethod.statements.length - 1,
        0,
        new BlockStatementImpl(
          `if (hasSourceParameter)`,
          [`
          // copy-fields included copying the existing parameter, so we have to drop our artificial one
          target.parameters.shift();
          `.trim()]
        ).writerFunction,
      );

      const valueParamStatement = new VariableStatementImpl;
      {
        valueParamStatement.declarationKind = VariableDeclarationKind.Const;
        const valueParam = new VariableDeclarationImpl("valueParam");
        valueParam.typeStructure = LiteralTypeStructureImpl.get("ParameterDeclarationImpl");
        valueParam.initializer = new CallExpressionStatementImpl({
          name: `new ParameterDeclarationImpl`,
          parameters: [`"value"`]
        }).writerFunction;
        valueParamStatement.declarations.push(valueParam);
      }

      const hasSourceParameterStatement = new VariableStatementImpl;
      {
        hasSourceParameterStatement.declarationKind = VariableDeclarationKind.Const;
        const hasSourceParameter = new VariableDeclarationImpl("hasSourceParameter");
        hasSourceParameter.initializer = `source.parameters && source.parameters.length > 0`;
        hasSourceParameterStatement.declarations.push(hasSourceParameter);
      }

      const firstStatement = cloneMethod.statements[0];
      assert(typeof firstStatement === "object", "expected a VariableStatementImpl");
      assert(firstStatement.kind === StructureKind.VariableStatement, "expected a VariableStatementImpl");

      const targetDecl = firstStatement.declarations[0];
      assert.equal(targetDecl.name, "target");

      assert(targetDecl.initializer);
      if (typeof targetDecl.initializer === "function") {
        const writer = new CodeBlockWriter;
        targetDecl.initializer(writer);

        const initializer = writer.toString().replace("source.setterParameter", "valueParam");
        targetDecl.initializer = initializer;
      }

      cloneMethod.statements.splice(
        0, 0,
        valueParamStatement,
        hasSourceParameterStatement,
      );

    }
  }
};
