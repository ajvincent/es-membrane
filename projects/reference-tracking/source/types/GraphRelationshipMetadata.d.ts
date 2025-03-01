import type {
  JsonObject
} from "type-fest";

import type {
  ChildReferenceEdgeType,
} from "../utilities/constants.js";

export interface GraphRelationshipMetadata extends JsonObject {
  parentToChildEdgeType: ChildReferenceEdgeType
}
