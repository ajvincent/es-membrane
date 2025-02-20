import {
  ValueDiscrimant
} from "../utilities/constants.ts";

export interface NotApplicableValueDescription {
  readonly valueType: ValueDiscrimant.NotApplicable,
}

export interface ObjectValueDescription {
  readonly valueType: ValueDiscrimant.Object,
  readonly objectKey: number,
}

export interface SymbolValueDescription {
  readonly valueType: ValueDiscrimant.Symbol;
  readonly symbolKey: number,
}

export interface PrimitiveValueDescription {
  readonly valueType: ValueDiscrimant.Primitive;
  readonly primitiveValue: bigint | boolean | number | string | undefined | null;
}

export type ValueDescription = (
  NotApplicableValueDescription |
  ObjectValueDescription |
  SymbolValueDescription |
  PrimitiveValueDescription
);
