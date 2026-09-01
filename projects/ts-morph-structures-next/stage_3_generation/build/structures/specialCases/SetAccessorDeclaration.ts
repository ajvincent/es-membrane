//#region preamble
import {
  LiteralTypeStructureImpl,
  type MemberedTypeToClass,
  PropertySignatureImpl,
} from "#stage_two/snapshot/source/exports.js";

import InterfaceModule from "../../../moduleClasses/InterfaceModule.js";
import type {
  StructureModule
} from "../../../moduleClasses/StructureModule.js";

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
  }
};
