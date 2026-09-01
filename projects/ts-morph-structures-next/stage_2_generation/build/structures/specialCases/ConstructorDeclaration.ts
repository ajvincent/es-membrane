//#region preamble
import {
  type MemberedTypeToClass,
} from "#stage_one/snapshot/source/exports.js";

import InterfaceModule from "../../../moduleClasses/InterfaceModule.js";
import type {
  StructureModule
} from "../../../moduleClasses/StructureModule.js";

import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  apply_FromSignature_rules
} from "./utilities/ClassMember_fromSignature.js";
//#endregion preamble

export const ConstructorDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass): void {
    void interfaceModule;
    apply_FromSignature_rules(module, typeToClass);
  }
};
