import type {
  JsonObject
} from "type-fest";

import type {
  ObjectGraphIfc
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

import type {
  GraphRelationshipMetadata
} from "../../source/types/GraphRelationshipMetadata.js";

import {
  ChildReferenceEdgeType,
} from "../../source/utilities/constants.js";

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
