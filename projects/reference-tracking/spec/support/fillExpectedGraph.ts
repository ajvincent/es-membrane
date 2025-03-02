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

export function addArrayIndexEdge(
  graph: ObjectGraphIfc<object, symbol, JsonObject, GraphRelationshipMetadata>,
  parentObject: object,
  index: number,
  childObject: object
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
