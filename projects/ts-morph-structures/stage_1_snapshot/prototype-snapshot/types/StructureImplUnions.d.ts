import type {
  ClassDeclarationImpl,
  EnumDeclarationImpl,
  ExportAssignmentImpl,
  ExportDeclarationImpl,
  FunctionDeclarationImpl,
  ImportDeclarationImpl,
  InterfaceDeclarationImpl,
  ModuleDeclarationImpl,
  TypeAliasDeclarationImpl,
  VariableStatementImpl,
} from "../exports.js";

export type StatementStructureImpls =
  | ClassDeclarationImpl
  | EnumDeclarationImpl
  | ExportAssignmentImpl
  | ExportDeclarationImpl
  | FunctionDeclarationImpl
  | ImportDeclarationImpl
  | InterfaceDeclarationImpl
  | ModuleDeclarationImpl
  | TypeAliasDeclarationImpl
  | VariableStatementImpl;
