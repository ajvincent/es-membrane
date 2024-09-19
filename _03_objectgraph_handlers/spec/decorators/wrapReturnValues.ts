import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import WrapReturnValues from "#objectgraph_handlers/source/generated/decorators/wrapReturnValues.js";

import {
  DataDescriptor
} from "#objectgraph_handlers/source/sharedUtilities.js";

import type {
  ObjectGraphValuesIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

import MockMembrane from "../support/MockMembrane.js";

describe("Wrapping return values works for the trap", () => {
  const membrane = new MockMembrane;
  let handler: ObjectGraphTailHandler;

  class MockGraphValues implements ObjectGraphValuesIfc {
    returnArray?: unknown[];
    returnDesc?: PropertyDescriptor | undefined;
    returnValue?: unknown;

    incomingValue: unknown;
    graphKey: unknown;

    getArrayInGraph<Elements extends unknown[] = unknown[]>(
      valuesInSourceGraph: Elements,
      sourceGraphKey: string | symbol
    ): Elements
    {
      this.incomingValue = valuesInSourceGraph;
      this.graphKey = sourceGraphKey;
      return this.returnArray as Elements;
    }

    getDescriptorInGraph(
      descriptorInSourceGraph: PropertyDescriptor | undefined,
      sourceGraphKey: string | symbol
    ): PropertyDescriptor | undefined
    {
      this.incomingValue = descriptorInSourceGraph;
      this.graphKey = sourceGraphKey;
      return this.returnDesc;
    }

    getValueInGraph(
      valueInSourceGraph: unknown,
      sourceGraphKey: string | symbol
    ): unknown
    {
      this.incomingValue = valueInSourceGraph;
      this.graphKey = sourceGraphKey;
      return this.returnValue;
    }

    get isRevoked() {
      return true;
    }

    isKnownProxy(value: object): boolean {
      throw new Error("not implemented");
    }
  }

  let mockValues: MockGraphValues;

  beforeEach(() => {
    handler = new MockGraphTailHandler(membrane, "this graph");
    mockValues = new MockGraphValues;
    handler.setThisGraphValues(mockValues);
  });

  @WrapReturnValues
  class MockGraphTailHandler extends ObjectGraphTailHandler {
  }

  it(": apply", () => {
    const nextTarget = jasmine.createSpy("nextTarget");
    const nextThisArg = { isNextThis: true };
    const nextArgArray = [ { arg: 0 }, { arg: 1 } ];
    const nextReturn = { isNextReturn: true };
    nextTarget.and.returnValue(nextReturn);

    const shadowTarget = jasmine.createSpy("shadowTarget");
    const thisArg = { isThis: true };
    const argArray: unknown[] = [];
    const shadowReturn = { isShadowReturn: true };

    mockValues.returnValue = shadowReturn;

    expect(handler.apply(
      shadowTarget, thisArg, argArray, "next graph", nextTarget, nextThisArg, nextArgArray
    )).toBe(shadowReturn);
    expect(nextTarget).toHaveBeenCalledOnceWith(...nextArgArray);
    expect(nextTarget.calls.thisFor(0)).toBe(nextThisArg);

    expect(shadowTarget).toHaveBeenCalledTimes(0);

    expect(mockValues.incomingValue).toBe(nextReturn);
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": construct", () => {
    //#region set up classes
    class BaseVehicleNextTarget {
      static instanceCount = 0;

      instanceIndex: number;
      spy = jasmine.createSpy();
      wheelCount: number;

      adjustWheelCount(delta: number): void {
        this.wheelCount += delta;
      }

      constructor(wheelCount: number) {
        this.instanceIndex = BaseVehicleNextTarget.instanceCount++;

        this.wheelCount = wheelCount;
        this.spy.apply(this, [wheelCount]);
      }
    }

    class DerivedVehicleNextTarget extends BaseVehicleNextTarget {
      #color: string;
      constructor(wheelCount: number, color: string) {
        super(wheelCount);
        this.#color = color;
      }

      get color(): string {
        return this.#color;
      }
    }

    class BaseVehicleShadowTarget {
      static instanceCount = 0;

      instanceIndex: number;
      spy = jasmine.createSpy();
      wheelCount: number;

      adjustWheelCount(delta: number): void {
        this.wheelCount += delta;
      }

      constructor(wheelCount: number) {
        this.instanceIndex = BaseVehicleShadowTarget.instanceCount++;

        this.wheelCount = wheelCount;
        this.spy.apply(this, [wheelCount]);
      }
    }

    class DerivedVehicleShadowTarget extends BaseVehicleShadowTarget {
      #color: string;
      constructor(wheelCount: number, color: string) {
        super(wheelCount);
        this.#color = color;
      }

      get color(): string {
        return this.#color;
      }
    }
    //#endregion set up classes

    const shadowReturn = { isShadowReturn: true };
    mockValues.returnValue = shadowReturn;

    const car = handler.construct(
      DerivedVehicleShadowTarget, [4, "red"], DerivedVehicleShadowTarget, "next graph",
      DerivedVehicleNextTarget, [4, "red"], DerivedVehicleNextTarget
    );
    expect(car).toBe(shadowReturn);

    expect(DerivedVehicleShadowTarget.instanceCount).toBe(0);
    expect(DerivedVehicleNextTarget.instanceCount).toBe(1);

    expect(mockValues.incomingValue).toBeInstanceOf(DerivedVehicleNextTarget);
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": defineProperty", () => {
    const shadowTarget = { shadowTarget: true };
    const shadowDesc = new DataDescriptor("bar", true, true, true);

    const nextTarget = { nextTarget: true };
    const nextDesc = new DataDescriptor("bar", true, true, true);

    mockValues.returnValue = false;

    const result = handler.defineProperty(
      shadowTarget, "foo", shadowDesc, "next graph", nextTarget, "foo", nextDesc
    );

    expect(result).toBeFalse();
    expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")).toBeUndefined();
    expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")).toEqual({
      value: "bar",
      writable: true,
      enumerable: true,
      configurable: true
    });

    expect(mockValues.incomingValue).toBeTrue();
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": deleteProperty", () => {
    const shadowTarget = { shadowTarget: true, foo: "bar" };
    const nextTarget = { nextTarget: true, foo: "bar" };

    mockValues.returnValue = false;

    const result = handler.deleteProperty(
      shadowTarget, "foo", "next graph", nextTarget, "foo"
    );

    expect(result).toBeFalse();
    expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")).toBeDefined();
    expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")).toBeUndefined();

    expect(mockValues.incomingValue).toBeTrue();
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": get", () => {
    const shadowTarget = { shadowTarget: true, valueToGet: "red" };
    const nextTarget = { nextTarget: true, valueToGet: "blue" };

    mockValues.returnValue = "green";

    const result = handler.get(
      shadowTarget, "valueToGet", shadowTarget, "nextGraph", nextTarget, "valueToGet", nextTarget
    );
    expect(result).toBe("green");
    expect(shadowTarget.valueToGet).toBe("red");
    expect(nextTarget.valueToGet).toBe("blue");

    expect(mockValues.incomingValue).toBe("blue");
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": getOwnPropertyDescriptor", () => {
    const shadowTarget = { shadowTarget: true, foo: "wop" };
    const nextTarget = { nextTarget: true, foo: "bar" };

    const shadowDesc = Reflect.getOwnPropertyDescriptor(shadowTarget, "foo");
    mockValues.returnDesc = {...shadowDesc};

    const result = handler.getOwnPropertyDescriptor(
      shadowTarget, "foo", "next graph", nextTarget, "foo"
    );
    expect(result).toEqual(shadowDesc);
    expect(Reflect.get(shadowTarget, "foo")).toBe("wop");
    expect(Reflect.get(nextTarget, "foo")).toBe("bar");

    expect(mockValues.incomingValue).toEqual({
      value: "bar",
      writable: true,
      enumerable: true,
      configurable: true
    });
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": getPrototypeOf", () => {
    const shadowProto = { shadowPrototype: true };
    const shadowTarget = Object.create(shadowProto);

    const nextProto = { nextPrototype: true };
    const nextTarget = Object.create(nextProto);

    mockValues.returnValue = shadowProto;

    expect(handler.getPrototypeOf(
      shadowTarget, "next graph", nextTarget
    )).toBe(shadowProto);
    expect(Reflect.getPrototypeOf(shadowTarget)).toBe(shadowProto);
    expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);

    expect(mockValues.incomingValue).toBe(nextProto);
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": has", () => {
    const shadowTarget = { shadowTarget: true };
    const nextTarget = { nextTarget: true, valueToGet: "blue" };

    mockValues.returnValue = false;

    const result = handler.has(
      shadowTarget, "valueToGet", "nextGraph", nextTarget, "valueToGet"
    );
    expect(result).toBe(false);
    expect(Reflect.get(shadowTarget, "valueToGet")).toBeUndefined();
    expect(nextTarget.valueToGet).toBe("blue");

    expect(mockValues.incomingValue).toBeTrue();
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": isExtensible", () => {
    const shadowTarget = { shadowTarget: true };
    const nextTarget = { nextTarget: true };
    Reflect.preventExtensions(nextTarget);

    mockValues.returnValue = true;

    const result = handler.isExtensible(shadowTarget, "next graph", nextTarget);
    expect(result).toBe(true);
    expect(Reflect.isExtensible(shadowTarget)).toBe(true);
    expect(Reflect.isExtensible(nextTarget)).toBe(false);

    expect(mockValues.incomingValue).toBeFalse();
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": ownKeys", () => {
    const shadowTarget = { shadowTarget: true };
    const nextTarget = { nextTarget: true };

    mockValues.returnArray = [ "shadowTarget" ];

    expect(
      handler.ownKeys(shadowTarget, "next graph", nextTarget)
    ).toEqual(["shadowTarget"]);

    expect(mockValues.incomingValue).toEqual(["nextTarget"]);
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": preventExtensions", () => {
    const shadowTarget = { shadowTarget: true };
    const nextTarget = { nextTarget: true };

    mockValues.returnValue = false;

    const result = handler.preventExtensions(
      shadowTarget, "next graph", nextTarget
    );
    expect(result).toBeFalse();
    expect(Reflect.isExtensible(shadowTarget)).toBe(true);
    expect(Reflect.isExtensible(nextTarget)).toBe(false);

    expect(mockValues.incomingValue).toBeTrue();
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": set", () => {
    const shadowTarget = { shadowTarget: true, valueToGet: "red" };
    const nextTarget = { nextTarget: true, valueToGet: "blue" };

    mockValues.returnValue = false;

    const result = handler.set(
      shadowTarget, "valueToGet", "green", shadowTarget, "nextGraph",
      nextTarget, "valueToGet", "yellow", nextTarget
    );
    expect(result).toBeFalse();
    expect(shadowTarget.valueToGet).toBe("red");
    expect(nextTarget.valueToGet).toBe("yellow");

    expect(mockValues.incomingValue).toBeTrue();
    expect(mockValues.graphKey).toBe("this graph");
  });

  it(": setPrototypeOf", () => {
    const shadowProto = { shadowPrototype: true };
    const shadowTarget = { shadowTarget: true };

    const nextProto = { nextPrototype: true };
    const nextTarget = { nextTarget: true };

    mockValues.returnValue = false;

    expect(handler.setPrototypeOf(
      shadowTarget, shadowProto, "next graph", nextTarget, nextProto
    )).toBeFalse();
    expect(Reflect.getPrototypeOf(shadowTarget)).toBe(Object.prototype);
    expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);

    expect(mockValues.incomingValue).toBeTrue();
    expect(mockValues.graphKey).toBe("this graph");
  });
});
