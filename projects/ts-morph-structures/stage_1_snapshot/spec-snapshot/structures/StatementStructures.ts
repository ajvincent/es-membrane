import StatementClassesMap from "#stage_one/prototype-snapshot/base/StatementClassesMap.js";

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
} from "#stage_one/prototype-snapshot/exports.js";
import { StructureKind } from "ts-morph";

it("ts-morph-structures: StatementClassesMap is complete", () => {
  expect(StatementClassesMap.size).toBe(10);
  expect(StatementClassesMap.get(StructureKind.Class)).toBe(ClassDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.Enum)).toBe(EnumDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.ExportAssignment)).toBe(ExportAssignmentImpl);
  expect(StatementClassesMap.get(StructureKind.ExportDeclaration)).toBe(ExportDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.Function)).toBe(FunctionDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.ImportDeclaration)).toBe(ImportDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.Interface)).toBe(InterfaceDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.Module)).toBe(ModuleDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.TypeAlias)).toBe(TypeAliasDeclarationImpl);
  expect(StatementClassesMap.get(StructureKind.VariableStatement)).toBe(VariableStatementImpl);
});
