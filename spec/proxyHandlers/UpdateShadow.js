if ((typeof makeShadowTarget !== "function") ||
    (typeof getRealTarget !== "function") ||
    (typeof NWNCDataDescriptor !== "function") ||
    !Array.isArray(allTraps)) {
  if (typeof require == "function") {
    let obj = require("../../docs/dist/node/utilities.js");
    makeShadowTarget = obj.makeShadowTarget;
    getRealTarget = obj.getRealTarget;
    NWNCDataDescriptor = obj.NWNCDataDescriptor;
    allTraps = obj.allTraps;
  }
  else
    throw new Error("Unable to run tests: cannot get shared utilities");
}

if (typeof MembraneProxyHandlers != "object") {
  if (typeof require == "function") {
    var { MembraneProxyHandlers } = require("../../docs/dist/node/proxyHandlers.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneProxyHandlers");
}

describe("MembraneProxyHandlers.UpdateShadow node proxy handler", function() {
  "use strict";

  let list = null,
      target  = null,
      proxy   = null,
      revoke  = null,
      tail    = null;

  function buildProxy() {
    let obj = Proxy.revocable(target, list);
    proxy = obj.proxy;
    revoke = obj.revoke;
  }

  beforeEach(function() {
    list = new MembraneProxyHandlers.LinkedList({membrane: null}, Reflect);
    let handler = list.buildNode("updateShadow", "UpdateShadow");
    list.insertNode("head", handler);

    tail = list.buildNode("tail");
    list.insertNode("updateShadow", tail);
    target = {};
  });

  afterEach(function() {
    list = null;
    if (revoke)
      revoke();
    revoke = null;
    proxy = null;
    target = null;
  });

  const returnFalse = () => false;
  const returnTrue  = () => true;

  describe("for the preventExtensions trap", function() {
    it("returning false for a shadow target", function() {
      tail.preventExtensions = returnFalse;
      expect(list.preventExtensions(target)).toBe(false);
      expect(Reflect.isExtensible(target)).toBe(true);
    });

    it("returning true for a shadow target", function() {
      tail.preventExtensions = returnTrue;
      expect(list.preventExtensions(target)).toBe(true);
      expect(Reflect.isExtensible(target)).toBe(false);
    });

    it("returning false for a proxy", function() {
      tail.preventExtensions = returnFalse;
      buildProxy();
      expect(Reflect.preventExtensions(proxy)).toBe(false);
      expect(Reflect.isExtensible(target)).toBe(true);
    });

    it("returning true for a proxy", function() {
      tail.preventExtensions = returnTrue;
      buildProxy();
      expect(Reflect.preventExtensions(proxy)).toBe(true);
      expect(Reflect.isExtensible(target)).toBe(false);
    });
  });

  describe("for the defineProperty trap", function() {
    const desc = new NWNCDataDescriptor("bar");
    it("returning false for a shadow target", function() {
      tail.defineProperty = returnFalse;
      expect(list.defineProperty(target, "foo", desc)).toBe(false);
      expect(Reflect.getOwnPropertyDescriptor(target, "foo")).toBe(undefined);
    });

    it("returning true for a shadow target", function() {
      tail.defineProperty = returnTrue;
      expect(list.defineProperty(target, "foo", desc)).toBe(true);
      const resultDesc = Reflect.getOwnPropertyDescriptor(target, "foo");
      expect(resultDesc.value).toBe("bar");
    });

    it("returning false for a proxy", function() {
      tail.defineProperty = returnFalse;
      buildProxy();
      expect(Reflect.defineProperty(proxy, "foo", desc)).toBe(false);
      expect(Reflect.getOwnPropertyDescriptor(target, "foo")).toBe(undefined);
    });

    it("returning true for a proxy", function() {
      tail.defineProperty = returnTrue;
      buildProxy();
      expect(Reflect.defineProperty(proxy, "foo", desc)).toBe(true);
      const resultDesc = Reflect.getOwnPropertyDescriptor(target, "foo");
      expect(resultDesc.value).toBe("bar");
    });
  });
});
