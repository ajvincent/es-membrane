import type {
  Graph,
} from "@dagrejs/graphlib";

import type {
  GraphObjectMetadata
} from "../../types/GraphObjectMetadata.d.ts";

import type {
  GraphRelationshipMetadata
} from "../../types/GraphRelationshipMetadata.d.ts";

import type {
  GraphNodeWithMetadata,
  GraphEdgeWithMetadata,
} from "./ObjectGraphIfc.d.ts";

export type SearchGraph = Graph<
  unknown,
  GraphNodeWithMetadata<GraphObjectMetadata | null>,
  GraphEdgeWithMetadata<GraphRelationshipMetadata | null>
>;
