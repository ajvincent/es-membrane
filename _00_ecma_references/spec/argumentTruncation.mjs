// This file cannot be written as TypeScript, because it explicitly checks for invalid arguments.

describe(
  "A proxy handler's traps are only invoked with the required arguments from the proxy",
  function() {
    const handler = {}, unexpected = {};
    {
      const allTraps = {
        "getPrototypeOf": null,
        "setPrototypeOf": null,
        "isExtensible": null,
        "preventExtensions": null,
        "getOwnPropertyDescriptor": null,
        "defineProperty": null,
        "has": null,
        "get": 3,
        "set": 4,
        "deleteProperty": null,
        "ownKeys": null,
        "apply": null,
        "construct": null
      };

      Reflect.ownKeys(allTraps).forEach(function(trap) {
        handler[trap] = function() {
          expect(arguments.length).toBe(allTraps[trap] || Reflect[trap].length);
          return Reflect[trap].apply(Reflect, arguments);
        };
      });
    }

    var obj, p;
    beforeEach(() => {
      obj = {
        method: function() {
          return 1;
        },
        ctor: function() {
          this.value = 2;
        }
      };
      p = Proxy.revocable(obj, handler);
    });

    afterEach(function() {
      p.revoke();
      p = undefined;
      obj = undefined;
    });

    it("for the getPrototypeOf trap", function() {
      Reflect.getPrototypeOf(p.proxy, unexpected);
      Object.getPrototypeOf( p.proxy, unexpected);
    });

    it("for the setPrototypeOf trap", function() {
      Reflect.setPrototypeOf(p.proxy, {}, unexpected);
      Object.setPrototypeOf( p.proxy, {}, unexpected);
    });

    it("for the isExtensible trap", function() {
      Reflect.isExtensible(p.proxy, unexpected);
      Object.isExtensible( p.proxy, unexpected);
    });

    it("for the preventExtensions trap", function() {
      Reflect.preventExtensions(p.proxy, unexpected);
      Object.preventExtensions( p.proxy, unexpected);
    });

    it("for the getOwnPropertyDescriptor trap", function() {
      Reflect.getOwnPropertyDescriptor(p.proxy, "method", unexpected);
      Object.getOwnPropertyDescriptor( p.proxy, "method", unexpected);
    });

    it("for the defineProperty trap", function() {
      const desc = {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true
      };
      Reflect.defineProperty(p.proxy, "extra", desc, unexpected);
      desc.value = 4;
      Object.defineProperty( p.proxy, "extra", desc, unexpected);
    });

    it("for the has trap", function() {
      Reflect.has(p.proxy, "method", unexpected);
      // The "in" operator can't pass extra arguments to the proxy.
    });

    it("for the get trap", function() {
      Reflect.get(p.proxy, "method", p.proxy, unexpected);
      // The dot operator and the [] operator can't pass extra arguments to the proxy.
    });

    it("for the set trap", function() {
      Reflect.set(p.proxy, "extra", 3, p.proxy, unexpected);
      // The assignment operator can't pass extra arguments to the proxy.
    });

    it("for the deleteProperty trap", function() {
      Reflect.deleteProperty(p.proxy, "method", unexpected);
      // The delete operator can't pass extra arguments to the proxy.
    });

    it("for the ownKeys trap", function() {
      Reflect.ownKeys(p.proxy, unexpected);
      Object.keys(p.proxy, unexpected);
    });

    it("for the apply trap", function() {
      Reflect.apply(p.proxy.method, p.proxy, ["foo", "bar"], unexpected);
      // Function.prototype.apply ignores arguments past the second.
    });

    it("for the construct trap", function() {
      Reflect.construct(p.proxy.ctor, ["foo", "bar"], p.proxy.ctor, unexpected);
      // The new operator can't pass extra arguments to the construct trap.
    });
  }
);
