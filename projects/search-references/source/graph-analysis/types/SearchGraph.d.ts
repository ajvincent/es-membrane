import type {
  Graph,
} from "@dagrejs/graphlib";

import type {
  GraphWeakKeyMetadata
} from "../../types/GraphWeakKeyMetadata.d.ts";

import type {
  GraphRelationshipMetadata
} from "../../types/GraphRelationshipMetadata.d.ts";

import type {
  GraphNodeWithMetadata,
  GraphEdgeWithMetadata,
} from "./ObjectGraphIfc.d.ts";

export type SearchGraph = Graph<
  unknown,
  GraphNodeWithMetadata<GraphWeakKeyMetadata | null>,
  GraphEdgeWithMetadata<GraphRelationshipMetadata | null>
>;
