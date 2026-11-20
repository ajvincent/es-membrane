import {
  ArrayTypeStructureImpl,
  LiteralTypeStructureImpl,
  PropertySignatureImpl,
} from "#stage_two/snapshot/source/exports.js";

import type InterfaceModule from "../../../moduleClasses/InterfaceModule.js";
import type {
  InterfaceModuleModifierTraps
} from "../../../types/InterfaceModuleModifierTraps.js";

export const StatementedNodeInterfaceModifiers: InterfaceModuleModifierTraps = {
  modifyTypeMembers(
    module: InterfaceModule
  ): void
  {
    module.addImports("source/structures/statements/AugmentedStatements.js", [], ["AugmentedStatementStructures"]);

    const prop = new PropertySignatureImpl("statementsSequence");
    prop.isReadonly = true;
    prop.typeStructure = new ArrayTypeStructureImpl(LiteralTypeStructureImpl.get("AugmentedStatementStructures"));
    module.typeMembers.addMembers([prop]);
  }
};
