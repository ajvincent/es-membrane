import type {
  PropertySymbolEdge,
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
    topDownSearch: GuestValueRegistarIfc,
  )
  {
    super(
      parentObject,
      childObject,
      ChildReferenceEdgeType.PropertySymbol,
      true,
      topDownSearch
    );

    this.symbolDescription = symbolKey.Description.value;
    this.symbolNumericKey = topDownSearch.getKeyForExistingHeldSymbol(symbolKey);
  }
}
