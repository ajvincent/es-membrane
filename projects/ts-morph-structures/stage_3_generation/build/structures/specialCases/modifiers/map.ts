import type {
  StructureModuleModifierTraps
} from "#stage_three/generation/types/StructureModuleModifierTraps.js";

import { ImportDeclarationSpecialCases } from "./ImportDeclarationImpl.js";

const StructureModifiersMap: ReadonlyMap<string, StructureModuleModifierTraps> = new Map([
  ["ImportDeclarationImpl", ImportDeclarationSpecialCases]
]);

export {
  StructureModifiersMap
};
