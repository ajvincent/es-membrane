import type {
  CallSignatureDeclarationImpl,
  ClassDeclarationImpl,
  ConstructorDeclarationImpl,
  ConstructorDeclarationOverloadImpl,
  ConstructSignatureDeclarationImpl,
  DecoratorImpl,
  EnumDeclarationImpl,
  EnumMemberImpl,
  ExportAssignmentImpl,
  ExportDeclarationImpl,
  ExportSpecifierImpl,
  FunctionDeclarationImpl,
  FunctionDeclarationOverloadImpl,
  GetAccessorDeclarationImpl,
  ImportDeclarationImpl,
  ImportSpecifierImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  JSDocImpl,
  JSDocTagImpl,
  MethodDeclarationImpl,
  MethodDeclarationOverloadImpl,
  MethodSignatureImpl,
  ModuleDeclarationImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  SourceFileImpl,
  TypeAliasDeclarationImpl,
  TypeParameterDeclarationImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
} from "../exports.js";
export type ClassMemberStructureImpls =
  | ConstructorDeclarationImpl
  | GetAccessorDeclarationImpl
  | MethodDeclarationImpl
  | PropertyDeclarationImpl
  | SetAccessorDeclarationImpl;
export type InterfaceMemberStructureImpls = TypeElementMemberStructureImpls;
export type ObjectLiteralExpressionPropertyStructureImpls =
  | GetAccessorDeclarationImpl
  | MethodDeclarationImpl
  | SetAccessorDeclarationImpl
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
export type StructureImpls =
  | ClassMemberStructureImpls
  | ConstructorDeclarationOverloadImpl
  | DecoratorImpl
  | EnumMemberImpl
  | ExportSpecifierImpl
  | FunctionDeclarationOverloadImpl
  | ImportSpecifierImpl
  | InterfaceMemberStructureImpls
  | JSDocImpl
  | JSDocTagImpl
  | MethodDeclarationOverloadImpl
  | ObjectLiteralExpressionPropertyStructureImpls
  | ParameterDeclarationImpl
  | SourceFileImpl
  | StatementStructureImpls
  | TypeParameterDeclarationImpl
  | VariableDeclarationImpl;
export type TypeElementMemberStructureImpls =
  | CallSignatureDeclarationImpl
  | ConstructSignatureDeclarationImpl
  | IndexSignatureDeclarationImpl
  | MethodSignatureImpl
  | PropertySignatureImpl;
