"use strict";

const wetInner = { color: "red" };
const wetOuter = { getInner: () => wetInner };
var callCount;
Reflect.defineProperty(wetOuter, "inner", {
  get: () => wetInner,
  enumerable: true,
  configurable: false
});

function defineLazyGetter(source, target, propName) {
  const desc = {
    get: function() {
      let sourceDesc = Reflect.getOwnPropertyDescriptor(source, propName);
      if ((sourceDesc !== undefined) && ("value" in sourceDesc)) {
        return desc.set.call(this, sourceDesc.value);
      }

      callCount++;
      expect(Reflect.deleteProperty(target, propName)).toBe(true);
      expect(Reflect.defineProperty(target, propName, sourceDesc)).toBe(true);
      if ((sourceDesc !== undefined) && ("get" in sourceDesc))
        return sourceDesc.get.apply(target);
      return undefined;
    },

    set: function(value) {
      callCount++;
      expect(Reflect.deleteProperty(target, propName)).toBe(true);
      expect(Reflect.defineProperty(target, propName, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      })).toBe(true);
      return value;
    },
    enumerable: true,
    configurable: true,
  }
  return Reflect.defineProperty(target, propName, desc);
}

describe(
  "A lazy getter can define a property before it is needed", 
  function() {
    describe("on an ordinary object", function() {
      var shadowOuter;
      beforeEach(function() {
        shadowOuter = {};
        callCount = 0;
      });

      afterEach(function() {
        shadowOuter = null;
      });

      it(
        "when the property descriptor is a DataDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, shadowOuter, "getInner")).toBe(true);
          expect(shadowOuter.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(shadowOuter.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );

      it(
        "when the property descriptor is an AccessorDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, shadowOuter, "inner")).toBe(true);
          expect(shadowOuter.inner).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(shadowOuter.inner).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );
    });

    describe("on a Reflect proxy", function() {
      var shadowOuter, proxy, revoke;
      beforeEach(function() {
        shadowOuter = {};
        let parts = Proxy.revocable(shadowOuter, Reflect);
        proxy = parts.proxy;
        revoke = parts.revoke;
        callCount = 0;
      });

      afterEach(function() {
        revoke();
        revoke = null;
        proxy = null;
        shadowOuter = null;
      });

      it(
        "when the property descriptor is a DataDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, proxy, "getInner")).toBe(true);
          expect(proxy.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(proxy.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );

      it(
        "when the property descriptor is an AccessorDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, proxy, "inner")).toBe(true);
          expect(proxy.inner).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(proxy.inner).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );
    });
  }
);
