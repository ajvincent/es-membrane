import type {
  ArrayIndexEdge,
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
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.ArrayIndex,
      true,
      topDownSearch
    );
    this.arrayIndex = index;
  }
}
