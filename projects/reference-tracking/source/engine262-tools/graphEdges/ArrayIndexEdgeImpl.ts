import {
  ChildReferenceEdgeType,
  type ArrayIndexEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export class ArrayIndexEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.ArrayIndex>
implements ArrayIndexEdge
{
  public static convertToNonNegativeInteger(property: string): number {
    const value = parseFloat(property);
    return (value >= 0 && value % 1 === 0) ? value : NaN;
  }

  public readonly arrayIndex: number;

  constructor(
    parentObject: GuestEngine.ObjectValue,
    index: number,
    childObject: GuestEngine.ObjectValue,
    topDownSearch: TopDownSearchIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.ArrayIndex,
      topDownSearch
    );
    this.arrayIndex = index;
  }
}
