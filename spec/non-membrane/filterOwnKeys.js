describe(
  "Proxy with filtering on .ownKeys: Defining a blacklisted property with",
  function() {
    "use strict";

    var inner, outer, outerRevoke;
    beforeEach(function() {
      inner = {};
      Object.defineProperties(inner, {
        "foo": {
          "value": 1,
          "enumerable": true,
          "writable": true,
          "configurable": true
        },
      });

      let handler = {
        ownKeys: function(target) {
          let rv = Reflect.ownKeys(target);
          return rv.filter((name) => name != "blacklisted");
        }
      };
      let obj = Proxy.revocable(inner, handler);
      outer = obj.proxy;
      outerRevoke = obj.revoke;
    });

    afterEach(function() {
      outerRevoke();
      outer = null;
      inner = null;
    });

    function applyData(desc) {
      let rv = Reflect.defineProperty(outer, "blacklisted", desc);
      expect(rv).toBe(true);
  
      let keys = Reflect.ownKeys(outer);
      expect(keys.includes("blacklisted")).toBe(false);
  
      desc = Reflect.getOwnPropertyDescriptor(outer, "blacklisted");
      expect(desc).not.toBe(undefined);
      if (desc)
        expect(desc.value).toBe(2);
  
      desc = Reflect.getOwnPropertyDescriptor(inner, "blacklisted");
      expect(desc).not.toBe(undefined);
      if (desc)
        expect(desc.value).toBe(2);
    }

    it("a data descriptor the first time returns true", function() {
      applyData({
        "value": 2,
        "enumerable": true,
        "writable": true,
        "configurable": true
      });
    });
  
    it("a data descriptor the second time returns true", function() {
      Reflect.defineProperty(outer, "blacklisted", {
        "value": 0,
        "enumerable": true,
        "writable": true,
        "configurable": true
      });
  
      applyData({
        "value": 2,
        "enumerable": true,
        "writable": true,
        "configurable": true
      });
    });
  
    it(
      "a non-configurable, non-enumerable data descriptor returns true, but breaks ownKeys",
      function() {
        let rv = Reflect.defineProperty(outer, "blacklisted", {
          "value": 2,
          "enumerable": false,
          "writable": true,
          "configurable": false
        });
        expect(rv).toBe(true);
  
        // This is why you have to be really careful defining proxy handlers!
        expect(function() {
          Reflect.ownKeys(outer);
        }).toThrow();
  
        let desc = Reflect.getOwnPropertyDescriptor(outer, "blacklisted");
        expect(desc).not.toBe(undefined);
        if (desc)
          expect(desc.value).toBe(2);
  
        desc = Reflect.getOwnPropertyDescriptor(inner, "blacklisted");
        expect(desc).not.toBe(undefined);
        if (desc)
          expect(desc.value).toBe(2);
      }
    );
  }
);
