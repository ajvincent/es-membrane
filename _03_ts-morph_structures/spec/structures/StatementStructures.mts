import cloneableStatementsMap from "#ts-morph_structures/source/structures/cloneableStatements.mjs";

import {
  ClassDeclarationImpl,
  EnumDeclarationImpl,
  ExportAssignmentImpl,
  ExportDeclarationImpl,
  FunctionDeclarationImpl,
  ImportDeclarationImpl,
  InterfaceDeclarationImpl,
  ModuleDeclarationImpl,
  TypeAliasDeclarationImpl,
  VariableStatementImpl
} from "#ts-morph_structures/exports.mjs";
import { StructureKind } from "ts-morph";

it("ts-morph-structures: cloneableStatementsMap is complete", () => {
  expect(cloneableStatementsMap.size).toBe(10);
  expect(cloneableStatementsMap.get(StructureKind.Class)).toBe(ClassDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.Enum)).toBe(EnumDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.ExportAssignment)).toBe(ExportAssignmentImpl);
  expect(cloneableStatementsMap.get(StructureKind.ExportDeclaration)).toBe(ExportDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.Function)).toBe(FunctionDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.ImportDeclaration)).toBe(ImportDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.Interface)).toBe(InterfaceDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.Module)).toBe(ModuleDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.TypeAlias)).toBe(TypeAliasDeclarationImpl);
  expect(cloneableStatementsMap.get(StructureKind.VariableStatement)).toBe(VariableStatementImpl);
});
