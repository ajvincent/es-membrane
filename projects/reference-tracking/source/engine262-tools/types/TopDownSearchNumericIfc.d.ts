import {
  BuiltInJSTypeName,
} from "../../utilities/constants.ts";

import type {
  ChildToParentReferenceGraphEdge,
  CollectionToKeyValueEdge,
  ParentToChildReferenceGraphEdge,
} from "../../types/ReferenceGraph.d.ts";

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

  excludeObjectFromSearch(
    graphObject: object
  ): void;

  obtainSymbolKey(
    graphSymbol: symbol
  ): number;

  getNextParentToChildEdgeId(): number;

  addChildToParentEdge(childEdge: ChildToParentReferenceGraphEdge): void;
  addParentToChildEdge(parentToChildEdge: ParentToChildReferenceGraphEdge): void;
  addCollectionToKeyValueEdge(collectionEdge: CollectionToKeyValueEdge): void;

  markHeldValuesAsStrongReference(): void;
  markStrongReferences(): void;
}
