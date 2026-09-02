import type {
  MemberedTypeToClass,
  PropertySignatureImpl,
  stringOrWriterFunction,
  TypeMembersMap,
} from "#stage_two/snapshot/source/exports.js";

import type {
  StructureModule
} from "../moduleClasses/StructureModule.ts";

/**
 * These define special-case traps for modifying a structure module, while normal code is making its changes.
 *
 * No method in here is required.
 */
export interface StructureModuleModifierTraps {
  modifyTypeMembersForTypeStructures?(
    baseName: string,
    map: TypeMembersMap
  ): void;

  buildTypeToClass?(
    module: StructureModule,
    interfaceModule: InterfaceModule,
    typeToClass: MemberedTypeToClass,
  ): void;

  defineImplMethods?(
    module: StructureModule,
    interfaceMembers: TypeMembersMap,
    typeToClass: MemberedTypeToClass,
    replacedProperties: PropertySignatureImpl[],
  ): void;

  modifyStaticClone_TailStatements?(
    statements: stringOrWriterFunction[]
  ): void;

  postProcessClassMembers?(
    module: StructureModule
  ): void;
}
