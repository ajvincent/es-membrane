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

export function addObjectToGraphs(
  graph: ObjectGraphIfc<object, symbol, GraphObjectMetadata, JsonObject>,
  object: object,
  builtInJSTypeName: BuiltInJSTypeName,
  derivedClassName: string
): void
{
  const relationship: GraphObjectMetadata = {
    builtInJSTypeName,
    derivedClassName
  };

  graph.defineObject(object, relationship);
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
