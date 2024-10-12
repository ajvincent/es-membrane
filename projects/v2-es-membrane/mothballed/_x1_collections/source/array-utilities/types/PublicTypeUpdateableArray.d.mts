import type {
  UpdateSymbolTracking
} from "./export-types.d.mts";

export interface PublicTypeUpdateableArray<PublicType extends object>
extends Array<PublicType>
{
  set symbolTracker(
    tracking: UpdateSymbolTracking
  );

  refreshFromBackingArray(): void;
}