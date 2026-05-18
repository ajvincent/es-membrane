import type {
  Class
} from "type-fest";

import TracingProxyHandler from "./support/TracingProxyHandler.js";

it("The construct trap works with classes", () => {
  const handler = new TracingProxyHandler<Class<object, [number, string]>>;
  const { spy } = handler;

  //#region creating BaseVehicle proxy
  class BaseVehicleUnwrapped {
    static invokeCount = 0;
    wheelCount: number;

    adjustWheelCount(delta: number): void {
      this.wheelCount += delta;
    }

    constructor(wheelCount: number) {
      BaseVehicleUnwrapped.invokeCount++;
      this.wheelCount = wheelCount;
    }
  }

  const {
    proxy: BaseVehicle,
    revoke: BaseRevoker
  } = Proxy.revocable<Class<object, [number]>>(BaseVehicleUnwrapped, handler);

  expect(spy).withContext("creating BaseVehicle proxy").toHaveBeenCalledTimes(0);
  handler.reset();
  //#endregion creating BaseVehicle proxy

  //#region class DerivedVehicleUnwrapped extends BaseVehicle
  class DerivedVehicleUnwrapped extends BaseVehicle {
    #color: string;
    constructor(wheelCount: number, color: string) {
      super(wheelCount);
      this.#color = color;
    }

    get color(): string {
      return this.#color;
    }
  }

  expect(spy).withContext("class DerivedVehicleUnwrapped extends BaseVehicle").toHaveBeenCalledTimes(2);
  for (let i = 0; i < spy.calls.count(); i++) {
    expect(spy.calls.thisFor(i)).toBe(handler);
  }
  expect(spy.calls.argsFor(0)).withContext("class DerivedVehicleUnwrapped extends BaseVehicle")
    .toEqual([
      "get:start:0",
      BaseVehicleUnwrapped, "prototype", Reflect.getPrototypeOf(DerivedVehicleUnwrapped),
    ]);
  expect(spy.calls.argsFor(1)).withContext("class DerivedVehicleUnwrapped extends BaseVehicle")
    .toEqual([
      "get:close:0",
      BaseVehicleUnwrapped.prototype
    ]);
  handler.reset();
  //#endregion class DerivedVehicleUnwrapped extends BaseVehicle

  //#region creating DerivedVehicle proxy
  const {
    proxy: DerivedVehicle,
    revoke: DerivedRevoker
  } = Proxy.revocable<Class<object, [number, string]>>(DerivedVehicleUnwrapped, handler);

  expect(spy).withContext("creating DerivedVehicle proxy").toHaveBeenCalledTimes(0);
  handler.reset();
  //#endregion creating DerivedVehicle proxy

  //#region new DerivedVehicle
  const car = new DerivedVehicle(4, "red");

  expect(spy).withContext(`new DerivedVehicle`).toHaveBeenCalledTimes(6);
  for (let i = 0; i < spy.calls.count(); i++) {
    expect(spy.calls.thisFor(i)).toBe(handler);
  }

  expect(spy.calls.argsFor(0)).withContext(`new DerivedVehicle:0`).toEqual([
    "construct:start:0",
    DerivedVehicleUnwrapped, [4, "red"], DerivedVehicle,
  ]);

  expect(spy.calls.argsFor(1)).withContext(`new DerivedVehicle:1`).toEqual([
    "construct:start:1",
    BaseVehicleUnwrapped, [4], DerivedVehicle,
  ]);

  expect(spy.calls.argsFor(2)).withContext(`new DerivedVehicle:2`).toEqual([
    "get:start:2",
    DerivedVehicleUnwrapped, "prototype", DerivedVehicle,
  ]);
  expect(spy.calls.argsFor(3)).withContext(`new DerivedVehicle:3`).toEqual([
    "get:close:2",
    DerivedVehicleUnwrapped.prototype
  ]);

  // super(wheelCount)
  expect(spy.calls.argsFor(4)).withContext(`new DerivedVehicle:4`).toEqual([
    "construct:close:1",
    car
  ]);

  // new DerivedVehicle(4, "red")
  expect(spy.calls.argsFor(5)).withContext(`new DerivedVehicle:5`).toEqual([
    "construct:close:0",
    car
  ]);

  handler.reset();
  //#endregion new DerivedVehicle

  DerivedRevoker();
  BaseRevoker();

  expect(BaseVehicleUnwrapped.invokeCount).toBe(1);
});
