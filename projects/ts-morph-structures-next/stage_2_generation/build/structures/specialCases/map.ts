import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  ClassMemberDeclarationSpecialCases,
} from "./ClassMemberDeclaration.js";

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

import {
  TypeAliasDeclarationSpecialCases
} from "./TypeAliasDeclaration.js";

export const StructureModifiersMap: ReadonlyMap<string, StructureModuleModifierTraps> = new Map([
  ["GetAccessorDeclarationImpl", GetAccessorDeclarationSpecialCases],
  ["ImportDeclarationImpl", ImportDeclarationSpecialCases],
  ["IndexSignatureDeclarationImpl", IndexSignatureDeclarationSpecialCases],
  ["MethodDeclarationImpl", ClassMemberDeclarationSpecialCases],
  ["MethodDeclarationOverloadImpl", ClassMemberDeclarationSpecialCases],
  ["PropertyDeclarationImpl", ClassMemberDeclarationSpecialCases],
  ["SetAccessorDeclarationImpl", SetAccessorDeclarationSpecialCases],
  ["TypeAliasDeclarationImpl", TypeAliasDeclarationSpecialCases],
]);
