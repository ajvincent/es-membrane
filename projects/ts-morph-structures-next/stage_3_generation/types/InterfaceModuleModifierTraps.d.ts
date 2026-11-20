import type {
  MemberedTypeToClass,
  PropertySignatureImpl,
  stringOrWriterFunction,
  TypeMembersMap,
} from "#stage_two/snapshot/source/exports.js";

import type {
  InterfaceModule
} from "../moduleClasses/InterfaceModule.ts";

/**
 * These define special-case traps for modifying a structure module, while normal code is making its changes.
 *
 * No method in here is required.
 */
export interface InterfaceModuleModifierTraps {
  modifyTypeMembers?(
    module: InterfaceModule,
  ): void;
}
