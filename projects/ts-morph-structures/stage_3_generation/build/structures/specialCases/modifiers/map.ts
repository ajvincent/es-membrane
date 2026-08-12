import type {
  StructureModuleModifierTraps
} from "../../../../types/StructureModuleModifierTraps.js";

import {
  ImportDeclarationSpecialCases
} from "./ImportDeclarationImpl.js";

const StructureModifiersMap: ReadonlyMap<string, StructureModuleModifierTraps> = new Map([
  ["ImportDeclarationImpl", ImportDeclarationSpecialCases]
]);

export {
  StructureModifiersMap
};
