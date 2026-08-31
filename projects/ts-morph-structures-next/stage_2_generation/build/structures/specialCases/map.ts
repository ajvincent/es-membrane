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
  IndexSignatureDeclarationSpecialCases,
} from "./IndexSignature.js";

import {
  SetAccessorDeclarationSpecialCases
} from "./SetAccessorDeclaration.js";

export const StructureModifiersMap: ReadonlyMap<string, StructureModuleModifierTraps> = new Map([
  ["GetAccessorDeclarationImpl", GetAccessorDeclarationSpecialCases],
  ["ImportDeclarationImpl", ImportDeclarationSpecialCases],
  ["IndexSignatureDeclarationImpl", IndexSignatureDeclarationSpecialCases],
  ["SetAccessorDeclarationImpl", SetAccessorDeclarationSpecialCases],
]);
