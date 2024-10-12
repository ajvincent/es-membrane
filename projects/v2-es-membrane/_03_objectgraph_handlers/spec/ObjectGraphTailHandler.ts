import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import {
  DataDescriptor
} from "#objectgraph_handlers/source/sharedUtilities.js";

import type {
  MembraneInternalIfc
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import type {
  ObjectGraphValuesIfc
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

import MockMembrane from "./support/MockMembrane.js";

describe("ObjectGraphTailHandler", () => {
  const membrane = new MockMembrane;
  let handler: ObjectGraphTailHandler;
  beforeEach(() => handler = new ObjectGraphTailHandler(membrane, "this graph"));

  class PublicHandlerProperties extends ObjectGraphTailHandler {
    declare public readonly membrane: MembraneInternalIfc;
    declare public readonly thisGraphKey: string | symbol;
    declare public thisGraphValues?: ObjectGraphValuesIfc | undefined;
  }

  it("initializes with the specified membrane and thisGraphKey", () => {
    let handler = new PublicHandlerProperties(membrane, "this graph");
    expect(handler.membrane).toBe(membrane);
    expect(handler.thisGraphKey).toBe("this graph");
    expect(handler.thisGraphValues).toBeUndefined();
  });

  it("allows calling setThisGraphValues once", () => {
    let handler = new PublicHandlerProperties(membrane, "this graph");

    const mockGraphValues: ObjectGraphValuesIfc = {
      objectGraphKey: "this graph",

      getArrayInGraph: function <Elements extends unknown[] = unknown[]>(
        valuesInSourceGraph: Elements,
        sourceGraphKey: string | symbol
      ): Elements
      {
        throw new Error("not implemented");
      },

      getDescriptorInGraph: function (
        descriptorInSourceGraph: PropertyDescriptor | undefined,
        sourceGraphKey: string | symbol
      ): PropertyDescriptor | undefined
      {
        throw new Error("not implemented");
      },

      getValueInGraph: function (
        valueInSourceGraph: unknown,
        sourceGraphKey: string | symbol
      ): unknown
      {
        throw new Error("not implemented");
      },

      get isRevoked() {
        return true;
      },

      isKnownProxy: function(value) {
        throw new Error("not implemented");
      }
    }

    handler.setThisGraphValues(mockGraphValues);
    expect(handler.thisGraphValues).toBe(mockGraphValues);

    expect(
      () => handler.setThisGraphValues(mockGraphValues)
    ).toThrowError("The thisGraphValues interface already exists!");
  });

  describe("traps operate only on the next target, and other next-graph arguments", () => {
    it(": apply", () => {
      const nextTarget = jasmine.createSpy("nextTarget");
      const nextThisArg = { isNextThis: true };
      const nextArgArray = [ { arg: 0 }, { arg: 1 } ];
      const nextReturn = { isNextReturn: true };
      nextTarget.and.returnValue(nextReturn);

      const shadowTarget = jasmine.createSpy("shadowTarget");
      const thisArg = { isThis: true };
      const argArray: unknown[] = [];

      expect(handler.apply(
        shadowTarget, thisArg, argArray, "next graph", nextTarget, nextThisArg, nextArgArray
      )).toBe(nextReturn);
      expect(nextTarget).toHaveBeenCalledOnceWith(...nextArgArray);
      expect(nextTarget.calls.thisFor(0)).toBe(nextThisArg);

      expect(shadowTarget).toHaveBeenCalledTimes(0);
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

      const car = handler.construct(
        DerivedVehicleShadowTarget, [4, "red"], DerivedVehicleShadowTarget, "next graph",
        DerivedVehicleNextTarget, [4, "red"], DerivedVehicleNextTarget
      ) as DerivedVehicleNextTarget;

      expect(DerivedVehicleShadowTarget.instanceCount).toBe(0);

      expect(DerivedVehicleNextTarget.instanceCount).toBe(1);
      expect(car).toBeInstanceOf(DerivedVehicleNextTarget);
      expect(car.wheelCount).toBe(4);
      expect(car.color).toBe("red");
      expect(car.spy).toHaveBeenCalledTimes(1);
      expect(car.spy.calls.argsFor(0)).toEqual([4]);
    });

    it(": defineProperty", () => {
      const shadowTarget = { shadowTarget: true };
      const shadowDesc = new DataDescriptor("bar", true, true, true);

      const nextTarget = { nextTarget: true };
      const nextDesc = new DataDescriptor("bar", true, true, true);

      const result = handler.defineProperty(
        shadowTarget, "foo", shadowDesc, "next graph", nextTarget, "foo", nextDesc
      );

      expect(result).toBeTrue();
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")).toBeUndefined();
      expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")).toEqual({
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      });
    });

    it(": deleteProperty", () => {
      const shadowTarget = { shadowTarget: true, foo: "bar" };
      const nextTarget = { nextTarget: true, foo: "bar" };

      const result = handler.deleteProperty(
        shadowTarget, "foo", "next graph", nextTarget, "foo"
      );

      expect(result).toBeTrue();
      expect(Reflect.getOwnPropertyDescriptor(shadowTarget, "foo")).toBeDefined();
      expect(Reflect.getOwnPropertyDescriptor(nextTarget, "foo")).toBeUndefined();
    });

    it(": get", () => {
      const shadowTarget = { shadowTarget: true, valueToGet: "red" };
      const nextTarget = { nextTarget: true, valueToGet: "blue" };

      const result = handler.get(
        shadowTarget, "valueToGet", shadowTarget, "nextGraph", nextTarget, "valueToGet", nextTarget
      );
      expect(result).toBe("blue");
      expect(shadowTarget.valueToGet).toBe("red");
      expect(nextTarget.valueToGet).toBe("blue");
    });

    it(": getOwnPropertyDescriptor", () => {
      const shadowTarget = { shadowTarget: true, foo: "wop" };
      const nextTarget = { nextTarget: true, foo: "bar" };

      const result = handler.getOwnPropertyDescriptor(
        shadowTarget, "foo", "next graph", nextTarget, "foo"
      );
      expect(result).toEqual({
        value: "bar",
        writable: true,
        enumerable: true,
        configurable: true
      });
      expect(Reflect.get(shadowTarget, "foo")).toBe("wop");
      expect(Reflect.get(nextTarget, "foo")).toBe("bar");
    });

    it(": getPrototypeOf", () => {
      const shadowProto = { shadowPrototype: true };
      const shadowTarget = Object.create(shadowProto);

      const nextProto = { nextPrototype: true };
      const nextTarget = Object.create(nextProto);

      expect(handler.getPrototypeOf(
        shadowTarget, "next graph", nextTarget
      )).toBe(nextProto);
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(shadowProto);
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);
    });

    it(": has", () => {
      const shadowTarget = { shadowTarget: true };
      const nextTarget = { nextTarget: true, valueToGet: "blue" };

      const result = handler.has(
        shadowTarget, "valueToGet", "nextGraph", nextTarget, "valueToGet"
      );
      expect(result).toBe(true);
      expect(Reflect.get(shadowTarget, "valueToGet")).toBeUndefined();
      expect(nextTarget.valueToGet).toBe("blue");
    });

    it(": isExtensible", () => {
      const shadowTarget = { shadowTarget: true };
      const nextTarget = { nextTarget: true };
      Reflect.preventExtensions(nextTarget);

      const result = handler.isExtensible(shadowTarget, "next graph", nextTarget);
      expect(result).toBe(false);
      expect(Reflect.isExtensible(shadowTarget)).toBe(true);
      expect(Reflect.isExtensible(nextTarget)).toBe(false);
    });

    it(": ownKeys", () => {
      const shadowTarget = { shadowTarget: true };
      const nextTarget = { nextTarget: true };
      expect(
        handler.ownKeys(shadowTarget, "next graph", nextTarget)
      ).toEqual(["nextTarget"]);
    });

    it(": preventExtensions", () => {
      const shadowTarget = { shadowTarget: true };
      const nextTarget = { nextTarget: true };

      const result = handler.preventExtensions(
        shadowTarget, "next graph", nextTarget
      );
      expect(result).toBeTrue();
      expect(Reflect.isExtensible(shadowTarget)).toBe(true);
      expect(Reflect.isExtensible(nextTarget)).toBe(false);
    });

    it(": set", () => {
      const shadowTarget = { shadowTarget: true, valueToGet: "red" };
      const nextTarget = { nextTarget: true, valueToGet: "blue" };

      const result = handler.set(
        shadowTarget, "valueToGet", "green", shadowTarget, "nextGraph",
        nextTarget, "valueToGet", "yellow", nextTarget
      );
      expect(result).toBe(true);
      expect(shadowTarget.valueToGet).toBe("red");
      expect(nextTarget.valueToGet).toBe("yellow");
    });

    it(": setPrototypeOf", () => {
      const shadowProto = { shadowPrototype: true };
      const shadowTarget = { shadowTarget: true };

      const nextProto = { nextPrototype: true };
      const nextTarget = { nextTarget: true };

      expect(handler.setPrototypeOf(
        shadowTarget, shadowProto, "next graph", nextTarget, nextProto
      )).toBe(true);
      expect(Reflect.getPrototypeOf(shadowTarget)).toBe(Object.prototype);
      expect(Reflect.getPrototypeOf(nextTarget)).toBe(nextProto);
    });
  });
});
