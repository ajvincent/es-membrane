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
  apply_FromSignature_rules
} from "./utilities/ClassMember_fromSignature.js";

import {
  ClassMemberDeclarationSpecialCases
} from "./ClassMemberDeclaration.js";
//#endregion preamble

export const MethodDeclarationSpecialCases: StructureModuleModifierTraps = {
  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass): void {
    apply_FromSignature_rules(module, typeToClass);
    ClassMemberDeclarationSpecialCases.buildTypeToClass!(module, interfaceModule, typeToClass);
  }
};
