import {
  BuiltInJSTypeName,
  ChildReferenceEdgeType,
} from "../../utilities/constants.ts";

import type {
  ChildToParentReferenceGraphEdge,
  BaseParentToChildReferenceGraphEdge,
  CollectionToKeyValueEdge,
} from "../../types/ReferenceGraph.d.ts";

export type ParentToChildEdge = BaseParentToChildReferenceGraphEdge<ChildReferenceEdgeType>;

export interface TopDownSearchNumericIfc {
  //readonly strongReferencesOnly: boolean;

  retrieveObjectKey(
    graphObject: object
  ): number | undefined;

  /**
   * throws if the graph object is already known
   *
   * @returns the graph node's new object key.
   */
  defineGraphNode(
    graphObject: object,
    builtInClassName: BuiltInJSTypeName,
    derivedClassName: string
  ): number;

  obtainSymbolKey(
    graphSymbol: symbol
  ): number;

  getNextParentToChildEdgeId(): number;

  addChildToParentEdge(childEdge: ChildToParentReferenceGraphEdge): void;
  addParentToChildEdge(parentToChildEdge: ParentToChildEdge): void;
  addCollectionToKeyValueEdge(collectionEdge: CollectionToKeyValueEdge): void;
}
