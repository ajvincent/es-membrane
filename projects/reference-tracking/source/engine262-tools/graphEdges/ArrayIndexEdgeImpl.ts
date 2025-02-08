import {
  ChildReferenceEdgeType,
  type ArrayIndexEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap,
} from "../search/ValueToNumericKeyMap.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export default class ArrayIndexEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.ArrayIndex>
implements ArrayIndexEdge
{
  public static convertToNonNegativeInteger(property: string): number {
    const value = parseFloat(property);
    return (value >= 0 && value % 1 === 0) ? value : NaN;
  }

  public readonly index: number;

  constructor(
    parentObject: GuestEngine.ObjectValue,
    index: number,
    childObject: GuestEngine.ObjectValue,
    numericKeyMap: ValueToNumericKeyMap,
  )
  {
    super(parentObject, childObject, ChildReferenceEdgeType.ArrayIndex, numericKeyMap);
    this.index = index;
  }
}
