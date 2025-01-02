import assert from "node:assert/strict";

import {
  CodeBlockWriter,
  StructureKind,
  VariableDeclarationKind,
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  type ParameterDeclarationImpl,
  UnionTypeStructureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
} from "#stage_two/snapshot/source/exports.js";

import type {
  StructureModule,
} from "../../../moduleClasses/exports.js";

import BlockStatementImpl from "../../../pseudoStatements/BlockStatement.js";
import CallExpressionStatementImpl from "../../../pseudoStatements/CallExpression.js";

export default function postProcessClassMembers(
  module: StructureModule
): void
{
  if (module.defaultExportName === "TypeAliasDeclarationImpl") {
    allowTypeStructureInConstructor(module);
    convertTypePropertyToAccessors(module);
  }

  if (module.defaultExportName === "SetAccessorDeclarationImpl") {
    removeExtraParameterFromSetAccessor_Clone(module);
  }
}

function allowTypeStructureInConstructor(
  module: StructureModule
): void
{
  assert(module.classMembersMap);

  const ctor = module.classMembersMap.getAsKind(StructureKind.Constructor, false, "constructor")!;

  module.addImports("public", [], ["stringOrWriterFunction", "TypeStructures"]);
  const typeParam: ParameterDeclarationImpl = ctor.parameters.find(param => param.name === "type")!;
  typeParam.typeStructure = new UnionTypeStructureImpl([
    LiteralTypeStructureImpl.get("stringOrWriterFunction"),
    LiteralTypeStructureImpl.get("TypeStructures")
  ]);

  ctor.statements.splice(
    ctor.statements.indexOf("this.type = type;"),
    1,
    new BlockStatementImpl(
      `if (typeof type === "object")`,
      [`this.typeStructure = type;`]
    ).writerFunction,

    new BlockStatementImpl(
      `else`,
      [ `this.type = type;`]
    ).writerFunction,
  );
}

function convertTypePropertyToAccessors(
  module: StructureModule
): void
{
  assert(module.classMembersMap);
  module.classMembersMap.convertPropertyToAccessors(false, "type", true, true);

  const typeGetter = module.classMembersMap.getAsKind(StructureKind.GetAccessor, false, "type")!;
  typeGetter.statements.push(`return super.type ?? "";`);

  const typeSetter = module.classMembersMap.getAsKind(StructureKind.SetAccessor, false, "type")!;
  typeSetter.statements.push(`super.type = value;`);
}

function removeExtraParameterFromSetAccessor_Clone(
  module: StructureModule
): void
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
