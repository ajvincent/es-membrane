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
  FixKeyType_Filter
} from "./utilities/IndexSignature_KeyType.js";
//#endregion preamble

export const IndexSignatureDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(
    module: StructureModule,
    interfaceModule: InterfaceModule,
    typeToClass: MemberedTypeToClass
  ): void
  {
    void interfaceModule;
    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new FixKeyType_Filter(module),
    ]);
  },
};