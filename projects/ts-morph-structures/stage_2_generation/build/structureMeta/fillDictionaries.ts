import {
  ArrayTypeNode,
  ExpressionWithTypeArguments,
  InterfaceDeclaration,
  type JSDoc,
  type JSDocStructure,
  Node,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeElementMemberedNode,
  TypeElementTypes,
  TypeNode,
} from "ts-morph";

import TS_MORPH_D from "#utilities/source/ts-morph-d-file.js";

import {
  DecoratorImplMeta,
  MetaType,
  PropertyName,
  PropertyValue,
  PropertyValueInUnion,
  StructureImplMeta,
  StructureMetaDictionaries,
  StructureUnionMeta,
} from "./DataClasses.js";

export default
function fillDictionaries(
  dictionary: StructureMetaDictionaries
): void
{
  const structureNames = new Set<string>(addStructureUnion(dictionary, "Structures").sort());

  const decoratorNameEntries: string[] = [];
  structureNames.forEach(name => {
    decoratorNameEntries.push(...addStructure(dictionary, name, name));
  });

  const decoratorNames = new Set<string>(decoratorNameEntries);
  decoratorNames.forEach(name => addDecorator(dictionary, name));

  consolidateNameDecorators(dictionary);
  consolidateScopeDecorators(dictionary);
  resolveDecoratorKeys(dictionary);
  countDecoratorUsage(dictionary);
  consolidateSingleUseDecorators(dictionary);
  consolidateDecorator(dictionary, "StaticableNodeStructure");
}

/**
 * Add "structure union metadata" for a given union type to our dictionary.
 * @param dictionary - our shared metadata about structures and unions.
 * @param name - the name of the union type in ts-morph.
 * @returns the list of structure interface names the union represents.
 */
function addStructureUnion(
  dictionary: StructureMetaDictionaries,
  name: string,
): string[]
{
  const typeAlias: TypeAliasDeclaration = TS_MORPH_D.getTypeAliasOrThrow(name);
  const typeNode: TypeNode = typeAlias.getTypeNodeOrThrow();

  let identifiers: string[];
  if (typeNode.isKind(SyntaxKind.TypeReference)) {
    identifiers = [getIdentifierFromTypeReference(typeNode)];
  }
  else {
    // union of type references
    identifiers = typeNode.asKindOrThrow(SyntaxKind.UnionType).getTypeNodes().map(getIdentifierFromTypeReference);
    identifiers.sort();
  }

  const data = new StructureUnionMeta(name);

  // For the "Structures" union at least, the identifiers refer to other unions of types.  Set up for recursion.
  identifiers.forEach(id => {
    let idSet: Set<string>;
    if (id.endsWith("Structures")) {
      idSet = data.unionKeys;
    }
    else {
      idSet = data.structureNames;
    }
    idSet.add(id);
  });

  const structureNames = Array.from(data.structureNames);
  data.unionKeys.forEach(key => structureNames.push(...addStructureUnion(dictionary, key)));

  dictionary.addDefinition(data);
  return structureNames;
}

function getIdentifierFromTypeReference(
  node: TypeNode
): string
{
  const refNode = node.asKindOrThrow(SyntaxKind.TypeReference);
  if (refNode.getTypeArguments().length > 0)
    throw new Error("type argument?");
  return refNode.getTypeName().getText();
}

/**
 *
 * @param dictionary - our shared metadata about structures and unions.
 * @param interfaceName - the name of the source interface.
 * @param targetInterfaceName - the name of the interface we really want to write.
 * @returns the decorator keys we get from this structure.
 *
 * @privateRemarks
 * Come on, give a better JSDoc than this!
 */
function addStructure(
  dictionary: StructureMetaDictionaries,
  interfaceName: string,
  targetInterfaceName: string,
): string[]
{
  const decl: InterfaceDeclaration = TS_MORPH_D.getInterfaceOrThrow(interfaceName);

  const structureMeta = dictionary.structures.getDefault(targetInterfaceName, () => {
    return new StructureImplMeta(targetInterfaceName);
  });

  addExtendsToMeta(targetInterfaceName, decl, structureMeta, dictionary);
  addMembersToMeta(interfaceName, targetInterfaceName, decl, structureMeta);

  return Array.from(structureMeta.decoratorKeys);
}

function addDecorator(
  dictionary: StructureMetaDictionaries,
  interfaceName: string,
): void
{
  if (dictionary.decorators.has(interfaceName))
    return;

  const decl: InterfaceDeclaration = TS_MORPH_D.getInterfaceOrThrow(interfaceName);

  const decoratorMeta = new DecoratorImplMeta(interfaceName);
  dictionary.decorators.set(interfaceName, decoratorMeta);

  addExtendsToMeta(interfaceName, decl, decoratorMeta, dictionary);
  addMembersToMeta(interfaceName, interfaceName, decl, decoratorMeta);

  decoratorMeta.decoratorKeys.forEach(
    subDecoratorName => addDecorator(dictionary, subDecoratorName)
  );
}

function addExtendsToMeta(
  targetInterfaceName: string,
  decl: InterfaceDeclaration,
  structureMeta: StructureImplMeta | DecoratorImplMeta,
  dictionary: StructureMetaDictionaries
): void
{
  const _extendsArray: ExpressionWithTypeArguments[] = decl.getExtends();
  for (const _extends of _extendsArray) {
    // Handle KindedStructure<StructureKind.Foo>
    const expression = _extends.getExpression().asKindOrThrow(SyntaxKind.Identifier);
    const idText = expression.getText();
    if (idText === "KindedStructure") {
      if (structureMeta.metaType === MetaType.Decorator)
        throw new Error("shouldn't be reachable");
      const qualifiedName = _extends.getTypeArguments()[0].asKindOrThrow(SyntaxKind.TypeReference).getTypeName().asKindOrThrow(SyntaxKind.QualifiedName);
      structureMeta.structureKindName = qualifiedName.getRight().getText();
      continue;
    }

    if (idText.endsWith("SpecificStructure") || idText.endsWith("BaseStructure")) {
      if (structureMeta.metaType === MetaType.Decorator)
        throw new Error("shouldn't be reachable");
      addStructure(dictionary, idText, targetInterfaceName);
      continue;
    }

    structureMeta.decoratorKeys.add(idText);
  }
}

function addMembersToMeta(
  interfaceName: string,
  targetInterfaceName: string,
  memberedNode: TypeElementMemberedNode,
  structureMeta: StructureImplMeta | DecoratorImplMeta
): void
{
  let member: TypeElementTypes;
  for (member of memberedNode.getMembers()) {
    const prop = member.asKindOrThrow(SyntaxKind.PropertySignature);
    const propertyName: PropertyName = prop.getName();

    const docNodes: readonly JSDoc[] = prop.getJsDocs();
    const docStructures: readonly JSDocStructure[] = docNodes.map(node => node.getStructure());
    structureMeta.jsDocStructuresMap.set(propertyName, docStructures);

    const isBoolean = Node.isBooleanKeyword(prop.getTypeNodeOrThrow());
    if (isBoolean) {
      structureMeta.booleanKeys.add(propertyName);
      continue;
    }

    const propertyValue = new PropertyValue;
    if (interfaceName !== targetInterfaceName)
      propertyValue.fromTypeName = interfaceName;
    propertyValue.hasQuestionToken = prop.hasQuestionToken();

    const typeNode: TypeNode = prop.getTypeNodeOrThrow();
    const isArray = fillPropertyValueWithTypeNodes(interfaceName, propertyName, propertyValue, typeNode);

    structureMeta.addField(propertyName, isArray, propertyValue);
  }
}

function fillPropertyValueWithTypeNodes(
  interfaceName: string,
  propertyName: PropertyName,
  propertyValue: PropertyValue,
  typeNode: TypeNode,
  depth = 0
): boolean
{
  let isArray = false;
  if (Node.isArrayTypeNode(typeNode)) {
    isArray = true;
    typeNode = typeNode.getElementTypeNode();
  }
  if (Node.isParenthesizedTypeNode(typeNode)) {
    typeNode = typeNode.getTypeNode();
  }

  let typeNodeArray: TypeNode[] = [typeNode];
  if (Node.isUnionTypeNode(typeNode)) {
    typeNodeArray = typeNode.getTypeNodes();

    let innerArray: ArrayTypeNode | undefined;
    for (const innerNode of typeNodeArray) {
      if (!Node.isArrayTypeNode(innerNode))
        continue;

      if (depth) {
        throw new Error(`we're already one level into the recursion?  ${interfaceName}.${propertyName}`);
      }

      if (innerArray) {
        throw new Error(`More than one inner array?  ${interfaceName}.${propertyName}`);
      }
      innerArray = innerNode;
    }

    if (innerArray) {
      return fillPropertyValueWithTypeNodes(
        interfaceName, propertyName, propertyValue, innerArray, depth + 1
      );
    }
  }

  const stringIndex = typeNodeArray.findIndex(type => Node.isStringKeyword(type));
  if (stringIndex > -1) {
    propertyValue.mayBeString = true;
    typeNodeArray.splice(stringIndex, 1);
  }

  const undefinedIndex = typeNodeArray.findIndex(type => Node.isUndefinedKeyword(type));
  if (undefinedIndex > -1) {
    propertyValue.mayBeUndefined = true;
    typeNodeArray.splice(undefinedIndex, 1);
  }

  const writerIndex = typeNodeArray.findIndex(type => {
    if (!Node.isTypeReference(type))
      return false;
    const args = type.getTypeArguments();
    if (args.length > 0)
      return false;
    return type.getText() === "WriterFunction";
  });
  if (writerIndex > -1) {
    propertyValue.mayBeWriter = true;
    typeNodeArray.splice(writerIndex, 1);
  }

  typeNodeArray.forEach(typeNode => {
    const value = new PropertyValueInUnion;
    if (Node.isTypeReference(typeNode) && typeNode.getTypeName().getText() === "OptionalKind") {
      value.isOptionalKind = true;
      typeNode = typeNode.getTypeArguments()[0];
    }

    const fullText = typeNode.getText();
    if (fullText.endsWith("Structures"))
      value.unionName = fullText;
    else if (fullText.endsWith("Structure"))
      value.structureName = fullText;
    else
      value.tsmorph_Type = fullText;

    propertyValue.otherTypes.push(value);
  });

  switch (interfaceName + ":" + propertyName) {
    case "ClassLikeDeclarationBaseSpecificStructure:extends":
    case "ExtendsClauseableNodeStructure:extends":
    case "ImplementsClauseableNodeStructure:implements":
    case "IndexSignatureDeclarationSpecificStructure:keyType":
    case "InterfaceDeclarationStructure:extends":
    case "ReturnTypedNodeStructure:returnType":
    case "TypedNodeStructure:type":
    case "TypeParameterDeclarationSpecificStructure:constraint":
    case "TypeParameterDeclarationSpecificStructure:default":
      propertyValue.representsType = true;
  }

  return isArray;
}

function consolidateNameDecorators(
  dictionary: StructureMetaDictionaries
): void
{
  for (const oldDecorator of [
    "AssertionKeyNamedNodeStructure",
    "BindingNamedNodeStructure",
    "ImportAttributeNamedNodeStructure",
    "JsxTagNamedNodeStructure",
    "ModuleNamedNodeStructure",
    "PropertyNamedNodeStructure",
  ])
  {
    for (const str of dictionary.structures.values()) {
      if (str.decoratorKeys.has(oldDecorator)) {
        str.decoratorKeys.add("NamedNodeStructure");
        str.decoratorKeys.delete(oldDecorator);
      }
    }

    for (const dec of dictionary.decorators.values()) {
      if (dec.decoratorKeys.has(oldDecorator)) {
        dec.decoratorKeys.add("NamedNodeStructure");
        dec.decoratorKeys.delete(oldDecorator);
      }
    }

    dictionary.decorators.delete(oldDecorator);
  }

  {
    const classStructure = dictionary.structures.get("ClassDeclarationStructure")!
    classStructure.decoratorKeys.add("NameableNodeStructure");
    classStructure.structureFields.delete("name");
  }

  for (const structureName of [
    "DecoratorStructure",
    "ExportSpecifierStructure",
    "ImportSpecifierStructure",
    "JsxElementStructure",
  ])
  {
    const structure = dictionary.structures.get(structureName)!;
    structure.decoratorKeys.add("NamedNodeStructure");
    structure.structureFields.delete("name");
  }
}

function consolidateScopeDecorators(
  dictionary: StructureMetaDictionaries
): void
{
  const oldDecorator = "ScopeableNodeStructure";
  {
    for (const str of dictionary.structures.values()) {
      if (str.decoratorKeys.has(oldDecorator)) {
        str.decoratorKeys.add("ScopedNodeStructure");
        str.decoratorKeys.delete(oldDecorator);
      }
    }

    for (const dec of dictionary.decorators.values()) {
      if (dec.decoratorKeys.has(oldDecorator)) {
        dec.decoratorKeys.add("ScopedNodeStructure");
        dec.decoratorKeys.delete(oldDecorator);
      }
    }

    dictionary.decorators.delete(oldDecorator);
  }
}

function resolveDecoratorKeys(
  dictionary: StructureMetaDictionaries
): void
{
  const resolvables = new Map<string, string[]>;
  for (const dec of dictionary.decorators.values()) {
    if (dec.decoratorKeys.size === 0)
      continue;
    resolvables.set(dec.structureName, Array.from(dec.decoratorKeys));
  }

  let found: boolean;
  do {
    found = false;
    for (const str of dictionary.structures.values()) {
      for (const [name, subnames] of resolvables) {
        if (str.decoratorKeys.has(name)) {
          subnames.forEach(subname => str.decoratorKeys.add(subname));
          str.decoratorKeys.delete(name);
          found = true;
        }
      }
    }
  } while (found);

  for (const name of resolvables.keys()) {
    dictionary.decorators.delete(name);
  }
}

function countDecoratorUsage(
  dictionary: StructureMetaDictionaries
): void
{
  for (const str of dictionary.structures.values()) {
    for (const decName of str.decoratorKeys) {
      const dec = dictionary.decorators.get(decName)!;
      if (!dec)
        throw new Error(str.structureName + ": " + decName);
      dec.addStructureUsing(str.structureName);
    }
  }
}

function consolidateSingleUseDecorators(
  dictionary: StructureMetaDictionaries
): void
{
  for (const [name, dec] of dictionary.decorators.entries()) {
    const { structuresUsing } = dec;
    if (structuresUsing.size >= 2)
      continue;

    consolidateDecorator(dictionary, name);
  }
}

function consolidateDecorator(
  dictionary: StructureMetaDictionaries,
  decoratorName: string
): void
{
  const decorator = dictionary.decorators.get(decoratorName)!;
  decorator.structuresUsing.forEach(structureName => {
    moveDecoratorIntoStructure(
      decorator,
      dictionary.structures.get(structureName)!
    )
  });
  dictionary.decorators.delete(decoratorName);
}

function moveDecoratorIntoStructure(
  decorator: DecoratorImplMeta,
  structure: StructureImplMeta,
): void
{
  for (const subname of decorator.booleanKeys.values()) {
    structure.booleanKeys.add(subname);
  }
  for (const [subname, value] of decorator.structureFieldArrays) {
    structure.structureFieldArrays.set(subname, value);
  }
  for (const [subname, value] of decorator.structureFields) {
    structure.structureFields.set(subname, value);
  }
  for (const [key, docStructures] of decorator.jsDocStructuresMap) {
    structure.jsDocStructuresMap.set(key, docStructures);
  }

  structure.decoratorKeys.delete(decorator.structureName);
}
