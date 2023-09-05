import {
  SourceFile,
  SyntaxKind,
} from "ts-morph";

import {
  getTypeAugmentedStructure,
  InterfaceDeclarationImpl,
  ObjectLiteralTypedStructureImpl,
  TypeAliasDeclarationImpl,
  TypeNodeToTypeStructureConsole,
} from "#ts-morph_structures/exports.mjs";

export default function getTypeElementMemberedOwner(
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  userConsole: TypeNodeToTypeStructureConsole,
  resolveTypeAliasStructure?: (alias: TypeAliasDeclarationImpl) => ObjectLiteralTypedStructureImpl
): InterfaceDeclarationImpl | ObjectLiteralTypedStructureImpl
{
  const interfaceNode = sourceFile.getInterface(interfaceOrAliasName);
  if (interfaceNode) {
    return getTypeAugmentedStructure(interfaceNode, userConsole).rootStructure as InterfaceDeclarationImpl;
  }

  const aliasNode = sourceFile.getTypeAliasOrThrow(interfaceOrAliasName);
  if (!aliasNode.getTypeNodeOrThrow().asKind(SyntaxKind.TypeLiteral) && !resolveTypeAliasStructure) {
    throw new Error("alias node does not wrap a type literal.  I need a resolveTypeAliasStructure callback to get you an object literal.")
  }

  const aliasStructure = getTypeAugmentedStructure(aliasNode, userConsole).rootStructure as TypeAliasDeclarationImpl;
  const { typeStructure } = aliasStructure;
  if (typeStructure instanceof ObjectLiteralTypedStructureImpl)
    return typeStructure;

  return resolveTypeAliasStructure!(aliasStructure);
}
