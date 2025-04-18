import type {
  JsonObject
} from "type-fest";

import type {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

import type {
  ObjectGraphIfc
} from "../../graph-analysis/types/ObjectGraphIfc.js";

export type GuestObjectGraphIfc<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null
> = ObjectGraphIfc<
  GuestEngine.ObjectValue, GuestEngine.SymbolValue, GuestEngine.PrivateName, ObjectMetadata, RelationshipMetadata
>;
