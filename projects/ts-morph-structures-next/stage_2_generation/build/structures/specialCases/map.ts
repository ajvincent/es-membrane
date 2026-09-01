import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  ClassMemberDeclarationSpecialCases,
} from "./ClassMemberDeclaration.js";

import {
  ConstructorDeclarationSpecialCases,
} from "./ConstructorDeclaration.js";

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
  MethodDeclarationSpecialCases
} from "./MethodDeclaration.js";

import {
  PropertyDeclarationSpecialCases
} from "./PropertyDeclaration.js";

import {
  SetAccessorDeclarationSpecialCases
} from "./SetAccessorDeclaration.js";

import {
  TypeAliasDeclarationSpecialCases
} from "./TypeAliasDeclaration.js";

export const StructureModifiersMap: ReadonlyMap<string, StructureModuleModifierTraps> = new Map([
  ["ConstructorDeclarationImpl", ConstructorDeclarationSpecialCases],
  ["GetAccessorDeclarationImpl", GetAccessorDeclarationSpecialCases],
  ["ImportDeclarationImpl", ImportDeclarationSpecialCases],
  ["IndexSignatureDeclarationImpl", IndexSignatureDeclarationSpecialCases],
  ["MethodDeclarationImpl", MethodDeclarationSpecialCases],
  ["MethodDeclarationOverloadImpl", ClassMemberDeclarationSpecialCases],
  ["PropertyDeclarationImpl", PropertyDeclarationSpecialCases],
  ["SetAccessorDeclarationImpl", SetAccessorDeclarationSpecialCases],
  ["TypeAliasDeclarationImpl", TypeAliasDeclarationSpecialCases],
]);
