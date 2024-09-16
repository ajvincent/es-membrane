import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";

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
  });
});
