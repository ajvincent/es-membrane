import {
  NWNCDataDescriptor,
} from "../../source/core/sharedUtilities.mjs";
import MembraneProxyHandlers from "../../source/ProxyHandlers/main.mjs";

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
    const membraneArg = {membrane: null};
    list = new MembraneProxyHandlers.LinkedList(membraneArg, Reflect);
    let handler = new MembraneProxyHandlers.UpdateShadow(membraneArg, "updateShadow");
    list.insertNode("head", handler);

    tail = new MembraneProxyHandlers.LinkedListNode(membraneArg, "tail");
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
