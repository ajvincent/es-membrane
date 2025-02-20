import type {
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

import type {
  ValueDescription,
} from "../../types/ValueDescription.js";

import {
  ValueDiscrimant
} from "../../utilities/constants.js";

import type {
  GuestEngine
} from "../GuestEngine.js";

export function createValueDescription(
  guestValue: GuestEngine.Value | undefined,
  topDownSearch: GuestValueRegistarIfc
): ValueDescription
{
  if (guestValue === undefined) {
    return {
      valueType: ValueDiscrimant.NotApplicable,
    }
  }

  if (guestValue.type === "Object") {
    return {
      valueType: ValueDiscrimant.Object,
      objectKey: topDownSearch.getKeyForExistingHeldObject(guestValue),
    }
  }

  if (guestValue.type === "Symbol") {
    return {
      valueType: ValueDiscrimant.Symbol,
      symbolKey: topDownSearch.getKeyForExistingHeldSymbol(guestValue),
    }
  }

  let primitiveValue: bigint | boolean | number | string | undefined | null;
  switch (guestValue.type) {
    case "BigInt":
      primitiveValue = guestValue.bigintValue();
      break;

    case "Boolean":
      primitiveValue = guestValue.booleanValue();
      break;

    case "Null":
      primitiveValue = null;
      break;

    case "Number":
      primitiveValue = guestValue.numberValue();
      break;

    case "String":
      primitiveValue = guestValue.stringValue();
      break;

    case "Undefined":
      primitiveValue = undefined;
      break;
  }

  return {
    valueType: ValueDiscrimant.Primitive,
    primitiveValue,
  }
}
