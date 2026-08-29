//#region preamble
import {
  LiteralTypeStructureImpl,
  type MemberedTypeToClass,
  PropertySignatureImpl,
} from "#stage_one/snapshot/source/exports.js";

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
//#endregion preamble

export const GetAccessorDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass): void {
    void interfaceModule;

    const prop = new PropertySignatureImpl("returnType");
    prop.hasQuestionToken = true;
    prop.typeStructure = LiteralTypeStructureImpl.get("TypeStructures");
    typeToClass.insertMemberKey(false, prop, false, "constructor");

    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new AccessorExtraParameters(module, typeToClass.constructorParameters)
    ]);
  }
};
