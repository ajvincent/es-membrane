import {
  ChildReferenceEdgeType,
  type PropertySymbolEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap,
} from "../search/ValueToNumericKeyMap.js";

import ParentToChildBaseImpl from "./ParentToChildBaseImpl.js";

export class PropertySymbolEdgeImpl
extends ParentToChildBaseImpl<ChildReferenceEdgeType.PropertySymbol>
implements PropertySymbolEdge
{
  public readonly symbolDescription: string | undefined;
  public readonly symbolNumericKey: number;

  public constructor(
    parentObject: GuestEngine.ObjectValue,
    symbolKey: GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue,
    parentToChildEdgeId: number,
    objectNumericKeyMap: ValueToNumericKeyMap<GuestEngine.ObjectValue>,
    symbolNumericKeyMap: ValueToNumericKeyMap<GuestEngine.SymbolValue>,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.PropertySymbol,
      parentToChildEdgeId,
      objectNumericKeyMap
    );

    this.symbolDescription = symbolKey.Description.value;
    this.symbolNumericKey = symbolNumericKeyMap.getKeyForHeldObject(symbolKey);
  }
}
