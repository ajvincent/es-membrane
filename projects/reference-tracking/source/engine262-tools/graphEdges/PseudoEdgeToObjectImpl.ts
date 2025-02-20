import type {
  PseudoEdgeToObject,
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

export class PseudoEdgeToObjectImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.PseudoToObject>
implements PseudoEdgeToObject
{
  readonly edgeContext: string[];

  constructor(
    parentObject: GuestEngine.ObjectValue,
    childObject: GuestEngine.ObjectValue,
    edgeContext: string[],
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.PseudoToObject,
      topDownSearch
    );

    this.edgeContext = edgeContext.slice();
  }
}
