// #region preamble

import {
  ConditionalTypeNode,
  ConstructorTypeNode,
  EntityName,
  FunctionTypeNode,
  Node,
  ParameterDeclaration,
  Structures,
  StructureKind,
  SyntaxKind,
  TypeNode,
  TypeOperatorTypeNode,
  TypeParameterDeclaration,
  MappedTypeNode,
  TemplateLiteralTypeNode,
  TypeLiteralNode,
  ImportTypeNode,
} from "ts-morph"

import {
  ArrayTypedStructureImpl,
  ConditionalTypedStructureImpl,
  ImportTypedStructureImpl,
  IndexedAccessTypedStructureImpl,
  InferTypedStructureImpl,
  IntersectionTypedStructureImpl,
  FunctionTypeContext,
  FunctionTypedStructureImpl,
  FunctionWriterStyle,
  LiteralTypedStructureImpl,
  MappedTypeTypedStructureImpl,
  ParameterTypedStructureImpl,
  ParenthesesTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  PrefixUnaryOperator,
  QualifiedNameTypedStructureImpl,
  StringTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeParameterDeclarationImpl,
  type TypeStructures,
  UnionTypedStructureImpl,
  TemplateLiteralTypedStructureImpl,
  MemberedObjectTypeStructureImpl,
  StructuresClassesMap,
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
  TypePrinterSettingsBase,
} from "../exports.js"

import {
  TypeNodeToTypeStructureConsole,
} from "../types/TypeNodeToTypeStructure.js";

import type {
  NodeWithStructures
} from "./structureToNodeMap.js";
import StructureBase from "../base/StructureBase.js";

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

/**
 * Convert, via recursion into descendants, a type structure for a type node.  Upon a failure, log it and return null.
 * @param typeNode - the type node.
 * @param conversionFailCallback - a callback to notify for conversion failures.
 * @param subStructureResolver - when we discover a node with its own structures to investigate.
 * @returns the composite type structure, or null for a failure.
 */
export default function convertTypeNode(
  typeNode: TypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): TypeStructures | null
{
  if (Node.isLiteralTypeNode(typeNode)) {
    typeNode = typeNode.getFirstChildOrThrow();
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
    const structure = buildStructureForEntityName(typeNode.getExprName());
    return prependPrefixOperator("typeof", structure);
  }

  if (Node.isRestTypeNode(typeNode)) {
    const structure = convertTypeNode(
      typeNode.getLastChildOrThrow(),
      conversionFailCallback,
      subStructureResolver
    );
    if (!structure)
      return null;
    return prependPrefixOperator("...", structure);
  }

  if (Node.isInferTypeNode(typeNode)) {
    const declaration = typeNode.getTypeParameter();
    const subStructure = convertTypeParameterNode(declaration, subStructureResolver);
    if (!subStructure)
      return null;

    return new InferTypedStructureImpl(subStructure);
  }

  if (Node.isTypeOperatorTypeNode(typeNode)) {
    return convertTypeOperatorNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isConditionalTypeNode(typeNode)) {
    return convertConditionalTypeNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isFunctionTypeNode(typeNode) || Node.isConstructorTypeNode(typeNode)) {
    return convertFunctionTypeNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isMappedTypeNode(typeNode)) {
    return convertMappedTypeNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isTemplateLiteralTypeNode(typeNode)) {
    return convertTemplateLiteralTypeNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isTypeLiteral(typeNode)) {
    return convertTypeLiteralNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  if (Node.isImportTypeNode(typeNode)) {
    return convertImportTypeNode(typeNode, conversionFailCallback, subStructureResolver);
  }

  // Type nodes with generic type node children, based on a type.
  let childTypeNodes: TypeNode[] = [],
      parentStructure: (
        UnionTypedStructureImpl |
        IntersectionTypedStructureImpl |
        TupleTypedStructureImpl |
        TypeArgumentedTypedStructureImpl |
        undefined
      ) = undefined;
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
    const objectType = buildStructureForEntityName(typeNode.getTypeName());

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
      parentStructure.childTypes,
      conversionFailCallback,
      subStructureResolver,
    );
    if (success) {
      return parentStructure;
    }
  }

  return reportConversionFailure(
    "unsupported type node", typeNode, typeNode, conversionFailCallback
  );
}

function buildStructureForEntityName(
  entity: EntityName
): LiteralTypedStructureImpl | QualifiedNameTypedStructureImpl
{
  if (Node.isQualifiedName(entity)) {
    const leftStructure = buildStructureForEntityName(entity.getLeft());
    const rightStructure = buildStructureForEntityName(entity.getRight()) as LiteralTypedStructureImpl;
    if (leftStructure instanceof QualifiedNameTypedStructureImpl) {
      leftStructure.appendStructures([rightStructure]);
      return leftStructure;
    }

    return new QualifiedNameTypedStructureImpl([leftStructure, rightStructure]);
  }

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
  typeStructure: TypeStructures
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
  elements: TypeStructures[],
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
  const checkType: TypeStructures | null = convertTypeNode(
    condition.getCheckType(), conversionFailCallback, subStructureResolver,
  );
  if (!checkType)
    return null;

  const extendsType: TypeStructures | null = convertTypeNode(
    condition.getExtendsType(), conversionFailCallback, subStructureResolver
  );
  if (!extendsType)
    return null;

  const trueType: TypeStructures | null = convertTypeNode(
    condition.getTrueType(), conversionFailCallback, subStructureResolver
  );
  if (!trueType)
    return null;

  const falseType: TypeStructures | null = convertTypeNode(
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
  catch {
    typeParameterNodes = typeNode.getChildrenOfKind(SyntaxKind.TypeParameter);
  }

  const typeParameterStructures: TypeParameterDeclarationImpl[] = [];
  for (const declaration of typeParameterNodes.values()) {
    const subStructure = convertTypeParameterNode(declaration, subStructureResolver);
    if (!subStructure)
      return null;
    typeParameterStructures.push(subStructure);
  }

  let restParameter: ParameterTypedStructureImpl | undefined = undefined;

  const parameterNodes: ParameterDeclaration[] = typeNode.getParameters().slice();
  if (parameterNodes.length) {
    const lastParameter = parameterNodes[parameterNodes.length - 1];
    if (lastParameter.isRestParameter()) {
      parameterNodes.pop();
      restParameter = convertParameterNodeTypeNode(
        lastParameter, conversionFailCallback, subStructureResolver
      );
    }
  }

  const parameterStructures: ParameterTypedStructureImpl[] = parameterNodes.map(
    parameterNode => convertParameterNodeTypeNode(parameterNode, conversionFailCallback, subStructureResolver)
  );

  const returnTypeNode = typeNode.getReturnTypeNode();
  let returnTypeStructure: TypeStructures | undefined = undefined;
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

    typeParameterPrinterSettings: new TypePrinterSettingsBase,
    parameterPrinterSettings: new TypePrinterSettingsBase,
  }

  return new FunctionTypedStructureImpl(functionContext);
}

function convertTypeParameterNode(
  declaration: TypeParameterDeclaration,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): TypeParameterDeclarationImpl | null
{
  const subStructure = subStructureResolver(declaration);
  if (subStructure.kind !== StructureKind.TypeParameter)
    return null;

  if (subStructure instanceof TypeParameterDeclarationImpl)
    return subStructure;

  return TypeParameterDeclarationImpl.clone(subStructure);
}

function convertParameterNodeTypeNode(
  node: ParameterDeclaration,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): ParameterTypedStructureImpl
{
  const paramTypeNode = node.getTypeNode();
  let paramTypeStructure: TypeStructures | null = null;
  if (paramTypeNode) {
    paramTypeStructure = convertTypeNode(
      paramTypeNode, conversionFailCallback, subStructureResolver
    );
  }
  return new ParameterTypedStructureImpl(node.getName(), paramTypeStructure ?? undefined);
}

function convertMappedTypeNode(
  mappedTypeNode: MappedTypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): MappedTypeTypedStructureImpl | null
{
  let parameterStructure: TypeParameterDeclarationImpl;
  {
    const typeParameterNode = mappedTypeNode.getTypeParameter();
    const structure = convertTypeParameterNode(typeParameterNode, subStructureResolver);
    if (!structure) {
      return reportConversionFailure(
        "unsupported type parameter node",
        typeParameterNode, mappedTypeNode, conversionFailCallback
      );
    }
    parameterStructure = structure;
  }

  const mappedStructure = new MappedTypeTypedStructureImpl(parameterStructure);

  {
    let nameStructure: TypeStructures | undefined = undefined;
    const nameTypeNode = mappedTypeNode.getNameTypeNode();
    if (nameTypeNode) {
      nameStructure = convertTypeNode(nameTypeNode, conversionFailCallback, subStructureResolver) ?? undefined;
    }

    if (nameStructure)
      mappedStructure.asName = nameStructure;
  }

  {
    let typeStructure: TypeStructures | undefined = undefined;
    const typeNode = mappedTypeNode.getTypeNode();
    if (typeNode) {
      typeStructure = convertTypeNode(typeNode, conversionFailCallback, subStructureResolver) ?? undefined;
    }
    if (typeStructure)
      mappedStructure.type = typeStructure;
  }

  switch (mappedTypeNode.getReadonlyToken()?.getKind()) {
    case SyntaxKind.ReadonlyKeyword:
      mappedStructure.readonlyToken = "readonly";
      break;
    case SyntaxKind.PlusToken:
      mappedStructure.readonlyToken = "+readonly";
      break;
    case SyntaxKind.MinusToken:
      mappedStructure.readonlyToken = "-readonly";
      break;
  }

  switch (mappedTypeNode.getQuestionToken()?.getKind()) {
    case SyntaxKind.QuestionToken:
      mappedStructure.questionToken = "?";
      break;
    case SyntaxKind.PlusToken:
      mappedStructure.questionToken = "+?";
      break;
    case SyntaxKind.MinusToken:
      mappedStructure.questionToken = "-?";
      break;
  }

  return mappedStructure;
}

function convertTemplateLiteralTypeNode(
  templateNode: TemplateLiteralTypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): TemplateLiteralTypedStructureImpl | null
{
  const elements: (string | TypeStructures)[] = [];
  {
    const headText = templateNode.getHead().getLiteralText();
    if (headText)
      elements.push(headText);
  }

  for (const childTypeNode of templateNode.getTemplateSpans()) {
    if (
      (childTypeNode.getKind() !== SyntaxKind.TemplateLiteralTypeSpan) ||
      (childTypeNode.getChildCount() !== 2)
    ) {
      return reportConversionFailure(
        "unsupported template span", childTypeNode, childTypeNode, conversionFailCallback
      );
    }

    const [grandchildTypeNode, middleOrTailNode] = childTypeNode.getChildren();
    if (!Node.isLiteralLike(middleOrTailNode)) {
      return reportConversionFailure(
        "unsupported template middle or tail literal node",
        middleOrTailNode, childTypeNode, conversionFailCallback
      );
    }

    let grandchildStructure: TypeStructures | null;
    if (Node.isTypeNode(grandchildTypeNode)) {
      grandchildStructure = convertTypeNode(grandchildTypeNode, conversionFailCallback, subStructureResolver);
    }
    else {
      const kind: SyntaxKind = grandchildTypeNode.getKind();

      const keyword = LiteralKeywords.get(kind);
      if (keyword) {
        grandchildStructure = new LiteralTypedStructureImpl(keyword);
      }
      else {
        return reportConversionFailure(
          "unsupported template middle or tail type node",
          grandchildTypeNode, childTypeNode, conversionFailCallback
        );
      }
    }

    if (!grandchildStructure)
      return null;
    elements.push(grandchildStructure);

    const literalText = middleOrTailNode.getLiteralText();
    if (literalText)
      elements.push(literalText);
  }

  return new TemplateLiteralTypedStructureImpl(elements);
}

function convertTypeLiteralNode(
  memberedTypeNode: TypeLiteralNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): MemberedObjectTypeStructureImpl | null
{
  const structure = new MemberedObjectTypeStructureImpl;
  const members = memberedTypeNode.getMembers();
  for (const member of members) {
    let childStructure = subStructureResolver(member);
    if (!childStructure.kind) {
      return reportConversionFailure(
        "unknown member kind", member, memberedTypeNode, conversionFailCallback
      );
    }

    if (!(childStructure instanceof StructureBase)) {
      childStructure = StructuresClassesMap.get(childStructure.kind)!.clone(childStructure);
    }

    switch (childStructure.kind) {
      case StructureKind.CallSignature:
        structure.callSignatures.push(childStructure as CallSignatureDeclarationImpl);
        break;
      case StructureKind.ConstructSignature:
        structure.constructSignatures.push(childStructure as ConstructSignatureDeclarationImpl);
        break;
      case StructureKind.IndexSignature:
        structure.indexSignatures.push(childStructure as IndexSignatureDeclarationImpl);
        break;
      case StructureKind.MethodSignature:
        structure.methods.push(childStructure as MethodSignatureImpl);
        break;
      case StructureKind.PropertySignature:
        structure.properties.push(childStructure as PropertySignatureImpl);
        break;
      default:
        return reportConversionFailure(
          "unable to convert member of TypeElementMemberedTypeNode", member, memberedTypeNode, conversionFailCallback
        );
    }
  }

  return structure;
}

function convertImportTypeNode(
  importTypeNode: ImportTypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
  subStructureResolver: (node: NodeWithStructures) => Structures,
): ImportTypedStructureImpl | null
{
  const argument: StringTypedStructureImpl | null = convertTypeNode(
    importTypeNode.getArgument(),
    conversionFailCallback,
    subStructureResolver
  ) as StringTypedStructureImpl | null;
  if (!argument)
    return null;

  const qualifierType = importTypeNode.getQualifier();
  let qualifier: LiteralTypedStructureImpl | QualifiedNameTypedStructureImpl | null = null;
  if (qualifierType) {
    qualifier = buildStructureForEntityName(qualifierType);
  }

  const childTypeNodes: TypeNode[] = importTypeNode.getTypeArguments();
  const childTypes: TypeStructures[] = [];
  const success = convertAndAppendChildTypes(
    childTypeNodes,
    childTypes,
    conversionFailCallback,
    subStructureResolver,
  );
  if (success === false) {
    return null;
  }

  return new ImportTypedStructureImpl(argument, qualifier, childTypes);
}

function reportConversionFailure(
  prefixMessage: string,
  failingNode: Node,
  failingTypeNode: TypeNode,
  conversionFailCallback: TypeNodeToTypeStructureConsole,
): null
{
  const pos = failingNode.getPos();
  const { line, column } = failingNode.getSourceFile().getLineAndColumnAtPos(pos);

  conversionFailCallback(
    `${prefixMessage} "${failingNode.getKindName()}" at line ${line}, column ${column}`,
    failingTypeNode
  );
  return null;
}
