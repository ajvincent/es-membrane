import type {
  ValueIdIfc
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

import {
  createValueDescription
} from "../../source/graph-analysis/createValueDescription.js";

import type {
  PrefixedNumber
} from "../../source/types/PrefixedNumber.js";

import {
  ValueDiscrimant
} from "../../source/utilities/constants.js";

describe("createValueDescription correctly serializes", () => {
  const weakKeyMap = new WeakMap<WeakKey, PrefixedNumber<"object" | "symbol">>;

  const idGetter: ValueIdIfc<object, symbol> = {
    getWeakKeyId(weakKey: object | symbol): PrefixedNumber<"object" | "symbol" | "target"> {
      return weakKeyMap.get(weakKey) as PrefixedNumber<"object" | "symbol">;
    }
  };

  it("bigint", () => {
    const value: bigint = 3n;
    const description = createValueDescription(value, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.BigInt,
      bigintStringValue: value.toString(),
    });
  });

  it("symbol", () => {
    const s = Symbol("hello");
    weakKeyMap.set(s, "symbol:14");

    const description = createValueDescription(s, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Symbol,
      symbolId: "symbol:14"
    });
  });

  it("booleans", () => {
    const trueDescription = createValueDescription(true, idGetter);
    expect(trueDescription).toEqual({
      valueType: ValueDiscrimant.Primitive,
      primitiveValue: true
    });

    const falseDescription = createValueDescription(false, idGetter);
    expect(falseDescription).toEqual({
      valueType: ValueDiscrimant.Primitive,
      primitiveValue: false
    });
  });

  it("numnbers", () => {
    const description = createValueDescription(14, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Primitive,
      primitiveValue: 14
    });
  });

  it("strings", () => {
    const description = createValueDescription("hello", idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Primitive,
      primitiveValue: "hello"
    });
  });

  it("undefined", () => {
    const description = createValueDescription(undefined, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Primitive,
      primitiveValue: undefined
    });
  });

  it("null", () => {
    const description = createValueDescription(null, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Primitive,
      primitiveValue: null
    });
  });

  it("objects", () => {
    const value = { isValue: true };
    weakKeyMap.set(value, "object:97");

    const description = createValueDescription(value, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Object,
      objectId: "object:97"
    });
  });

  it("functions", () => {
    function value(): void {}
    weakKeyMap.set(value, "object:47");

    const description = createValueDescription(value, idGetter);
    expect(description).toEqual({
      valueType: ValueDiscrimant.Object,
      objectId: "object:47"
    });
  });
});
