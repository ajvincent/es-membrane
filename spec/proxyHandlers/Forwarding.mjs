import MembraneProxyHandlers from "../../source/ProxyHandlers/main.mjs";

describe("MembraneProxyHandlers.Forwarding proxy handler", function() {
  "use strict";
  let handler = null, shadow = null, mirror = null;
  beforeEach(function() {
    shadow = {};
    mirror = {};
    handler = new MembraneProxyHandlers.Forwarding();
  });

  afterEach(function() {
    handler = null;
    shadow = null;
    mirror = null;
  });

  it("inherits from MembraneProxyHandlers.Base", function() {
    expect(handler instanceof MembraneProxyHandlers.Base).toBe(true);
  });

  describe("can forward to Reflect", function() {
    beforeEach(() => handler.nextHandler = Reflect);

    it("on the getPrototypeOf trap", function() {
      function base() {}
      shadow = new base();
      mirror = new base();
      expect(handler.getPrototypeOf(shadow)).toBe(Reflect.getPrototypeOf(mirror));
    });

    it("on the setPrototypeOf trap", function() {
      function base() {}
      shadow = new base();
      const proto = {};
      handler.setPrototypeOf(shadow, proto);
      expect(Reflect.getPrototypeOf(shadow)).toBe(proto);
    });

    it("on the isExtensible trap", function() {
      expect(handler.isExtensible(shadow)).toBe(true);
      Reflect.preventExtensions(shadow);
      expect(handler.isExtensible(shadow)).toBe(false);
    });

    it("on the preventExtensions trap", function() {
      handler.preventExtensions(shadow);
      expect(Reflect.isExtensible(shadow)).toBe(false);
    });

    it("on the getOwnPropertyDescriptor trap", function() {
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
      const base = {};
      base.foo = {};
      Reflect.setPrototypeOf(shadow, base);
      shadow.bar = {};
      expect(handler.has(shadow, "foo")).toBe(true);
      expect(handler.has(shadow, "bar")).toBe(true);
    });

    it("on the get trap", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      base.foo = foo;
      shadow.bar = bar;
      expect(handler.get(shadow, "foo")).toBe(foo);
      expect(handler.get(shadow, "bar")).toBe(bar);
    });

    it("on the set trap", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      expect(handler.set(base, "foo", foo)).toBe(Reflect.set(mirror, "foo", foo));
      expect(handler.set(shadow, "bar", bar)).toBe(Reflect.set(mirror, "bar", bar));
      expect(Reflect.get(shadow, "foo")).toBe(foo);
      expect(Reflect.get(shadow, "bar")).toBe(bar);
    });

    it("on the deleteProperty trap", function() {
      const foo = {};
      shadow.foo = foo;
      mirror.foo = foo;
      expect(handler.deleteProperty(shadow, "foo")).toBe(Reflect.deleteProperty(mirror, "foo"));
      expect(Reflect.hasOwnProperty(shadow, "foo")).toBe(false);
    });

    it("on the ownKeys trap", function() {
      shadow.foo = 1;
      shadow.bar = 2;
      expect(handler.ownKeys(shadow)).toEqual(Reflect.ownKeys(shadow));
    });

    it("on the apply trap", function() {
      const rv1 = Reflect.apply(''.charAt, 'ponies', [3]);
      const rv2 = handler.apply(''.charAt, 'ponies', [3]);
      expect(rv1).toBe(rv2);
    });

    it("on the construct trap", function() {
      const base = function() {};
      base.prototype.validate = () => true;
      shadow = function(arg1) { this.arg = arg1; };
      const rv1 = Reflect.construct(shadow, [ "foo" ], base);
      expect(rv1.arg).toBe("foo");
      expect(rv1.validate()).toBe(true);

      const rv2 = handler.construct(shadow, [ "foo" ], base);
      expect(rv2.arg).toBe("foo");
      expect(rv2.validate()).toBe(true);
    });
  });
});
