import type graphlib from "@dagrejs/graphlib";

import type {
  JsonObject
} from "type-fest";

import {
  HostObjectGraphImpl,
  type HostObjectGraph
} from "../../source/graph-analysis/HostObjectGraphImpl.js";

import type {
  SearchConfiguration
} from "../../source/public/core-host/runSearchesInGuestEngine.js";

import type {
  GraphWeakKeyMetadata
} from "../../source/types/GraphWeakKeyMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../source/types/GraphRelationshipMetadata.js";

import {
  BuiltInJSTypeName,
  ChildReferenceEdgeType,
} from "../../source/utilities/constants.js";

import {
  isObjectOrSymbol
} from "../../source/utilities/isObjectOrSymbol.js";

export function createExpectedGraph(
  target: object,
  targetJSTypeName: BuiltInJSTypeName,
  targetClassName: string,
  startingObject: object,
  startingJSTypeName: BuiltInJSTypeName,
  startingClassName: string,
  configuration?: SearchConfiguration,
): [HostObjectGraphImpl, WeakKey[]]
{
  const targetMetadata: GraphWeakKeyMetadata = {
    builtInJSTypeName: targetJSTypeName,
    derivedClassName: targetClassName,
    classSpecifier: null,
    classLineNumber: null,
    symbolDescription: null,
  };

  const heldValuesMetadata: GraphWeakKeyMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array,
    classSpecifier: null,
    classLineNumber: null,
    symbolDescription: null,
  };

  const heldValues: WeakKey[] = [];
  const ExpectedObjectGraph = new HostObjectGraphImpl(configuration);
  ExpectedObjectGraph.defineTargetAndHeldValues(
    target, targetMetadata, heldValues, heldValuesMetadata
  );

  heldValues.push(startingObject);

  addObjectGraphNode(ExpectedObjectGraph, startingObject, startingJSTypeName, startingClassName);
  addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, startingObject, false);

  return [ExpectedObjectGraph, heldValues];
}

export function addObjectGraphNode(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  object: object,
  builtInJSTypeName: BuiltInJSTypeName,
  derivedClassName: string,
  classSpecifier?: string,
  classLineNumber?: number,
): void
{
  const metadata: GraphWeakKeyMetadata = {
    builtInJSTypeName,
    derivedClassName,
    classSpecifier: null,
    classLineNumber: null,
    symbolDescription: null,
  };
  if (classSpecifier)
    metadata.classSpecifier = "virtual://home/reference-spec/" + classSpecifier;
  if (classLineNumber)
    metadata.classLineNumber = classLineNumber;

  graph.defineObject(object, metadata);
}

export function addSymbolGraphNode(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  symbol: symbol,
): void
{
  const metadata: GraphWeakKeyMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Symbol,
    derivedClassName: BuiltInJSTypeName.Symbol,
    classSpecifier: null,
    classLineNumber: null,
    symbolDescription: symbol.description ?? null,
  };

  graph.defineSymbol(symbol, metadata);
}

export function addPrivateName(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  privateKey: `#${string}`
): object
{
  const privateName = {};
  graph.definePrivateName(privateName, privateKey);
  return privateName;
}

export function addArrayIndexEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  parentObject: object,
  index: number,
  childObject: object | symbol,
  isGetter: boolean,
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.ArrayIndex
  };

  graph.definePropertyOrGetter(parentObject, index, childObject, relationship, isGetter);
}

export function addPropertyNameEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  parentObject: object,
  propertyName: string,
  childObject: object,
  isGetter: boolean
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.PropertyName
  };

  graph.definePropertyOrGetter(
    parentObject, propertyName, childObject, relationship, isGetter
  );
}

export function addSymbolAsObjectKeyEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  parentObject: object,
  symbolKey: symbol,
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.SymbolKey
  };
  graph.defineAsSymbolKey(parentObject, symbolKey, relationship);
}

export function addPropertySymbolEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  parentObject: object,
  propertyKey: symbol,
  childObject: object,
  isGetter: boolean
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.PropertySymbol
  };

  graph.definePropertyOrGetter(
    parentObject, propertyKey, childObject, relationship, isGetter
  );
}

export function addScopeValueEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  functionObject: object,
  identifier: string,
  objectValue: WeakKey,
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.ScopeValue
  };

  graph.defineScopeValue(functionObject, identifier, objectValue, relationship);
}

export function addInternalSlotEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  parentObject: object,
  slotName: `[[${string}]]`,
  childObject: WeakKey,
  isStrongReference: boolean,
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.InternalSlot
  };

  graph.defineInternalSlot(
    parentObject, slotName, childObject, isStrongReference, relationship
  );
}

export function addMapKeyAndValue(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  map: object,
  key: unknown,
  value: unknown,
  isStrongReference: boolean,
): void
{
  let keyRelationship: GraphRelationshipMetadata | undefined;
  if (isObjectOrSymbol(key)) {
    keyRelationship = {
      parentToChildEdgeType: ChildReferenceEdgeType.MapKey
    };
  }

  let valueRelationship: GraphRelationshipMetadata | undefined;
  if (isObjectOrSymbol(value)) {
    valueRelationship = {
      parentToChildEdgeType: ChildReferenceEdgeType.MapValue
    };
  }

  graph.defineMapKeyValueTuple(
    map, key, value, isStrongReference, keyRelationship, valueRelationship
  );
}

export function addSetElementEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  set: object,
  value: WeakKey,
  isStrongReference: boolean,
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.SetElement
  };
  graph.defineSetValue(set, value, isStrongReference, relationship);
}

export function addPrivateFieldEdge(
  graph: HostObjectGraph<GraphWeakKeyMetadata, JsonObject>,
  parent: object,
  privateName: object,
  privateKey: `#${string}`,
  child: WeakKey,
  isGetter: boolean
): void
{
  const privateNameRelationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.PrivateClassKey
  };

  const valueRelationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.PrivateClassValue
  };

  graph.definePrivateField(
    parent, privateName, privateKey, child,
    privateNameRelationship, valueRelationship, isGetter
  );
}

export function addSpecifierAndLine(
  graph: graphlib.Graph,
  nodeId: string,
  classSpecifier: string,
  classLineNumber: number,
): void
{
  const node = graph.node(nodeId) as Record<"metadata", GraphWeakKeyMetadata>;
  node.metadata.classSpecifier = "virtual://home/reference-spec/" + classSpecifier;
  node.metadata.classLineNumber = classLineNumber;
}
