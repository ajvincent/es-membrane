import {
  Node,
  TypeNode,
  SyntaxKind,
} from "ts-morph"

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
  UnionTypedStructureImpl,
  type TypeStructure,
  PrefixUnaryOperator,
  IntersectionTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  ParenthesesTypedStructureImpl
} from "../../exports.mjs"

import {
  TypeStructureWithElements
} from "../typeStructures/ElementsTypedStructureAbstract.mjs";

const LiteralKeywords: ReadonlyMap<SyntaxKind, string> = new Map([
  [SyntaxKind.AnyKeyword, "any"],
  [SyntaxKind.BooleanKeyword, "boolean"],
  [SyntaxKind.FalseKeyword, "false"],
  [SyntaxKind.NeverKeyword, "never"],
  [SyntaxKind.NumberKeyword, "number"],
  [SyntaxKind.NullKeyword, "null"],
  [SyntaxKind.ObjectKeyword, "object"],
  [SyntaxKind.StringKeyword, "string"],
  [SyntaxKind.SymbolKeyword, "symbol"],
  [SyntaxKind.TrueKeyword, "true"],
  [SyntaxKind.UndefinedKeyword, "undefined"],
  [SyntaxKind.UnknownKeyword, "unknown"],
  [SyntaxKind.VoidKeyword, "void"],
]);

export default function convertTypeNode(
  typeNode: TypeNode
): TypeStructure | null
{
  if (Node.isLiteralTypeNode(typeNode)) {
    typeNode = typeNode.getFirstChildOrThrow()
  }
  const kind: SyntaxKind = typeNode.getKind();

  {
    const keyword = LiteralKeywords.get(kind);
    if (keyword) {
      return new LiteralTypedStructureImpl(keyword);
    }
  }

  if (Node.isNumericLiteral(typeNode)) {
    return new LiteralTypedStructureImpl(typeNode.getLiteralText());
  }
  if (Node.isStringLiteral(typeNode)) {
    return new StringTypedStructureImpl(typeNode.getLiteralText());
  }
  if (Node.isParenthesizedTypeNode(typeNode)) {
    const childStructure = convertTypeNode(typeNode.getTypeNode());
    if (!childStructure)
      return null;
    return new ParenthesesTypedStructureImpl(childStructure);
  }

  if (Node.isTypeQuery(typeNode)) {
    const structure = new LiteralTypedStructureImpl(typeNode.getExprName().getText());
    return prependPrefixOperator("typeof", structure);
  }

  if (Node.isTypeOperatorTypeNode(typeNode)) {
    const structure = convertTypeNode(typeNode.getTypeNode());
    if (!structure)
      return null;
    switch (typeNode.getOperator()) {
      case SyntaxKind.ReadonlyKeyword:
        return prependPrefixOperator("readonly", structure);

      case SyntaxKind.KeyOfKeyword:
        return prependPrefixOperator("keyof", structure);

      case SyntaxKind.UniqueKeyword:
        return prependPrefixOperator("unique", structure);

      // no other possibilities
      default:
        return null;
    }
  }

  {
    let childTypeNodes: TypeNode[] = [],
        parentStructure: TypeStructure & TypeStructureWithElements | undefined = undefined;
    if (Node.isUnionTypeNode(typeNode))
    {
      parentStructure = new UnionTypedStructureImpl;
      childTypeNodes = typeNode.getTypeNodes();
    }
    else if (Node.isIntersectionTypeNode(typeNode)) {
      parentStructure = new IntersectionTypedStructureImpl;
      childTypeNodes = typeNode.getTypeNodes();
    }
    else if (Node.isTupleTypeNode(typeNode)) {
      parentStructure = new TupleTypedStructureImpl;
      childTypeNodes = typeNode.getElements();
    }
    else if (Node.isTypeReference(typeNode)) {
      childTypeNodes = typeNode.getTypeArguments();
      const objectType = new LiteralTypedStructureImpl(typeNode.getTypeName().getText());
      if (childTypeNodes.length === 0)
        return objectType;
      parentStructure = new TypeArgumentedTypedStructureImpl(objectType);
    }

    if (parentStructure) {
      if (convertChildTypes(childTypeNodes, parentStructure))
        return parentStructure;
      return null;
    }
  }

  return null;
}

function convertChildTypes(
  childTypeNodes: readonly TypeNode[],
  parentTypeStructure: TypeStructureWithElements
): boolean
{
  return childTypeNodes.every(typeNode => {
    const childStructure = convertTypeNode(typeNode);
    if (childStructure) {
      parentTypeStructure.elements.push(childStructure);
      return true;
    }

    return false;
  });
}

function prependPrefixOperator(
  operator: PrefixUnaryOperator,
  typeStructure: TypeStructure
): PrefixOperatorsTypedStructureImpl
{
  if (typeStructure instanceof PrefixOperatorsTypedStructureImpl) {
    typeStructure.operators.unshift(operator);
    return typeStructure;
  }

  return new PrefixOperatorsTypedStructureImpl(
    [operator], typeStructure
  );
}
