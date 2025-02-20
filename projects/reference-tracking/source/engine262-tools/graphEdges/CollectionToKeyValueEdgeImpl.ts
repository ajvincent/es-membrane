import type {
  NotApplicableValueDescription,
  ValueDescription,
} from "../../types/ValueDescription.js";

import type {
  CollectionToKeyValueEdge,
  CollectionPseudoEdge,
} from "../../types/ReferenceGraph.js";

import type {
  TopDownSearchIfc,
} from "../types/TopDownSearchIfc.js";

import {
  ValueDiscrimant
} from "../../utilities/constants.js";

import {
  GuestEngine,
} from "../GuestEngine.js";

import {
  createValueDescription,
} from "./ValueDescriptionImpl.js";

export class CollectionToKeyValueEdgeImpl implements CollectionToKeyValueEdge
{
  readonly collectionEdgeId: number;
  readonly collectionObjectKey: number;

  readonly keyDescription: ValueDescription;
  readonly keyIsHeldStrongly: boolean;

  readonly valueDescription: Exclude<ValueDescription, NotApplicableValueDescription>;

  constructor(
    guestCollection: GuestEngine.ObjectValue,
    guestKey: GuestEngine.Value | undefined,
    guestValue: GuestEngine.Value,
    collectionPseudoEdge: CollectionPseudoEdge,
    keyIsHeldStrongly: boolean,
    topDownSearch: TopDownSearchIfc,
  )
  {
    this.collectionEdgeId = collectionPseudoEdge.parentToChildEdgeId;
    this.collectionObjectKey = topDownSearch.getKeyForExistingHeldObject(guestCollection);

    this.keyDescription = createValueDescription(guestKey, topDownSearch);
    this.keyIsHeldStrongly = keyIsHeldStrongly;

    const valueDescription = createValueDescription(guestValue, topDownSearch);
    GuestEngine.Assert(valueDescription.valueType !== ValueDiscrimant.NotApplicable);
    this.valueDescription = valueDescription;
  }
}
