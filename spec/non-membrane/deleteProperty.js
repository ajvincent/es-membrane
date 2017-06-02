"use strict";
describe("Reflect.deleteProperty() in non-proxy operations returns", function() {
  var inner;
  beforeEach(function() {
    inner = {};
  });
  afterEach(function() {
    inner = null;
  });

  it("returns true when the property doesn't exist", function() {
    expect(Reflect.deleteProperty(inner, "prop")).toBe(true);
  });

  it(
    "true when the existing property descriptor says the property is configurable",
    function() {
      Reflect.defineProperty(inner, "prop", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: true
      });
      expect(Reflect.deleteProperty(inner, "prop")).toBe(true);
      expect(inner.prop).toBe(undefined);
    }
  );

  it(
    "false when the existing property descriptor says the property is configurable",
    function() {
      Reflect.defineProperty(inner, "prop", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: false
      });
      expect(Reflect.deleteProperty(inner, "prop")).toBe(false);
      expect(inner.prop).toBe(2);
    }
  );

  it(
    "true when the object is non-extensible",
    function() {
      Reflect.defineProperty(inner, "prop", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: true
      });
      Reflect.preventExtensions(inner);
      expect(Reflect.deleteProperty(inner, "prop")).toBe(true);
      expect(inner.prop).toBe(undefined);
    }
  );
});

describe("Reflect.deleteProperty() in proxy operations returns", function() {
  var inner, proxy, revoke;
  beforeEach(function() {
    inner = {};
    let obj = Proxy.revocable(inner, {});
    proxy = obj.proxy;
    revoke = obj.revoke;
  });

  afterEach(function() {
    revoke();
    revoke = null;
    proxy = null;
    inner = null;
  });

  it("true when the property doesn't exist", function() {
    expect(Reflect.deleteProperty(proxy, "prop")).toBe(true);
  });

  it(
    "true when the existing property descriptor says the property is configurable",
    function() {
      Reflect.defineProperty(inner, "prop", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: true
      });
      expect(Reflect.deleteProperty(proxy, "prop")).toBe(true);
      expect(inner.prop).toBe(undefined);
      expect(proxy.prop).toBe(undefined);
    }
  );

  it(
    "false when the existing property descriptor says the property is configurable",
    function() {
      Reflect.defineProperty(inner, "prop", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: false
      });
      expect(Reflect.deleteProperty(proxy, "prop")).toBe(false);
      expect(inner.prop).toBe(2);
      expect(proxy.prop).toBe(2);
    }
  );

  it(
    "true when the proxy is non-extensible",
    function() {
      Reflect.defineProperty(inner, "prop", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: true
      });
      Reflect.preventExtensions(proxy);
      expect(Reflect.deleteProperty(proxy, "prop")).toBe(true);
      expect(inner.prop).toBe(undefined);
      expect(proxy.prop).toBe(undefined);
    }
  );
});
