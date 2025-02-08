import {
  ChildReferenceEdgeType,
  type PropertyNameEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap,
} from "../search/ValueToNumericKeyMap.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export default class PropertyNameEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.PropertyName>
implements PropertyNameEdge
{
  public readonly propertyName: string;

  public constructor(
    parentObject: GuestEngine.ObjectValue,
    propertyName: string,
    childObject: GuestEngine.ObjectValue,
    numericKeyMap: ValueToNumericKeyMap,
  )
  {
    super(parentObject, childObject, ChildReferenceEdgeType.PropertyName, numericKeyMap);
    this.propertyName = propertyName;
  }
}
