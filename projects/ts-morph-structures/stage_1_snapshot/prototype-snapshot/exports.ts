export {
  default as getTypeAugmentedStructure,
  type RootStructureWithConvertFailures,
  type TypeNodeToTypeStructureConsole,
} from "./bootstrap/getTypeAugmentedStructure.js";

// #region Structure implementations

export { default as CallSignatureDeclarationImpl } from "./structures/CallSignatureDeclarationImpl.js";
export { default as ClassDeclarationImpl } from "./structures/ClassDeclarationImpl.js";
export { default as ConstructorDeclarationImpl }  from "./structures/ConstructorDeclarationImpl.js";
export { default as ConstructorDeclarationOverloadImpl } from "./structures/ConstructorDeclarationOverloadImpl.js";
export { default as ConstructSignatureDeclarationImpl } from "./structures/ConstructSignatureDeclarationImpl.js";
export { default as DecoratorImpl }  from "./structures/DecoratorImpl.js";
export { default as EnumDeclarationImpl } from "./structures/EnumDeclarationImpl.js";
export { default as EnumMemberImpl } from "./structures/EnumMemberImpl.js";
export { default as ExportAssignmentImpl } from "./structures/ExportAssignmentImpl.js";
export { default as ExportDeclarationImpl } from "./structures/ExportDeclarationImpl.js";
export { default as ExportSpecifierImpl } from "./structures/ExportSpecifierImpl.js";
export { default as FunctionDeclarationImpl } from "./structures/FunctionDeclarationImpl.js";
export { default as FunctionDeclarationOverloadImpl } from "./structures/FunctionDeclarationOverloadImpl.js";
export { default as GetAccessorDeclarationImpl } from "./structures/GetAccessorDeclarationImpl.js";
export { default as ImportDeclarationImpl } from "./structures/ImportDeclarationImpl.js";
export { default as ImportSpecifierImpl } from "./structures/ImportSpecifierImpl.js";
export { default as IndexSignatureDeclarationImpl } from "./structures/IndexSignatureDeclarationImpl.js";
export { default as InterfaceDeclarationImpl } from "./structures/InterfaceDeclarationImpl.js";
export { default as JSDocImpl } from "./structures/JSDocImpl.js";
export { default as JSDocTagImpl } from "./structures/JSDocTagImpl.js";
export { default as MethodDeclarationImpl } from "./structures/MethodDeclarationImpl.js";
export { default as MethodDeclarationOverloadImpl } from "./structures/MethodDeclarationOverloadImpl.js";
export { default as MethodSignatureImpl } from "./structures/MethodSignatureImpl.js";
export { default as ModuleDeclarationImpl } from "./structures/ModuleDeclarationImpl.js";
export { default as ParameterDeclarationImpl } from "./structures/ParameterDeclarationImpl.js";
export { default as PropertyDeclarationImpl } from "./structures/PropertyDeclarationImpl.js";
export { default as PropertySignatureImpl } from "./structures/PropertySignatureImpl.js";
export { default as SetAccessorDeclarationImpl } from "./structures/SetAccessorDeclarationImpl.js";
export { default as SourceFileImpl } from "./structures/SourceFileImpl.js";
export { default as TypeAliasDeclarationImpl } from "./structures/TypeAliasDeclarationImpl.js";
export { default as TypeParameterDeclarationImpl } from "./structures/TypeParameterDeclarationImpl.js";
export { default as VariableDeclarationImpl } from "./structures/VariableDeclarationImpl.js";
export { default as VariableStatementImpl } from "./structures/VariableStatementImpl.js";

export { default as StructuresClassesMap } from "./base/StructuresClassesMap.js";

export {
  TypeParameterConstraintMode
} from "./structures/TypeParameterDeclarationImpl.js";

export type {
  TypeElementMemberedOwner
} from "./decorators/TypeElementMemberedNode.js";

export type {
  MethodDeclarationAppendContext,
  MethodDeclarationEnableFlags,
} from "./structures/MethodDeclarationImpl.js";

// #endregion Structure implementations

// #region TypeStructure implementations

export * from "./typeStructures/TypeStructures.js";

export type {
  ClassDeclarationWithImplementsTypeStructures,
  InterfaceDeclarationWithExtendsTypeStructures,
  ReturnTypedNodeTypeStructure,
  TypedNodeTypeStructure,
  TypeParameterWithTypeStructures,
} from "./typeStructures/TypeAndTypeStructureInterfaces.js";

export {
  TypeStructureKind,
  type KindedTypeStructure,
} from "./base/TypeStructureKind.js";

export { default as ArrayTypedStructureImpl } from "./typeStructures/ArrayTypedStructureImpl.js";
export { default as ConditionalTypedStructureImpl } from "./typeStructures/ConditionalTypedStructureImpl.js";
export { default as FunctionTypedStructureImpl } from "./typeStructures/FunctionTypedStructureImpl.js";
export { default as ImportTypedStructureImpl } from "./typeStructures/ImportTypedStructureImpl.js";
export { default as IndexedAccessTypedStructureImpl } from "./typeStructures/IndexedAccessTypedStructureImpl.js";
export { default as InferTypedStructureImpl } from "./typeStructures/InferTypedStructureImpl.js";
export { default as IntersectionTypedStructureImpl } from "./typeStructures/IntersectionTypedStructureImpl.js"
export { default as LiteralTypedStructureImpl } from "./typeStructures/LiteralTypedStructureImpl.js";
export { default as MappedTypeTypedStructureImpl } from "./typeStructures/MappedTypeTypedStructureImpl.js";
export { default as MemberedObjectTypeStructureImpl } from "./typeStructures/MemberedObjectTypeStructureImpl.js";
export { default as ParameterTypedStructureImpl } from "./typeStructures/ParameterTypedStructureImpl.js";
export { default as ParenthesesTypedStructureImpl } from "./typeStructures/ParenthesesTypedStructureImpl.js";
export { default as PrefixOperatorsTypedStructureImpl } from "./typeStructures/PrefixOperatorsTypedStructureImpl.js";
export { default as QualifiedNameTypedStructureImpl } from "./typeStructures/QualifiedNameTypedStructureImpl.js";
export { default as StringTypedStructureImpl } from "./typeStructures/StringTypedStructureImpl.js";
export { default as SymbolKeyTypedStructureImpl } from "./typeStructures/SymbolKeyTypedStructureImpl.js";
export { default as TemplateLiteralTypedStructureImpl } from "./typeStructures/TemplateLiteralTypedStructureImpl.js";
export { default as TupleTypedStructureImpl } from "./typeStructures/TupleTypedStructureImpl.js";
export { default as TypeArgumentedTypedStructureImpl } from "./typeStructures/TypeArgumentedTypedStructureImpl.js";
export { default as UnionTypedStructureImpl } from "./typeStructures/UnionTypedStructureImpl.js";
export { default as WriterTypedStructureImpl } from "./typeStructures/WriterTypedStructureImpl.js";

export { default as TypeStructureClassesMap } from "./base/TypeStructureClassesMap.js";

export {
  TypePrinterSettingsBase,
  type TypePrinterSettings,
  type TypePrinterSettingsInternal,
} from "./base/TypePrinter.js";

// #endregion TypeStructure implementations

export type {
  stringOrWriterFunction
} from "./types/ts-morph-native.js";

export type {
  StatementStructureImpls
} from "./types/StructureImplUnions.js";

export {
  createCodeBlockWriter,
  pairedWrite,
} from "./base/utilities.js";
