import {
  UpdatingProxyHandler,
} from "./support/UpdatingProxyHandler.js";

describe("Bare objects work as shadow targets for", () => {
  it("property lookups on objects (via getOwnPropertyDescriptor)", () => {
    const actualTarget: { color?: string } = { color: "red" };
    const shadowTarget: { color?: string } = {};
    const { proxy, revoke } = Proxy.revocable<{ color?: string }>(
      shadowTarget, new UpdatingProxyHandler(actualTarget)
    );

    expect(Reflect.getOwnPropertyDescriptor(proxy, "color")!.value).toBe("red");
    expect(proxy.color).toBe("red");
    expect(shadowTarget.color).toBe("red");

    revoke();
  });

  it("property lookups on object (via get)", () => {
    const actualTarget: { color?: string } = { color: "red" };
    const shadowTarget: { color?: string } = {};
    const { proxy, revoke } = Proxy.revocable<{ color?: string }>(
      shadowTarget, new UpdatingProxyHandler(actualTarget)
    );

    expect(proxy.color).withContext("proxy.color").toBe("red");
    /*
    This isn't actually required by the ECMA-262 specification.
    expect(shadowTarget.color).withContext("shadowTarget.color").toBe("red");
    */

    revoke();
  });

  it("array index lookups", () => {
    const shadowTarget: ArrayLike<string> = { 2: "blue", length: 3 };
    const actualTarget: ArrayLike<string> = { 4: "red", length: 5 };
    const { proxy, revoke } = Proxy.revocable<Record<number, string>>(
      shadowTarget, new UpdatingProxyHandler(actualTarget)
    );

    expect(Reflect.getOwnPropertyDescriptor(proxy, 4)!.value).toBe("red");
    expect(proxy[4]).toBe("red");
    expect(shadowTarget[4]).toBe("red");

    revoke();
  });

  it("array keys lookups", () => {
    const shadowTarget: object = {};
    const actualTarget = ["red", "blue", "green"];
    const { proxy, revoke } = Proxy.revocable(
      shadowTarget, new UpdatingProxyHandler(actualTarget)
    );

    expect(Reflect.ownKeys(proxy)).toEqual(["0", "1", "2", "length"]);
    expect(Reflect.ownKeys(shadowTarget)).toEqual(["0", "1", "2", "length"]);

    const zeroDesc = Reflect.getOwnPropertyDescriptor(shadowTarget, "0");
    expect(zeroDesc).toBeDefined();
    if (zeroDesc)
      expect("value" in zeroDesc).toBeTrue();
    expect(zeroDesc?.value).toBeUndefined();

    // ownKeys doesn't define the property values, just the list of keys.
    expect(Reflect.get(shadowTarget, "length")).toBeUndefined();

    revoke();
  });
});

describe("Functions work as shadow targets for", () => {
  it("user-defined function calls", () => {
    {
      const shadowTarget = jasmine.createSpy();
      const actualTarget = jasmine.createSpy();
      const handler = new UpdatingProxyHandler(actualTarget);

      const { proxy, revoke } = Proxy.revocable(shadowTarget, handler);
      actualTarget.and.returnValue("red");

      const thisObj = {};
      expect(proxy.apply(thisObj, ["foo"])).toBe("red");
      expect(actualTarget.calls.thisFor(0)).withContext(`actualTarget.calls.thisFor(0)`).toBe(thisObj);
      expect(actualTarget.calls.argsFor(0)).withContext(`actualTarget.calls.argsFor(0)`).toEqual(["foo"]);

      // apply and construct traps do not need to modify the shadow target.
      expect(shadowTarget.calls.count()).withContext(`shadowTarget.calls.count()`).toBe(0);
      revoke();
    }

    {
      const shadowTarget: object = {};
      const actualTarget: object = {};
      const handler = new UpdatingProxyHandler(actualTarget);

      const { proxy, revoke } = Proxy.revocable(shadowTarget, handler);

      const thisObj = {};
      expect(
        (): unknown => Reflect.apply(proxy as CallableFunction, thisObj, ["foo"])
      ).toThrow();

      revoke();
    }
  });

  it("built-in functions (doubling as an Array.prototype method test)", () => {
    const thisObj: ArrayLike<string> = { 0: "blue", 1: "green", length: 2 };
    const argsArray: string[] = ["red"];

    const shadowTarget = jasmine.createSpy();
    const actualTarget = Array.prototype.unshift;
    const handler = new UpdatingProxyHandler(actualTarget);

    const { proxy, revoke } = Proxy.revocable(shadowTarget, handler);

    expect(proxy.apply(thisObj, argsArray)).toBe(3);
    expect(shadowTarget.calls.count()).toBe(0);

    expect(thisObj).toEqual({
      0: "red",
      1: "blue",
      2: "green",
      length: 3,
    });

    revoke();
  });
});
