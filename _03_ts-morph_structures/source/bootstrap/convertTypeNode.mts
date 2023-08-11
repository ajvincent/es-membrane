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
  TypeNodeToTypeStructure,
  TypeNodeToTypeStructureConsole,
} from "../types/TypeNodeToTypeStructure.mjs";

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

let conversionFailCallback: TypeNodeToTypeStructureConsole | undefined = undefined;

export default function convertTypeNode(
  typeNode: TypeNode,
  _console: TypeNodeToTypeStructureConsole,
): TypeStructure | null
{
  conversionFailCallback = _console;
  try {
    return convertTypeNodeInternal(typeNode);
  }
  finally {
    conversionFailCallback = undefined;
  }
}
convertTypeNode satisfies TypeNodeToTypeStructure;

/** @internal */
export function convertTypeNodeInternal(
  typeNode: TypeNode,
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
    const childStructure = convertTypeNodeInternal(typeNode.getTypeNode());
    if (!childStructure)
      return null;
    return new ParenthesesTypedStructureImpl(childStructure);
  }

  if (Node.isArrayTypeNode(typeNode)) {
    const childStructure = convertTypeNodeInternal(typeNode.getElementTypeNode());
    if (!childStructure)
      return null;
    return new ArrayTypedStructureImpl(childStructure);
  }

  if (Node.isIndexedAccessTypeNode(typeNode)) {
    const objectType = convertTypeNodeInternal(typeNode.getObjectTypeNode());
    if (!objectType)
      return null;

    const indexType = convertTypeNodeInternal(typeNode.getIndexTypeNode());
    if (!indexType)
      return null;

    return new IndexedAccessTypedStructureImpl(objectType, indexType);
  }

  if (Node.isTypeQuery(typeNode)) {
    const structure = buildLiteralForEntityName(typeNode.getExprName());
    return prependPrefixOperator("typeof", structure);
  }

  if (Node.isTypeOperatorTypeNode(typeNode)) {
    return convertTypeOperatorNode(typeNode);
  }

  if (Node.isConditionalTypeNode(typeNode)) {
    return convertConditionalTypeNode(typeNode);
  }

  if (Node.isFunctionTypeNode(typeNode) || Node.isConstructorTypeNode(typeNode)) {
    return convertFunctionTypeNode(typeNode);
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

  if (parentStructure && convertAndAppendChildTypes(childTypeNodes, parentStructure.elements))
    return parentStructure;

  if (conversionFailCallback) {
    const pos = typeNode.getPos();
    const { line, column } = typeNode.getSourceFile().getLineAndColumnAtPos(pos);
    conversionFailCallback(
      `unsupported type node "${typeNode.getKindName()}" at line ${line}, column ${column}`,
      typeNode
    );
  }
  return null;
}

function buildLiteralForEntityName(
  entity: EntityName
): LiteralTypedStructureImpl
{
  return new LiteralTypedStructureImpl(entity.getText());
}

function convertTypeOperatorNode(
  typeNode: TypeOperatorTypeNode
): PrefixOperatorsTypedStructureImpl | null
{
  const structure = convertTypeNodeInternal(typeNode.getTypeNode());
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
  elements: TypeStructure[]
): boolean
{
  return childTypeNodes.every(typeNode => {
    const childStructure = convertTypeNodeInternal(typeNode);
    if (childStructure) {
      elements.push(childStructure);
      return true;
    }

    return false;
  });
}

function convertConditionalTypeNode(
  condition: ConditionalTypeNode
): ConditionalTypedStructureImpl | null
{
  const checkType: TypeStructure | null = convertTypeNodeInternal(condition.getCheckType());
  if (!checkType)
    return null;

  const extendsType: TypeStructure | null = convertTypeNodeInternal(condition.getExtendsType());
  if (!extendsType)
    return null;

  const trueType: TypeStructure | null = convertTypeNodeInternal(condition.getTrueType());
  if (!trueType)
    return null;

  const falseType: TypeStructure | null = convertTypeNodeInternal(condition.getFalseType());
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
  typeNode: FunctionTypeNode | ConstructorTypeNode
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

  // Am I missing mapping these to type structures?  Probably, because of the getStructure() call.
  const typeParameterStructures = typeParameterNodes.map(
    declaration => TypeParameterDeclarationImpl.clone(declaration.getStructure())
  );

  let restParameter: ParameterTypedStructureImpl | undefined = undefined;
  const parameterNodes: ParameterDeclaration[] = typeNode.getParameters().slice();
  if (parameterNodes.length) {
    const lastParameter = parameterNodes[parameterNodes.length - 1];
    if (lastParameter.isRestParameter()) {
      parameterNodes.pop();
      restParameter = convertParameterTypeNode(lastParameter);
    }
  }

  const parameterStructures: ParameterTypedStructureImpl[] = parameterNodes.map(convertParameterTypeNode);

  const returnTypeNode = typeNode.getReturnTypeNode();
  let returnTypeStructure: TypeStructure | undefined = undefined;
  if (returnTypeNode) {
    returnTypeStructure = convertTypeNodeInternal(returnTypeNode) ?? undefined;
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
  node: ParameterDeclaration
): ParameterTypedStructureImpl
{
  const paramTypeNode = node.getTypeNode();
  let paramTypeStructure: TypeStructure | null = null;
  if (paramTypeNode) {
    paramTypeStructure = convertTypeNodeInternal(paramTypeNode);
  }
  return new ParameterTypedStructureImpl(node.getName(), paramTypeStructure ?? undefined);
}
