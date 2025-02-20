import type {
  PropertyNameEdge,
} from "../../types/ReferenceGraph.js";

import {
  ChildReferenceEdgeType
} from "../../utilities/constants.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export class PropertyNameEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.PropertyName>
implements PropertyNameEdge
{
  public readonly propertyName: string;

  public constructor(
    parentObject: GuestEngine.ObjectValue,
    propertyName: string,
    childObject: GuestEngine.ObjectValue,
    topDownSearch: TopDownSearchIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.PropertyName,
      topDownSearch
    );
    this.propertyName = propertyName;
  }
}
