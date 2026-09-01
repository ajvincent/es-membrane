//#region preamble
import {
  type MemberedTypeToClass,
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
  ClassMember_isStatic
} from "./utilities/ClassMember_isStatic.js";
//#endregion preamble

export const ClassMemberDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass): void {
    void interfaceModule;

    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new ClassMember_isStatic(module, typeToClass.constructorParameters)
    ]);
  }
};
