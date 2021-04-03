import {
  allTraps,
} from "../../source/core/utilities/shared.mjs";
import MembraneProxyHandlers from "../../source/ProxyHandlers/main.mjs";

const membraneArg = {membrane: null};

describe("MembraneProxyHandlers.LinkedList node proxy handler", function() {
  let handler = null, proxy = null, revoke = null, shadow = null, mirror = null;
  beforeEach(function() {
    shadow = {};
    mirror = {};
    let list = new MembraneProxyHandlers.LinkedList(membraneArg, Reflect);
    handler = new MembraneProxyHandlers.LinkedListNode(membraneArg, "foo");
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
  });

  it("inherits from MembraneProxyHandlers.Base", function() {
    expect(handler instanceof MembraneProxyHandlers.Base).toBe(true);
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

      let proxyActual = Reflect.getPrototypeOf(proxy);
      expect(proxyActual).toBe(expected);
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

      expect(Reflect.getPrototypeOf(proxy)).toBe(proto);
    });

    it("on the isExtensible trap (via the shadow)", function() {
      expect(handler.isExtensible(shadow)).toBe(true);
      expect(Reflect.isExtensible(proxy)).toBe(true);
      Reflect.preventExtensions(shadow);
      expect(handler.isExtensible(shadow)).toBe(false);
      expect(Reflect.isExtensible(proxy)).toBe(false);
    });

    it("on the isExtensible trap (via the proxy)", function() {
      expect(handler.isExtensible(shadow)).toBe(true);
      expect(Reflect.isExtensible(proxy)).toBe(true);
      Reflect.preventExtensions(proxy);
      expect(handler.isExtensible(shadow)).toBe(false);
      expect(Reflect.isExtensible(proxy)).toBe(false);
    });

    it("on the preventExtensions trap (via the shadow)", function() {
      handler.preventExtensions(shadow);
      expect(Reflect.isExtensible(shadow)).toBe(false);
      expect(handler.isExtensible(proxy)).toBe(false);
    });

    it("on the preventExtensions trap (via the proxy)", function() {
      Reflect.preventExtensions(proxy);
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
      Reflect.defineProperty(shadow, "foo", desc);

      const desc2 = handler.getOwnPropertyDescriptor(shadow, "foo");

      expect(Reflect.ownKeys(desc2)).toEqual(Reflect.ownKeys(desc));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );

      const desc3 = Reflect.getOwnPropertyDescriptor(proxy, "foo");

      expect(Reflect.ownKeys(desc3)).toEqual(Reflect.ownKeys(desc));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc3[key]).toBe(desc[key])
      );
    });

    it("on the defineProperty trap (via the shadow)", function() {
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

      const desc3 = Reflect.getOwnPropertyDescriptor(proxy, "foo");

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
      Reflect.defineProperty(proxy, "foo", desc);

      const desc2 = Reflect.getOwnPropertyDescriptor(shadow, "foo");
      expect(Reflect.ownKeys(desc)).toEqual(Reflect.ownKeys(desc2));
      Reflect.ownKeys(desc).forEach((key) =>
        expect(desc2[key]).toBe(desc[key])
      );

      const desc3 = Reflect.getOwnPropertyDescriptor(proxy, "foo");

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
      expect(handler.has(shadow, "bar")).toBe(true);

      expect(Reflect.has(proxy, "foo")).toBe(true);
      expect(Reflect.has(proxy, "bar")).toBe(true);
    });

    it("on the get trap", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      base.foo = foo;
      shadow.bar = bar;
      expect(handler.get(shadow, "foo")).toBe(foo);
      expect(handler.get(shadow, "bar")).toBe(bar);

      expect(Reflect.get(proxy, "foo")).toBe(foo);
      expect(Reflect.get(proxy, "bar")).toBe(bar);
    });

    it("on the set trap (via the shadow)", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      expect(handler.set(base, "foo", foo)).toBe(Reflect.set(mirror, "foo", foo));
      expect(handler.set(shadow, "bar", bar)).toBe(Reflect.set(mirror, "bar", bar));

      expect(Reflect.get(shadow, "foo")).toBe(foo);
      expect(Reflect.get(shadow, "bar")).toBe(bar);

      expect(Reflect.get(proxy, "foo")).toBe(foo);
      expect(Reflect.get(proxy, "bar")).toBe(bar);
    });

    it("on the set trap (via the Proxy)", function() {
      const base = {}, foo = {}, bar = {};
      Reflect.setPrototypeOf(shadow, base);
      expect(Reflect.set(base, "foo", foo)).toBe(Reflect.set(mirror, "foo", foo));
      expect(Reflect.set(proxy, "bar", bar)).toBe(Reflect.set(mirror, "bar", bar));

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

      expect(Reflect.hasOwnProperty(shadow, "foo")).toBe(false);
      expect(Reflect.hasOwnProperty(proxy, "foo")).toBe(false);
    });

    it("on the deleteProperty trap (via the proxy)", function() {
      const foo = {};
      shadow.foo = foo;
      mirror.foo = foo;
      expect(Reflect.deleteProperty(proxy, "foo")).toBe(Reflect.deleteProperty(mirror, "foo"));

      expect(Reflect.hasOwnProperty(shadow, "foo")).toBe(false);
      expect(Reflect.hasOwnProperty(proxy, "foo")).toBe(false);
    });

    it("on the ownKeys trap", function() {
      shadow.foo = 1;
      shadow.bar = 2;
      const expected = Reflect.ownKeys(shadow);
      expect(handler.ownKeys(shadow)).toEqual(expected);
      expect(Reflect.ownKeys(proxy)).toEqual(expected);
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

      expectedThis = shadow;
      const rv2 = Reflect.apply(proxy, expectedThis, expectedArgs.slice(0));
      expect(rv2).toBe(rv);
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

      const rv3 = Reflect.construct(proxy, [ "foo" ], base);
      expect(rv3.arg).toBe("foo");
      expect(rv3.validate()).toBe(true);
    });
  });

  describe("can override a trap", function() {
    const dummy = function() {};
    allTraps.forEach((trap) => {
      it(trap, function() {
        expect(Reflect.hasOwnProperty(handler, trap)).toBe(false);
        expect(Reflect.defineProperty(
          handler, trap, {
            value: dummy,
            writable: false,
            enumerable: false,
            configurable: false
          }
        )).toBe(true);
        expect(handler[trap]).toBe(dummy);
      });
    });
  });
});

describe("MembraneProxyHandlers.LinkedList proxy handler", function() {
  let handler = null, revoke = null;
  beforeEach(function() {
    handler = new MembraneProxyHandlers.LinkedList(membraneArg, Reflect);
    revoke = () => {};
  });

  afterEach(function() {
    handler = null;
    revoke();
  });

  it("inherits from MembraneProxyHandlers.Forwarding", function() {
    expect(handler instanceof MembraneProxyHandlers.Forwarding).toBe(true);
  });

  it("has a head node", function() {
    expect(handler.nextHandler instanceof MembraneProxyHandlers.Base).toBe(true);
    expect(handler.getNodeByName("head")).toBe(handler.nextHandler);
    const desc = Reflect.getOwnPropertyDescriptor(handler, "nextHandler");
    expect(desc).not.toBe(undefined);
    if (desc) {
      expect(desc.writable).toBe(false);
      expect(desc.configurable).toBe(false);
    }
  });

  it("has a tail node", function() {
    expect(handler.tailNode instanceof MembraneProxyHandlers.Forwarding).toBe(true);
    expect(handler.getNextNode("head", null)).toBe(handler.tailNode);
    expect(handler.tailNode.nextHandler).toBe(Reflect);
  });

  it("can insert linked list nodes", function() {
    const first = new MembraneProxyHandlers.LinkedListNode(membraneArg, "first");
    const second = new MembraneProxyHandlers.LinkedListNode(membraneArg, "second")

    const interrupt = new MembraneProxyHandlers.LinkedListNode(membraneArg, "interrupt");
    const obj1 = {};
    const obj2 = {};

    handler.insertNode("head", first, null);
    handler.insertNode("first", second, null);

    handler.insertNode("head", interrupt, obj1);

    handler.insertNode("first", interrupt, obj2);

    expect(handler.getNextNode("head")).toBe(first);
    expect(handler.getNextNode("first")).toBe(second);
    expect(handler.getNextNode("second")).toBe(handler.tailNode);

    expect(handler.getNextNode("head", obj1)).toBe(interrupt);
    expect(handler.getNextNode("interrupt", obj1)).toBe(first);
    expect(handler.getNextNode("first", obj1)).toBe(second);
    expect(handler.getNextNode("second", obj1)).toBe(handler.tailNode);

    expect(handler.getNextNode("head", obj2)).toBe(first);
    expect(handler.getNextNode("first", obj2)).toBe(interrupt);
    expect(handler.getNextNode("interrupt", obj2)).toBe(second);
    expect(handler.getNextNode("second", obj2)).toBe(handler.tailNode);
  });

  it(
    "can be constructed with a MembraneProxyHandlers.Forwarding proxy as the tail",
    function() {
      const f = new MembraneProxyHandlers.Forwarding(membraneArg, Reflect);
      handler = new MembraneProxyHandlers.LinkedList(membraneArg, f);
      expect(handler.tailNode.nextHandler).toBe(f);
    }
  );

  it(
    "can be constructed with a MembraneProxyHandlers.LinkedList proxy as the tail",
    function() {
      const f = new MembraneProxyHandlers.LinkedList(membraneArg, Reflect);
      handler = new MembraneProxyHandlers.LinkedList(membraneArg, f);
      expect(handler.tailNode.nextHandler).toBe(f);
    }
  );
});