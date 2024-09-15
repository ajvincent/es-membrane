import type {
  Class
} from "type-fest";

import TracingProxyHandler from "./support/TracingProxyHandler.js";

it("The construct trap works with classes", () => {
  const handler = new TracingProxyHandler<Class<object, [number, string]>>;
  const { spy } = handler;

  //#region creating BaseVehicle proxy
  class BaseVehicleUnwrapped {
    wheelCount: number;

    adjustWheelCount(delta: number): void {
      this.wheelCount += delta;
    }

    constructor(wheelCount: number) {
      this.wheelCount = wheelCount;
    }
  }

  const {
    proxy: BaseVehicle,
    revoke: BaseRevoker
  } = Proxy.revocable<Class<object, [number]>>(BaseVehicleUnwrapped, handler);

  expect(spy).withContext("creating BaseVehicle proxy").toHaveBeenCalledTimes(0);
  spy.calls.reset();
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

  expect(spy).withContext("class DerivedVehicleUnwrapped extends BaseVehicle").toHaveBeenCalledTimes(1);
  expect(spy.calls.argsFor(0)).toEqual([
    "get",
    BaseVehicleUnwrapped, "prototype", Reflect.getPrototypeOf(DerivedVehicleUnwrapped),
    BaseVehicleUnwrapped.prototype
  ]);
  spy.calls.reset();
  //#endregion class DerivedVehicleUnwrapped extends BaseVehicle

  //#region creating DerivedVehicle proxy
  const {
    proxy: DerivedVehicle,
    revoke: DerivedRevoker
  } = Proxy.revocable<Class<object, [number, string]>>(DerivedVehicleUnwrapped, handler);

  expect(spy).withContext("creating DerivedVehicle proxy").toHaveBeenCalledTimes(0);
  spy.calls.reset();
  //#endregion creating DerivedVehicle proxy

  //#region new DerivedVehicle
  const car = new DerivedVehicle(4, "red");

  expect(spy).withContext(`new DerivedVehicle`).toHaveBeenCalledTimes(3);
  for (let i = 0; i < spy.calls.count(); i++) {
    expect(spy.calls.thisFor(i)).toBe(handler);
  }

  expect(spy.calls.argsFor(0)).toEqual([
    "get",
    DerivedVehicleUnwrapped, "prototype", DerivedVehicle,
    DerivedVehicleUnwrapped.prototype // return value
  ]);

  // super(wheelCount)
  expect(spy.calls.argsFor(1)).toEqual([
    "construct",
    BaseVehicleUnwrapped, [4], DerivedVehicle,
    car
  ]);

  // new DerivedVehicle(4, "red")
  expect(spy.calls.argsFor(2)).toEqual([
    "construct",
    DerivedVehicleUnwrapped, [4, "red"], DerivedVehicle,
    car
  ]);

  spy.calls.reset();
  //#endregion new DerivedVehicle

  DerivedRevoker();
  BaseRevoker();
});
