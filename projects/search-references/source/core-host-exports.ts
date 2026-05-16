import type {
  ReadonlyDeep,
} from "type-fest";

export {
  type GuestRealmInputs,
  LoggingConfiguration,
  type SearchConfiguration,
  type SearchGraph,
  runSearchesInGuestEngine,
} from "./public/core-host/runSearchesInGuestEngine.js";

export {
  type NodeAndEdgeLabels,
  pathsToTarget
} from "./public/core-host/pathsToTarget.js";

export * as JSGraphConstants from "./utilities/constants.js";

import type {
  GraphNodeWithMetadata,
  GraphEdgeWithMetadata
} from "./graph-analysis/types/ObjectGraphIfc.js";

import type {
  GraphObjectMetadata
} from "./types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "./types/GraphRelationshipMetadata.js";

export type JSGraphNode = ReadonlyDeep<GraphNodeWithMetadata<GraphObjectMetadata>>;
export type JSGraphEdge = ReadonlyDeep<GraphEdgeWithMetadata<GraphRelationshipMetadata>>;
