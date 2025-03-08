import type {
  JsonObject
} from "type-fest";

import type {
  ObjectGraphIfc
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

import {
  GraphObjectMetadata
} from "../../source/types/GraphObjectMetadata.js";

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

export function addObjectGraphNode(
  graph: ObjectGraphIfc<object, symbol, GraphObjectMetadata, JsonObject>,
  object: object,
  builtInJSTypeName: BuiltInJSTypeName,
  derivedClassName: string
): void
{
  const metadata: GraphObjectMetadata = {
    builtInJSTypeName,
    derivedClassName
  };

  graph.defineObject(object, metadata);
}

export function addSymbolGraphNode(
  graph: ObjectGraphIfc<object, symbol, GraphObjectMetadata, JsonObject>,
  symbol: symbol,
): void
{
  const metadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Symbol,
    derivedClassName: BuiltInJSTypeName.Symbol
  };

  graph.defineSymbol(symbol, metadata);
}

export function addArrayIndexEdge(
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  parentObject: object,
  index: number,
  childObject: object | symbol
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.ArrayIndex
  };

  graph.defineProperty(parentObject, index, childObject, relationship);
}

export function addPropertyNameEdge(
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  parentObject: object,
  propertyName: string,
  childObject: object
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.PropertyName
  };

  graph.defineProperty(parentObject, propertyName, childObject, relationship);
}

export function addPropertySymbolEdge(
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  parentObject: object,
  propertyKey: symbol,
  childObject: object
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.PropertySymbol
  };

  graph.defineProperty(parentObject, propertyKey, childObject, relationship);
}

export function addInternalSlotEdge(
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  parentObject: object,
  slotName: `[[${string}]]`,
  childObject: object,
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
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  map: object,
  key: unknown,
  value: unknown,
  isStrongReference: boolean,
): void
{
  let keyRelationship: GraphRelationshipMetadata | undefined;
  if (isObjectOrSymbol(key) && typeof key !== "symbol") {
    keyRelationship = {
      parentToChildEdgeType: ChildReferenceEdgeType.MapKey
    };
  }

  let valueRelationship: GraphRelationshipMetadata | undefined;
  if (isObjectOrSymbol(value) && typeof value !== "symbol") {
    valueRelationship = {
      parentToChildEdgeType: ChildReferenceEdgeType.MapValue
    };
  }

  graph.defineMapKeyValueTuple(
    map, key, value, isStrongReference, keyRelationship, valueRelationship
  );
}

export function addSetElementEdge(
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  set: object,
  value: object,
  isStrongReference: boolean,
): void
{
  const relationship: GraphRelationshipMetadata = {
    parentToChildEdgeType: ChildReferenceEdgeType.SetElement
  };
  graph.defineSetValue(set, value, isStrongReference, relationship);
}
