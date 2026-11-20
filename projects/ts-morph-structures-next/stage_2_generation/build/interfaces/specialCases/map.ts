import type {
  InterfaceModuleModifierTraps
} from "#stage_two/generation/types/InterfaceModuleModifierTraps.js";
import { StatementedNodeInterfaceModifiers } from "./StatementedNodeStructure.js";

export const InterfaceModifiersMap: ReadonlyMap<string, InterfaceModuleModifierTraps> = new Map([
  ["StatementedNodeStructure", StatementedNodeInterfaceModifiers]
]);
