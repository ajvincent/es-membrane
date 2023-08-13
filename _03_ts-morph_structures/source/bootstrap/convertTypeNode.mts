// #region preamble

import {
  Node,
  TypeNode,
  SyntaxKind,
  ConditionalTypeNode,
  EntityName,
  TypeOperatorTypeNode,
  FunctionTypeNode,
  TypeParameterDeclaration,
  ParameterDeclaration,
  ConstructorTypeNode,
  Structures,
  StructureKind,
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
  ParenthesesTypedStructureImpl,
  ConditionalTypedStructureImpl,
  ArrayTypedStructureImpl,
  IndexedAccessTypedStructureImpl,
  FunctionTypedStructureImpl,
  TypeParameterDeclarationImpl,
  ParameterTypedStructureImpl,
  FunctionTypeContext,
  FunctionWriterStyle
} from "../../exports.mjs"

import {
  TypeStructureWithElements
} from "../typeStructures/ElementsTypedStructureAbstract.mjs";

import {
  TypeNodeToTypeStructureConsole,
} from "../types/TypeNodeToTypeStructure.mjs";

import type {
  NodeWithStructures
} from "./structureToNodeMap.mjs";

// #endregion preamble

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
  typeNode: TypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): TypeStructure | null
{
  if (Node.isLiteralTypeNode(typeNode)) {
    typeNode = typeNode.getFirstChildOrThrow()
  }
  const kind: SyntaxKind = typeNode.getKind();

  const keyword = LiteralKeywords.get(kind);
  if (keyword) {
    return new LiteralTypedStructureImpl(keyword);
  }

  if (Node.isNumericLiteral(typeNode)) {
    return new LiteralTypedStructureImpl(typeNode.getLiteralText());
  }
  if (Node.isStringLiteral(typeNode)) {
    return new StringTypedStructureImpl(typeNode.getLiteralText());
  }
  if (Node.isParenthesizedTypeNode(typeNode)) {
    const childStructure = convertTypeNode(
      typeNode.getTypeNode(),
      conversionFailCallback,
      subStructureResolver,
    );
    if (!childStructure)
      return null;
    return new ParenthesesTypedStructureImpl(childStructure);
  }

  if (Node.isArrayTypeNode(typeNode)) {
    const childStructure = convertTypeNode(
      typeNode.getElementTypeNode(),
      conversionFailCallback,
      subStructureResolver,
    );
    if (!childStructure)
      return null;
    return new ArrayTypedStructureImpl(childStructure);
  }

  if (Node.isIndexedAccessTypeNode(typeNode)) {
    const objectType = convertTypeNode(
      typeNode.getObjectTypeNode(),
      conversionFailCallback,
      subStructureResolver,
    );
    if (!objectType)
      return null;

    const indexType = convertTypeNode(
      typeNode.getIndexTypeNode(),
      conversionFailCallback,
      subStructureResolver,
    );
    if (!indexType)
      return null;

    return new IndexedAccessTypedStructureImpl(objectType, indexType);
  }

  if (Node.isTypeQuery(typeNode)) {
    const structure = buildLiteralForEntityName(typeNode.getExprName());
    return prependPrefixOperator("typeof", structure);
  }

  if (Node.isTypeOperatorTypeNode(typeNode)) {
    return convertTypeOperatorNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isConditionalTypeNode(typeNode)) {
    return convertConditionalTypeNode(typeNode, conversionFailCallback, subStructureResolver,);
  }

  if (Node.isFunctionTypeNode(typeNode) || Node.isConstructorTypeNode(typeNode)) {
    return convertFunctionTypeNode(typeNode, conversionFailCallback, subStructureResolver,);
  }

  let childTypeNodes: TypeNode[] = [],
      parentStructure: (TypeStructure & TypeStructureWithElements) | undefined = undefined;
  if (Node.isUnionTypeNode(typeNode)) {
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
    const objectType = buildLiteralForEntityName(typeNode.getTypeName());

    childTypeNodes = typeNode.getTypeArguments();
    if (childTypeNodes.length === 0)
      return objectType;

    parentStructure = new TypeArgumentedTypedStructureImpl(objectType);
  }
  else if (Node.isExpressionWithTypeArguments(typeNode)) {
    const expression = typeNode.getExpression();
    const objectType = new LiteralTypedStructureImpl(expression.getText());

    childTypeNodes = typeNode.getTypeArguments();
    if (childTypeNodes.length === 0)
      return objectType;

    parentStructure = new TypeArgumentedTypedStructureImpl(objectType);
  }

  if (parentStructure) {
    const success = convertAndAppendChildTypes(
      childTypeNodes,
      parentStructure.elements,
      conversionFailCallback,
      subStructureResolver,
    );
    if (success) {
      return parentStructure;
    }
  }

  const pos = typeNode.getPos();
  const { line, column } = typeNode.getSourceFile().getLineAndColumnAtPos(pos);
  conversionFailCallback(
    `unsupported type node "${typeNode.getKindName()}" at line ${line}, column ${column}`,
    typeNode
  );

  return null;
}

function buildLiteralForEntityName(
  entity: EntityName
): LiteralTypedStructureImpl
{
  return new LiteralTypedStructureImpl(entity.getText());
}

function convertTypeOperatorNode(
  typeNode: TypeOperatorTypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): PrefixOperatorsTypedStructureImpl | null
{
  const structure = convertTypeNode(
    typeNode.getTypeNode(),
    conversionFailCallback,
    subStructureResolver,
  );
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

function convertAndAppendChildTypes(
  childTypeNodes: readonly TypeNode[],
  elements: TypeStructure[],
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): boolean
{
  return childTypeNodes.every(typeNode => {
    const childStructure = convertTypeNode(typeNode, conversionFailCallback, subStructureResolver);
    if (childStructure) {
      elements.push(childStructure);
      return true;
    }

    return false;
  });
}

function convertConditionalTypeNode(
  condition: ConditionalTypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): ConditionalTypedStructureImpl | null
{
  const checkType: TypeStructure | null = convertTypeNode(
    condition.getCheckType(), conversionFailCallback, subStructureResolver,
  );
  if (!checkType)
    return null;

  const extendsType: TypeStructure | null = convertTypeNode(
    condition.getExtendsType(), conversionFailCallback, subStructureResolver
  );
  if (!extendsType)
    return null;

  const trueType: TypeStructure | null = convertTypeNode(
    condition.getTrueType(), conversionFailCallback, subStructureResolver
  );
  if (!trueType)
    return null;

  const falseType: TypeStructure | null = convertTypeNode(
    condition.getFalseType(), conversionFailCallback, subStructureResolver
  );
  if (!falseType)
    return null;

  return new ConditionalTypedStructureImpl({
    checkType,
    extendsType,
    trueType,
    falseType
  });
}

function convertFunctionTypeNode(
  typeNode: FunctionTypeNode | ConstructorTypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): FunctionTypedStructureImpl | null
{
  let typeParameterNodes: readonly TypeParameterDeclaration[] = [];
  try {
    // https://github.com/dsherret/ts-morph/issues/1434
    typeParameterNodes = (typeNode as Pick<FunctionTypeNode, "getTypeParameters">).getTypeParameters();
  }
  catch (ex) {
    typeParameterNodes = typeNode.getChildrenOfKind(SyntaxKind.TypeParameter);
  }

  const typeParameterStructures: TypeParameterDeclarationImpl[] = [];
  let failed = false;
  typeParameterNodes.forEach((declaration: TypeParameterDeclaration) => {
    if (failed)
      return;
    const subStructure = subStructureResolver(declaration);
    if (subStructure.kind !== StructureKind.TypeParameter) {
      failed = true;
      return;
    }

    if (subStructure instanceof TypeParameterDeclarationImpl)
      typeParameterStructures.push(subStructure);

    typeParameterStructures.push(TypeParameterDeclarationImpl.clone(subStructure));
  });
  if (failed)
    return null;

  let restParameter: ParameterTypedStructureImpl | undefined = undefined;
  const parameterNodes: ParameterDeclaration[] = typeNode.getParameters().slice();
  if (parameterNodes.length) {
    const lastParameter = parameterNodes[parameterNodes.length - 1];
    if (lastParameter.isRestParameter()) {
      parameterNodes.pop();
      restParameter = convertParameterTypeNode(
        lastParameter, conversionFailCallback, subStructureResolver
      );
    }
  }

  const parameterStructures: ParameterTypedStructureImpl[] = parameterNodes.map(
    parameterNode => convertParameterTypeNode(parameterNode, conversionFailCallback, subStructureResolver)
  );

  const returnTypeNode = typeNode.getReturnTypeNode();
  let returnTypeStructure: TypeStructure | undefined = undefined;
  if (returnTypeNode) {
    returnTypeStructure = convertTypeNode(returnTypeNode, conversionFailCallback, subStructureResolver) ?? undefined;
  }

  const functionContext: FunctionTypeContext = {
    name: undefined,
    isConstructor: typeNode instanceof ConstructorTypeNode,
    typeParameters: typeParameterStructures,
    parameters: parameterStructures,
    restParameter,
    returnType: returnTypeStructure,
    writerStyle: FunctionWriterStyle.Arrow,
  }

  return new FunctionTypedStructureImpl(functionContext);
}

function convertParameterTypeNode(
  node: ParameterDeclaration,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): ParameterTypedStructureImpl
{
  const paramTypeNode = node.getTypeNode();
  let paramTypeStructure: TypeStructure | null = null;
  if (paramTypeNode) {
    paramTypeStructure = convertTypeNode(
      paramTypeNode, conversionFailCallback, subStructureResolver
    );
  }
  return new ParameterTypedStructureImpl(node.getName(), paramTypeStructure ?? undefined);
}
