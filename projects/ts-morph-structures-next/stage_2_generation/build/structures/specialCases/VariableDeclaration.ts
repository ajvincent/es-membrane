import assert from "node:assert/strict";
import { StructureKind } from "ts-morph";

import {
  type ConstructorDeclarationImpl,
  LiteralTypeStructureImpl,
  type MemberedTypeToClass,
  ParameterDeclarationImpl,
} from "#stage_one/snapshot/source/exports.js";

import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import type {
  InterfaceModule,
  StructureModule,
} from "../../../moduleClasses/exports.js";

import {
  StatementsPriority
} from "../../fieldStatements/StatementsPriority.js";

import CloneStructureStatements from "../CloneStructureStatements.js";

export const VariableDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(
    module: StructureModule,
    interfaceModule: InterfaceModule,
    typeToClass: MemberedTypeToClass
  ): void
  {
    const nameParam = new ParameterDeclarationImpl("name");
    nameParam.type = "string";
    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new CloneStructureStatements(module, [nameParam]),
    ]);
  },

  postProcessClassMembers(
    module: StructureModule
  ): void
  {
    const ctor: ConstructorDeclarationImpl | undefined = module.classMembersMap?.getAsKind(
      StructureKind.Constructor, false, "constructor"
    );
    assert(ctor, "constructor must exist now");

    const typeParam = new ParameterDeclarationImpl("typeStructure");
    typeParam.hasQuestionToken = true;
    typeParam.typeStructure = LiteralTypeStructureImpl.get("TypeStructures");
    module.addImports("public", [], ["TypeStructures"]);
    ctor.parameters.push(typeParam);
    ctor.statements.push(`if (typeStructure !== undefined) this.typeStructure = typeStructure;`);

    const initializerParam = new ParameterDeclarationImpl("initializer");
    initializerParam.hasQuestionToken = true;
    initializerParam.typeStructure = LiteralTypeStructureImpl.get("stringOrWriterFunction");
    module.addImports("public", [], ["stringOrWriterFunction"]);
    ctor.parameters.push(initializerParam);
    ctor.statements.push(`if (initializer !== undefined) this.initializer = initializer;`);
  }
};
