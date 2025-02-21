import type {
  CollectionPseudoEdge,
} from "../../types/ReferenceGraph.js";

import {
  ChildReferenceEdgeType
} from "../../utilities/constants.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export class CollectionPseudoEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.CollectionPseudo>
implements CollectionPseudoEdge
{
  constructor(
    parentObject: GuestEngine.ObjectValue,
    childObject: GuestEngine.ObjectValue,
    isStrongOwningReference: boolean,
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.CollectionPseudo,
      isStrongOwningReference,
      topDownSearch
    );
  }
}
