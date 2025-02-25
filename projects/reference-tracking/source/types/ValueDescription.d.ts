import type {
  ObjectId,
  SymbolId
} from "./PrefixedNumber.js";

import {
  ValueDiscrimant
} from "../utilities/constants.ts";

export interface NotApplicableValueDescription {
  readonly valueType: ValueDiscrimant.NotApplicable,
}

export interface ObjectValueDescription {
  readonly valueType: ValueDiscrimant.Object,
  readonly objectId: ObjectId,
}

export interface SymbolValueDescription {
  readonly valueType: ValueDiscrimant.Symbol;
  readonly symbolId: SymbolId,
}

export interface BigIntValueDescription {
  readonly valueType: ValueDescription.BigInt;
  readonly bigintStringValue: string;
}

export interface PrimitiveValueDescription {
  readonly valueType: ValueDiscrimant.Primitive;
  readonly primitiveValue: boolean | number | string | undefined | null;
}

export type ValueDescription = (
  NotApplicableValueDescription |
  ObjectValueDescription |
  SymbolValueDescription |
  BigIntValueDescription |
  PrimitiveValueDescription
);
