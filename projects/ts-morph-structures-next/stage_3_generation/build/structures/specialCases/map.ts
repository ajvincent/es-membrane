import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  GetAccessorDeclarationSpecialCases
} from "./GetAccessorDeclaration.js";

import {
  ImportDeclarationSpecialCases
} from "./ImportDeclarationImpl.js";

import {
  SetAccessorDeclarationSpecialCases
} from "./SetAccessorDeclaration.js";

export const StructureModifiersMap: ReadonlyMap<string, StructureModuleModifierTraps> = new Map([
  ["GetAccessorDeclarationImpl", GetAccessorDeclarationSpecialCases],
  ["ImportDeclarationImpl", ImportDeclarationSpecialCases],
  ["SetAccessorDeclarationImpl", SetAccessorDeclarationSpecialCases],
]);
