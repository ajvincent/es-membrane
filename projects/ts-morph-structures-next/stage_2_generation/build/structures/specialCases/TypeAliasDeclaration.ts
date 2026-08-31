//#region preamble
import {
  type MemberedTypeToClass,
} from "#stage_one/snapshot/source/exports.js";

import type InterfaceModule from "../../../moduleClasses/InterfaceModule.js";
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
  TypeAliasDeclarationInitializer
} from "./utilities/TypeAlias_TypeInitializer.js";
//#endregion preamble

export const TypeAliasDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass) {
    void interfaceModule;
    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new TypeAliasDeclarationInitializer(module)
    ]);
  },
};
