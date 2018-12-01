if ((typeof DataDescriptor != "function") ||
    (typeof isDataDescriptor != "function") ||
    !Array.isArray(allTraps)) {
  if (typeof require == "function") {
    require("../../docs/dist/node/utilities.js");
  }
  else
    throw new Error("Unable to run tests: cannot get DataDescriptor");
}

if (typeof MembraneProxyHandlers != "object") {
  if (typeof require == "function") {
    var { MembraneProxyHandlers } = require("../../docs/dist/node/proxyHandlers.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneProxyHandlers");
}

describe("MembraneProxyHandlers.Forwarding proxy handler", function() {
  "use strict";
  let handler = null, proxy = null, revoke = null, shadow = null, mirror = null;
  beforeEach(function() {
    shadow = {};
    mirror = {};
    handler = new MembraneProxyHandlers.Forwarding();
  });

  afterEach(function() {
    handler = null;
    shadow = null;
    mirror = null;
    if (revoke)
      revoke();
    revoke = null;
    proxy = null;
  });

  it("inherits from MembraneProxyHandlers.Base", function() {
    expect(handler instanceof MembraneProxyHandlers.Base).toBe(true);
  });
  
  describe("can forward to Reflect", function() {
/*
  "ownKeys",
  "apply",
  "construct"
 */
    it("on the getPrototypeOf trap", function() {
      handler.setNextHandler(["getPrototypeOf"], Reflect);
      function base() {}
      shadow = new base();
      mirror = new base();
      expect(handler.getPrototypeOf(shadow)).toBe(Reflect.getPrototypeOf(mirror));
    });

    it("on the setPrototypeOf trap", function() {
      handler.setNextHandler(["setPrototypeOf"], Reflect);
      function base() {}
      shadow = new base();
      const proto = {};
      handler.setPrototypeOf(shadow, proto);
      expect(Reflect.getPrototypeOf(shadow)).toBe(proto);
    });

    it("on the isExtensible trap", function() {
      handler.setNextHandler(["isExtensible"], Reflect);
      expect(handler.isExtensible(shadow)).toBe(true);
      Reflect.preventExtensions(shadow);
      expect(handler.isExtensible(shadow)).toBe(false);
    });

    it("on the preventExtensions trap", function() {
      handler.setNextHandler(["preventExtensions"], Reflect);
      handler.preventExtensions(shadow);
      expect(Reflect.isExtensible(shadow)).toBe(false);
    });

    it("on the getOwnPropertyDescriptor trap", function() {
      handler.setNextHandler(["getOwnPropertyDescriptor"], Reflect);
      const desc = {
        value: {},
        writable: true,
        enumerable: true,
        configurable: false
      };
      Reflect.defineProperty(shadow, "foo", desc);
      const desc2 = handler.getOwnPropertyDescriptor(shadow, "foo");
      expect(Reflect.ownKeys(desc)).toEqual(Reflect.ownKeys(desc2));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );
    });

    it("on the defineProperty trap", function() {
      handler.setNextHandler(["defineProperty"], Reflect);
      const desc = {
        value: {},
        writable: true,
        enumerable: true,
        configurable: false
      };
      handler.defineProperty(shadow, "foo", desc);
      const desc2 = Reflect.getOwnPropertyDescriptor(shadow, "foo");
      expect(Reflect.ownKeys(desc)).toEqual(Reflect.ownKeys(desc2));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );
    });

    it("on the has trap", function() {
      handler.setNextHandler(["has"], Reflect);
      const base = {};
      base.foo = {};
      Reflect.setPrototypeOf(shadow, base);
      shadow.bar = {};
      expect(handler.has(shadow, "foo")).toBe(true);
      expect(handler.has(shadow, "bar")).toBe(true);
    });

    it("on the get trap", function() {
      handler.setNextHandler(["get"], Reflect);
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      base.foo = foo;
      shadow.bar = bar;
      expect(handler.get(shadow, "foo")).toBe(foo);
      expect(handler.get(shadow, "bar")).toBe(bar);
    });

    it("on the set trap", function() {
      handler.setNextHandler(["set"], Reflect);
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      expect(handler.set(base, "foo", foo)).toBe(Reflect.set(mirror, "foo", foo));
      expect(handler.set(shadow, "bar", bar)).toBe(Reflect.set(mirror, "bar", bar));
      expect(Reflect.get(shadow, "foo")).toBe(foo);
      expect(Reflect.get(shadow, "bar")).toBe(bar);
    });

    it("on the deleteProperty trap", function() {
      handler.setNextHandler(["deleteProperty"], Reflect);
      const foo = {};
      shadow.foo = foo;
      mirror.foo = foo;
      expect(handler.deleteProperty(shadow, "foo")).toBe(Reflect.deleteProperty(mirror, "foo"));
      expect(Reflect.hasOwnProperty(shadow, "foo")).toBe(false);
    });
  });
});
