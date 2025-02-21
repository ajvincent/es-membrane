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
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

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
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.PropertyName,
      true,
      topDownSearch
    );
    this.propertyName = propertyName;
  }
}
