export {
  default as getTypeAugmentedStructure,
  type RootStructureWithConvertFailures,
  type TypeNodeToTypeStructureConsole,
} from "./source/bootstrap/getTypeAugmentedStructure.mjs";

// #region Structure implementations

export { default as AssertEntryImpl } from "./source/structures/AssertEntryImpl.mjs";
export { default as CallSignatureDeclarationImpl } from "./source/structures/CallSignatureDeclarationImpl.mjs";
export { default as ClassDeclarationImpl } from "./source/structures/ClassDeclarationImpl.mjs";
export { default as ConstructorDeclarationImpl }  from "./source/structures/ConstructorDeclarationImpl.mjs";
export { default as ConstructorDeclarationOverloadImpl } from "./source/structures/ConstructorDeclarationOverloadImpl.mjs";
export { default as ConstructSignatureDeclarationImpl } from "./source/structures/ConstructSignatureDeclarationImpl.mjs";
export { default as DecoratorImpl }  from "./source/structures/DecoratorImpl.mjs";
export { default as EnumDeclarationImpl } from "./source/structures/EnumDeclarationImpl.mjs";
export { default as EnumMemberImpl } from "./source/structures/EnumMemberImpl.mjs";
export { default as ExportAssignmentImpl } from "./source/structures/ExportAssignmentImpl.mjs";
export { default as ExportDeclarationImpl } from "./source/structures/ExportDeclarationImpl.mjs";
export { default as ExportSpecifierImpl } from "./source/structures/ExportSpecifierImpl.mjs";
export { default as FunctionDeclarationImpl } from "./source/structures/FunctionDeclarationImpl.mjs";
export { default as FunctionDeclarationOverloadImpl } from "./source/structures/FunctionDeclarationOverloadImpl.mjs";
export { default as GetAccessorDeclarationImpl } from "./source/structures/GetAccessorDeclarationImpl.mjs";
export { default as ImportDeclarationImpl } from "./source/structures/ImportDeclarationImpl.mjs";
export { default as ImportSpecifierImpl } from "./source/structures/ImportSpecifierImpl.mjs";
export { default as IndexSignatureDeclarationImpl } from "./source/structures/IndexSignatureDeclarationImpl.mjs";
export { default as InterfaceDeclarationImpl } from "./source/structures/InterfaceDeclarationImpl.mjs";
export { default as JSDocImpl } from "./source/structures/JSDocImpl.mjs";
export { default as JSDocTagImpl } from "./source/structures/JSDocTagImpl.mjs";
export { default as MethodDeclarationImpl } from "./source/structures/MethodDeclarationImpl.mjs";
export { default as MethodDeclarationOverloadImpl } from "./source/structures/MethodDeclarationOverloadImpl.mjs";
export { default as MethodSignatureImpl } from "./source/structures/MethodSignatureImpl.mjs";
export { default as ModuleDeclarationImpl } from "./source/structures/ModuleDeclarationImpl.mjs";
export { default as ParameterDeclarationImpl } from "./source/structures/ParameterDeclarationImpl.mjs";
export { default as PropertyDeclarationImpl } from "./source/structures/PropertyDeclarationImpl.mjs";
export { default as PropertySignatureImpl } from "./source/structures/PropertySignatureImpl.mjs";
export { default as SetAccessorDeclarationImpl } from "./source/structures/SetAccessorDeclarationImpl.mjs";
export { default as SourceFileImpl } from "./source/structures/SourceFileImpl.mjs";
export { default as TypeAliasDeclarationImpl } from "./source/structures/TypeAliasDeclarationImpl.mjs";
export { default as TypeParameterDeclarationImpl } from "./source/structures/TypeParameterDeclarationImpl.mjs";
export { default as VariableDeclarationImpl } from "./source/structures/VariableDeclarationImpl.mjs";
export { default as VariableStatementImpl } from "./source/structures/VariableStatementImpl.mjs";

export { default as StructuresClassesMap } from "./source/base/StructuresClassesMap.mjs";

export {
  TypeParameterConstraintMode
} from "./source/structures/TypeParameterDeclarationImpl.mjs";

export {
  TypeElementMemberedOwner
} from "./source/decorators/TypeElementMemberedNode.mjs";

export type {
  MethodDeclarationAppendContext,
  MethodDeclarationEnableFlags,
} from "./source/structures/MethodDeclarationImpl.mjs";

// #endregion Structure implementations

// #region TypeStructure implementations

export * from "./source/typeStructures/TypeStructures.mjs";

export type {
  ClassDeclarationWithImplementsTypeStructures,
  InterfaceDeclarationWithExtendsTypeStructures,
  ReturnTypedNodeTypeStructure,
  TypedNodeTypeStructure,
  TypeParameterWithTypeStructures,
} from "./source/typeStructures/TypeAndTypeStructureInterfaces.mjs";

export {
  TypeStructureKind,
  type KindedTypeStructure,
} from "./source/base/TypeStructureKind.mjs";

export { default as ArrayTypedStructureImpl } from "./source/typeStructures/ArrayTypedStructureImpl.mjs";
export { default as ConditionalTypedStructureImpl } from "./source/typeStructures/ConditionalTypedStructureImpl.mjs";
export { default as FunctionTypedStructureImpl } from "./source/typeStructures/FunctionTypedStructureImpl.mjs";
export { default as IndexedAccessTypedStructureImpl } from "./source/typeStructures/IndexedAccessTypedStructureImpl.mjs";
export { default as InferTypedStructureImpl } from "./source/typeStructures/InferTypedStructureImpl.mjs";
export { default as IntersectionTypedStructureImpl } from "./source/typeStructures/IntersectionTypedStructureImpl.mjs"
export { default as LiteralTypedStructureImpl } from "./source/typeStructures/LiteralTypedStructureImpl.mjs";
export { default as MappedTypeTypedStructureImpl } from "./source/typeStructures/MappedTypeTypedStructureImpl.mjs";
export { default as ObjectLiteralTypedStructureImpl } from "./source/typeStructures/ObjectLiteralTypedStructureImpl.mjs";
export { default as ParameterTypedStructureImpl } from "./source/typeStructures/ParameterTypedStructureImpl.mjs";
export { default as ParenthesesTypedStructureImpl } from "./source/typeStructures/ParenthesesTypedStructureImpl.mjs";
export { default as PrefixOperatorsTypedStructureImpl } from "./source/typeStructures/PrefixOperatorsTypedStructureImpl.mjs";
export { default as StringTypedStructureImpl } from "./source/typeStructures/StringTypedStructureImpl.mjs";
export { default as SymbolKeyTypedStructureImpl } from "./source/typeStructures/SymbolKeyTypedStructureImpl.mjs";
export { default as TemplateLiteralTypedStructureImpl } from "./source/typeStructures/TemplateLiteralTypedStructureImpl.mjs";
export { default as TupleTypedStructureImpl } from "./source/typeStructures/TupleTypedStructureImpl.mjs";
export { default as TypeArgumentedTypedStructureImpl } from "./source/typeStructures/TypeArgumentedTypedStructureImpl.mjs";
export { default as UnionTypedStructureImpl } from "./source/typeStructures/UnionTypedStructureImpl.mjs";
export { default as WriterTypedStructureImpl } from "./source/typeStructures/WriterTypedStructureImpl.mjs";

export { default as TypeStructureClassesMap } from "./source/base/TypeStructureClassesMap.mjs";

export {
  TypePrinterSettingsBase,
  type TypePrinterSettings,
  type TypePrinterSettingsInternal,
} from "./source/base/TypePrinter.mjs";

// #endregion TypeStructure implementations

export {
  createCodeBlockWriter,
  pairedWrite,
} from "./source/base/utilities.mjs";
