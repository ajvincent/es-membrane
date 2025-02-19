import {
  ChildReferenceEdgeType,
  type PropertySymbolEdge,
} from "../../ReferenceGraph.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

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
    topDownSearch: TopDownSearchIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.PropertySymbol,
      topDownSearch
    );

    this.symbolDescription = symbolKey.Description.value;
    this.symbolNumericKey = topDownSearch.getKeyForExistingHeldSymbol(symbolKey);
  }
}
