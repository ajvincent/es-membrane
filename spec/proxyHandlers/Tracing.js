if ((typeof DataDescriptor !== "function") ||
    (typeof isDataDescriptor !== "function") ||
    (typeof NWNCDataDescriptor !== "function") ||
    !Array.isArray(allTraps)) {
  if (typeof require == "function") {
    let obj = require("../../docs/dist/node/utilities.js");
    DataDescriptor = obj.DataDescriptor;
    isDataDescriptor = obj.isDataDescriptor;
    NWNCDataDescriptor = obj.NWNCDataDescriptor;
    allTraps = obj.allTraps;
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

describe("MembraneProxyHandlers.Tracing node proxy handler", function() {
  "use strict";
  let handler = null,
      proxy = null,
      revoke = null,
      shadow = null,
      mirror = null,
      list   = null;
  beforeEach(function() {
    shadow = {};
    mirror = {};
    list = new MembraneProxyHandlers.LinkedList({membrane: null}, Reflect);
    handler = list.buildNode("trace", "Tracing");
    list.insertNode("head", handler);
    let obj = Proxy.revocable(shadow, handler);
    proxy = obj.proxy;
    revoke = obj.revoke;
  });

  afterEach(function() {
    handler = null;
    shadow = null;
    mirror = null;
    if (revoke)
      revoke();
    revoke = null;
    proxy = null;
    list = null;
  });

  it("inherits from MembraneProxyHandlers.LinkedListNode", function() {
    expect(handler instanceof MembraneProxyHandlers.LinkedListNode).toBe(true);
      expect(handler.traceLog).toEqual([
      ]);
      handler.clearLog();
  });

  describe("can forward to Reflect", function() {
    beforeEach(() => handler.link(null, Reflect));

    it("on the getPrototypeOf trap", function() {
      function base() {}
      shadow = new base();
      mirror = new base();

      revoke();
      let obj = Proxy.revocable(shadow, handler);
      proxy = obj.proxy;
      revoke = obj.revoke;

      const expected = Reflect.getPrototypeOf(mirror);
      let shadowActual = handler.getPrototypeOf(shadow);
      expect(shadowActual).toBe(expected);
      expect(handler.traceLog).toEqual([
        "enter trace, getPrototypeOf",
        "leave trace, getPrototypeOf",
      ]);
      handler.clearLog();

      let proxyActual = Reflect.getPrototypeOf(proxy);
      expect(proxyActual).toBe(expected);
      expect(handler.traceLog).toEqual([
        "enter trace, getPrototypeOf",
        "leave trace, getPrototypeOf",
      ]);
    });

    it("on the setPrototypeOf trap (via the shadow)", function() {
      function base() {}
      shadow = new base();
      const proto = {};

      revoke();
      let obj = Proxy.revocable(shadow, handler);
      proxy = obj.proxy;
      revoke = obj.revoke;

      handler.setPrototypeOf(shadow, proto);
      expect(handler.traceLog).toEqual([
        "enter trace, setPrototypeOf",
        "leave trace, setPrototypeOf",
      ]);
      handler.clearLog();

      expect(Reflect.getPrototypeOf(shadow)).toBe(proto);
      expect(Reflect.getPrototypeOf(proxy)).toBe(proto);
    });

    it("on the setPrototypeOf trap (via the proxy)", function() {
      function base() {}
      shadow = new base();
      const proto = {};

      revoke();
      let obj = Proxy.revocable(shadow, handler);
      proxy = obj.proxy;
      revoke = obj.revoke;

      Reflect.setPrototypeOf(proxy, proto);
      expect(Reflect.getPrototypeOf(shadow)).toBe(proto);
      expect(handler.traceLog).toEqual([
        "enter trace, setPrototypeOf",
        "leave trace, setPrototypeOf",
      ]);
      handler.clearLog();

      expect(Reflect.getPrototypeOf(proxy)).toBe(proto);
    });

    it("on the isExtensible trap (via the shadow)", function() {
      expect(handler.isExtensible(shadow)).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();

      expect(Reflect.isExtensible(proxy)).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();

      Reflect.preventExtensions(shadow);

      expect(handler.isExtensible(shadow)).toBe(false);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();

      expect(Reflect.isExtensible(proxy)).toBe(false);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();
    });

    it("on the isExtensible trap (via the proxy)", function() {
      expect(handler.isExtensible(shadow)).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();

      expect(Reflect.isExtensible(proxy)).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();

      Reflect.preventExtensions(proxy);
      handler.clearLog();

      expect(handler.isExtensible(shadow)).toBe(false);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();

      expect(Reflect.isExtensible(proxy)).toBe(false);
      expect(handler.traceLog).toEqual([
        "enter trace, isExtensible",
        "leave trace, isExtensible",
      ]);
      handler.clearLog();
    });

    it("on the preventExtensions trap (via the shadow)", function() {
      handler.preventExtensions(shadow);
      expect(handler.traceLog).toEqual([
        "enter trace, preventExtensions",
        "leave trace, preventExtensions",
      ]);
      handler.clearLog();

      expect(Reflect.isExtensible(shadow)).toBe(false);
      expect(handler.isExtensible(proxy)).toBe(false);
    });

    it("on the preventExtensions trap (via the proxy)", function() {
      Reflect.preventExtensions(proxy);
      expect(handler.traceLog).toEqual([
        "enter trace, preventExtensions",
        "leave trace, preventExtensions",
      ]);
      handler.clearLog();

      expect(Reflect.isExtensible(shadow)).toBe(false);
      expect(handler.isExtensible(proxy)).toBe(false);
    });

    it("on the getOwnPropertyDescriptor trap", function() {
      const desc = {
        value: {},
        writable: true,
        enumerable: true,
        configurable: false
      };
      Reflect.defineProperty(shadow, "bar", desc);

      const desc2 = handler.getOwnPropertyDescriptor(shadow, "bar");

      expect(Reflect.ownKeys(desc2)).toEqual(Reflect.ownKeys(desc));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );

      expect(handler.traceLog).toEqual([
        "enter trace, getOwnPropertyDescriptor, bar",
        "leave trace, getOwnPropertyDescriptor, bar",
      ]);
      handler.clearLog();

      const desc3 = Reflect.getOwnPropertyDescriptor(proxy, "bar");

      expect(Reflect.ownKeys(desc3)).toEqual(Reflect.ownKeys(desc));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc3[key]).toBe(desc[key])
      );

      expect(handler.traceLog).toEqual([
        "enter trace, getOwnPropertyDescriptor, bar",
        "leave trace, getOwnPropertyDescriptor, bar",
      ]);
      handler.clearLog();
    });

    it("on the defineProperty trap (via the shadow)", function() {
      const desc = {
        value: {},
        writable: true,
        enumerable: true,
        configurable: false
      };
      handler.defineProperty(shadow, "bar", desc);
      expect(handler.traceLog).toEqual([
        "enter trace, defineProperty, bar",
        "leave trace, defineProperty, bar",
      ]);
      handler.clearLog();

      const desc2 = Reflect.getOwnPropertyDescriptor(shadow, "bar");
      expect(Reflect.ownKeys(desc)).toEqual(Reflect.ownKeys(desc2));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );

      const desc3 = Reflect.getOwnPropertyDescriptor(proxy, "bar");

      expect(Reflect.ownKeys(desc3)).toEqual(Reflect.ownKeys(desc));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc3[key]).toBe(desc[key])
      );
    });

    it("on the defineProperty trap (via the proxy)", function() {
      const desc = {
        value: {},
        writable: true,
        enumerable: true,
        configurable: false
      };
      Reflect.defineProperty(proxy, "bar", desc);
      expect(handler.traceLog).toEqual([
        "enter trace, defineProperty, bar",
        "leave trace, defineProperty, bar",
      ]);
      handler.clearLog();

      const desc2 = Reflect.getOwnPropertyDescriptor(shadow, "bar");
      expect(Reflect.ownKeys(desc)).toEqual(Reflect.ownKeys(desc2));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );

      const desc3 = Reflect.getOwnPropertyDescriptor(proxy, "bar");

      expect(Reflect.ownKeys(desc3)).toEqual(Reflect.ownKeys(desc));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc3[key]).toBe(desc[key])
      );
    });

    it("on the has trap", function() {
      const base = {};
      base.foo = {};
      Reflect.setPrototypeOf(shadow, base);
      shadow.bar = {};
      expect(handler.has(shadow, "foo")).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, has, foo",
        "leave trace, has, foo",
      ]);
      handler.clearLog();

      expect(handler.has(shadow, "bar")).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, has, bar",
        "leave trace, has, bar",
      ]);
      handler.clearLog();

      expect(Reflect.has(proxy, "foo")).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, has, foo",
        "leave trace, has, foo",
      ]);
      handler.clearLog();

      expect(Reflect.has(proxy, "bar")).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, has, bar",
        "leave trace, has, bar",
      ]);
      handler.clearLog();
    });

    it("on the get trap", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      base.foo = foo;
      shadow.bar = bar;

      expect(handler.get(shadow, "foo")).toBe(foo);
      expect(handler.traceLog).toEqual([
        "enter trace, get, foo",
        "leave trace, get, foo",
      ]);
      handler.clearLog();

      expect(handler.get(shadow, "bar")).toBe(bar);
      expect(handler.traceLog).toEqual([
        "enter trace, get, bar",
        "leave trace, get, bar",
      ]);
      handler.clearLog();

      expect(Reflect.get(proxy, "foo")).toBe(foo);
      expect(handler.traceLog).toEqual([
        "enter trace, get, foo",
        "leave trace, get, foo",
      ]);
      handler.clearLog();

      expect(Reflect.get(proxy, "bar")).toBe(bar);
      expect(handler.traceLog).toEqual([
        "enter trace, get, bar",
        "leave trace, get, bar",
      ]);
      handler.clearLog();
    });

    it("on the set trap (via the shadow)", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      expect(handler.set(base, "foo", foo)).toBe(Reflect.set(mirror, "foo", foo));
      expect(handler.traceLog).toEqual([
        "enter trace, set, foo",
        "leave trace, set, foo",
      ]);
      handler.clearLog();

      expect(handler.set(shadow, "bar", bar)).toBe(Reflect.set(mirror, "bar", bar));
      expect(handler.traceLog).toEqual([
        "enter trace, set, bar",
        "leave trace, set, bar",
      ]);
      handler.clearLog();

      expect(Reflect.get(shadow, "foo")).toBe(foo);
      expect(Reflect.get(shadow, "bar")).toBe(bar);

      expect(Reflect.get(proxy, "foo")).toBe(foo);
      expect(Reflect.get(proxy, "bar")).toBe(bar);
    });

    it("on the set trap (via the proxy)", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      expect(Reflect.set(base, "foo", foo)).toBe(Reflect.set(mirror, "foo", foo));

      const expected = Reflect.set(mirror, "bar", bar);

      /* Note:  Reflect.set defines a fourth argument for the receiver which is
       * the same as the first argument when the fourth argument is not provided.
       * That's why it triggers these additional traps.
       *
       * See http://www.ecma-international.org/ecma-262/#sec-ordinarysetwithowndescriptor
       */
      expect(Reflect.set(proxy, "bar", bar)).toBe(expected);
      expect(handler.traceLog).toEqual([
        "enter trace, set, bar",
        "enter trace, getOwnPropertyDescriptor, bar",
        "leave trace, getOwnPropertyDescriptor, bar",
        "enter trace, defineProperty, bar",
        "leave trace, defineProperty, bar",
        "leave trace, set, bar",
      ]);
      handler.clearLog();

      expect(Reflect.get(shadow, "foo")).toBe(foo);
      expect(Reflect.get(shadow, "bar")).toBe(bar);

      expect(Reflect.get(proxy, "foo")).toBe(foo);
      expect(Reflect.get(proxy, "bar")).toBe(bar);
    });

    it("on the deleteProperty trap (via the shadow)", function() {
      const foo = {};
      shadow.foo = foo;
      mirror.foo = foo;
      expect(handler.deleteProperty(shadow, "foo")).toBe(Reflect.deleteProperty(mirror, "foo"));
      expect(handler.traceLog).toEqual([
        "enter trace, deleteProperty, foo",
        "leave trace, deleteProperty, foo",
      ]);
      handler.clearLog();

      expect(Reflect.hasOwnProperty(shadow, "foo")).toBe(false);
      expect(Reflect.hasOwnProperty(proxy, "foo")).toBe(false);
    });

    it("on the deleteProperty trap (via the proxy)", function() {
      const foo = {};
      shadow.foo = foo;
      mirror.foo = foo;
      expect(Reflect.deleteProperty(proxy, "foo")).toBe(Reflect.deleteProperty(mirror, "foo"));
      expect(handler.traceLog).toEqual([
        "enter trace, deleteProperty, foo",
        "leave trace, deleteProperty, foo",
      ]);
      handler.clearLog();

      expect(Reflect.hasOwnProperty(shadow, "foo")).toBe(false);
      expect(Reflect.hasOwnProperty(proxy, "foo")).toBe(false);
    });

    it("on the ownKeys trap", function() {
      shadow.foo = 1;
      shadow.bar = 2;
      const expected = Reflect.ownKeys(shadow);
      expect(handler.ownKeys(shadow)).toEqual(expected);
      expect(handler.traceLog).toEqual([
        "enter trace, ownKeys",
        "leave trace, ownKeys",
      ]);
      handler.clearLog();

      expect(Reflect.ownKeys(proxy)).toEqual(expected);
      expect(handler.traceLog).toEqual([
        "enter trace, ownKeys",
        "leave trace, ownKeys",
      ]);
      handler.clearLog();

    });

    it("on the apply trap", function() {
      shadow = function() {
        expect(this).toBe(expectedThis);
        expect(Array.from(arguments)).toEqual(expectedArgs);
        return rv;
      };

      revoke();
      let obj = Proxy.revocable(shadow, handler);
      proxy = obj.proxy;
      revoke = obj.revoke;

      const rv = {}, expectedArgs = [ "foo", "bar" ];
      let expectedThis = {};

      const rv1 = handler.apply(shadow, expectedThis, expectedArgs.slice(0));
      expect(rv1).toBe(rv);
      expect(handler.traceLog).toEqual([
        "enter trace, apply",
        "leave trace, apply",
      ]);
      handler.clearLog();

      expectedThis = shadow;
      const rv2 = Reflect.apply(proxy, expectedThis, expectedArgs.slice(0));
      expect(rv2).toBe(rv);
      expect(handler.traceLog).toEqual([
        "enter trace, apply",
        "leave trace, apply",
      ]);
      handler.clearLog();
    });

    it("on the construct trap", function() {
      const base = function() {};
      base.prototype.validate = () => true;

      shadow = function(arg1) { this.arg = arg1; };

      revoke();
      let obj = Proxy.revocable(shadow, handler);
      proxy = obj.proxy;
      revoke = obj.revoke;

      const rv1 = Reflect.construct(shadow, [ "foo" ], base);
      expect(rv1.arg).toBe("foo");
      expect(rv1.validate()).toBe(true);

      const rv2 = handler.construct(shadow, [ "bar" ], base);
      expect(rv2.arg).toBe("bar");
      expect(rv2.validate()).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, construct",
        "leave trace, construct",
      ]);
      handler.clearLog();

      const rv3 = Reflect.construct(proxy, [ "foo" ], base);
      expect(rv3.arg).toBe("foo");
      expect(rv3.validate()).toBe(true);
      expect(handler.traceLog).toEqual([
        "enter trace, construct",
        "leave trace, construct",
      ]);
      handler.clearLog();
    });
  });

  it("logs when a trap throws an error", function() {
    const err = list.buildNode("error");
    list.insertNode("trace", err);

    function th() {
      throw new Error("nope");
    }

    err.ownKeys = th;
    shadow.foo = 1;
    shadow.bar = 2;
    try {
      handler.ownKeys(shadow);
      throw new Error("not reachable");
    }
    catch (ex) {
      expect(ex.message).toBe("nope");
    }
    expect(handler.traceLog).toEqual([
      "enter trace, ownKeys",
      "throw trace, ownKeys",
    ]);
    handler.clearLog();

    err.defineProperty = th;
    const bar = {};

    try {
      Reflect.set(proxy, "bar", bar);
      throw new Error("not reachable");
    }
    catch (ex) {
      expect(ex.message).toBe("nope");
    }
    expect(handler.traceLog).toEqual([
      "enter trace, set, bar",
      "enter trace, getOwnPropertyDescriptor, bar",
      "leave trace, getOwnPropertyDescriptor, bar",
      "enter trace, defineProperty, bar",
      "throw trace, defineProperty, bar",
      "throw trace, set, bar",
    ]);
    handler.clearLog();
  });

  it("allows reusing the same trace log", function() {
    const other = list.buildNode("other", "Tracing", handler.traceLog);
    list.insertNode("trace", other);

    shadow.foo = 1;
    shadow.bar = 2;
    handler.ownKeys(shadow);
    expect(handler.traceLog).toEqual([
      "enter trace, ownKeys",
      "enter other, ownKeys",
      "leave other, ownKeys",
      "leave trace, ownKeys",
    ]);
    handler.clearLog();
  });
});
