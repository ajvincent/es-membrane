import type {
  ValueDescription,
} from "../types/ValueDescription.js";

import {
  ValueDiscrimant
} from "../utilities/constants.js";

import type {
  ValueIdIfc
} from "./types/ObjectGraphIfc.js";

export function createValueDescription(
  value: unknown,
  objectGraph: ValueIdIfc,
): ValueDescription
{
  switch (typeof value) {
    case "bigint":
      return {
        valueType: ValueDiscrimant.BigInt,
        bigintStringValue: value.toString(),
      };

    case "symbol":
      return {
        valueType: ValueDiscrimant.Symbol,
        symbolId: objectGraph.getSymbolId(value),
      }

    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return {
        valueType: ValueDiscrimant.Primitive,
        primitiveValue: value,
      }

    case "object":
      if (value === null) {
        return {
          valueType: ValueDiscrimant.Primitive,
          primitiveValue: null
        }
      }

      return {
        valueType: ValueDiscrimant.Object,
        objectId: objectGraph.getObjectId(value),
      }

    case "function":
      return {
        valueType: ValueDiscrimant.Object,
        objectId: objectGraph.getObjectId(value),
      }
  }
}
