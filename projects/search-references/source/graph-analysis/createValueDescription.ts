import {
  ObjectId,
  SymbolId,
} from "../types/PrefixedNumber.js";

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
  objectGraph: ValueIdIfc<object, symbol>,
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
        symbolId: objectGraph.getWeakKeyId(value) as SymbolId,
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
        objectId: objectGraph.getWeakKeyId(value) as ObjectId,
      }

    case "function":
      return {
        valueType: ValueDiscrimant.Object,
        objectId: objectGraph.getWeakKeyId(value) as ObjectId,
      }
  }
}
