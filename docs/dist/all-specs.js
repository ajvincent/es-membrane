"use strict"

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Jasmine mock logger library works", function() {
  const logger = loggerLib.getLogger("test.jasmine.logger");
  var appender;

  beforeEach(function() {
    appender = new loggerLib.Appender();
    logger.addAppender(appender);
  });

  afterEach(function() {
    logger.removeAppender(appender);
    appender = null;
  });

  it("for one message", function() {
    logger.info("Hello World");
    expect(appender.events.length).toBe(1);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("INFO");
      expect(event.message).toBe("Hello World");
    }
  });

  it("for two messages", function() {
    logger.info("Hello World");
    logger.debug("It's a small world after all");

    expect(appender.events.length).toBe(2);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("INFO");
      expect(event.message).toBe("Hello World");
    }
    if (appender.events.length > 1) {
      let event = appender.events[1];
      expect(event.level).toBe("DEBUG");
      expect(event.message).toBe("It's a small world after all");
    }
  });

});
describe(".defineProperty, for descriptors which state properties", function() {
  var inner, outer, revoke, desc, newPropReturns, defineFirst;
  const handler = {
    defineProperty: function(target, propName, desc) {
      var rv;
      if (defineFirst)
        rv = Reflect.defineProperty(target, propName, desc);
      if (propName == "blacklisted")
        return newPropReturns; // but don't actually define it on target.
      if (!defineFirst)
        rv = Reflect.defineProperty(target, propName, desc);
      return rv;
    }
  };

  beforeEach(function() {
    inner = {};
    desc = {
      "value": 2,
      "writable": true,
      "enumerable": true,
    };

    let obj = Proxy.revocable(inner, handler);
    outer = obj.proxy;
    revoke = obj.revoke;
  });

  afterEach(function() {
    revoke();
    inner = null;
    outer = null;
    revoke = null;
    desc = null;
    newPropReturns = null;
    defineFirst = null;
  });

  function defineTest() {
    return Reflect.defineProperty(outer, "blacklisted", desc);
  }

  describe("are non-configurable, ", function() {
    beforeEach(function() {
      desc.configurable = false;
    });

    it(
      "returning true and working must not throw",
      function() {
        newPropReturns = true;
        defineFirst = true;
        expect(defineTest()).toBe(true);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning true without working must throw",
      function() {
        newPropReturns = true;
        defineFirst = false;
        expect(defineTest).toThrow();
        expect(outer.blacklisted).toBe(undefined);
      }
    );

    it(
      "returning false but working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = true;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning false without working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = false;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(undefined);
      }
    );
  });

  describe("are configurable,", function() {
    beforeEach(function() {
      desc.configurable = true;
    });

    it(
      "returning true and working must not throw",
      function() {
        newPropReturns = true;
        defineFirst = true;
        expect(defineTest()).toBe(true);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning true without working must not throw",
      function() {
        newPropReturns = true;
        defineFirst = false;
        expect(defineTest()).toBe(true);
        expect(outer.blacklisted).toBe(undefined);
      }
    );

    it(
      "returning false but working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = true;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning false without working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = false;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(undefined);
      }
    );
  });
});
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
describe("Proxy with filtering on .ownKeys:  ", function() {
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

  describe("Defining a blacklisted property with", function() {
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
      "a non-configurable data descriptor returns true, but breaks .ownKeys",
      function() {
        let rv = Reflect.defineProperty(outer, "blacklisted", {
          "value": 2,
          "enumerable": true,
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
  });

  it("Deleting a configurable blacklisted property returns true", function() {
    Reflect.defineProperty(inner, "blacklisted", {
      "value": 2,
      "enumerable": true,
      "writable": true,
      "configurable": true
    });

    expect(Reflect.deleteProperty(outer, "blacklisted")).toBe(true);

    let keys = Reflect.ownKeys(outer);
    expect(keys.includes("blacklisted")).toBe(false);

    let desc = Reflect.getOwnPropertyDescriptor(outer, "blacklisted");
    expect(desc).toBe(undefined);

    desc = Reflect.getOwnPropertyDescriptor(inner, "blacklisted");
    expect(desc).toBe(undefined);
  });

  it(
    "Deleting a non-configurable blacklisted property returns false, but breaks .ownKeys",
    function() {
      Reflect.defineProperty(inner, "blacklisted", {
        "value": 2,
        "enumerable": true,
        "writable": true,
        "configurable": false
      });

      expect(Reflect.deleteProperty(outer, "blacklisted")).toBe(false);

      // Another example why you have to be careful defining proxy handlers.
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

  it("Deleting a non-existent blacklisted property returns true", function() {
    expect(Reflect.deleteProperty(outer, "blacklisted")).toBe(true);
  });
});
describe("Object.freeze() on ordinary objects", function() {
  "use strict";
  it("works as expected with primitive properties", function() {
    var frozen = Object.freeze({x: 3});
    expect(Reflect.isExtensible(frozen)).toBe(false);

    expect(function() {
      frozen.y = 5;
    }).toThrow();

    {
      let desc = Reflect.getOwnPropertyDescriptor(frozen, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(false);
    }

    expect(function() {
      frozen.x = 4;
    }).toThrow();

    expect(Reflect.deleteProperty(frozen, "x")).toBe(false);
    expect(Reflect.deleteProperty(frozen, "doesNotExist")).toBe(true);

    expect(frozen.x).toBe(3);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isSealed(frozen)).toBe(true);
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.freeze(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);    
  });
});

describe("Object.freeze() on objects with proxies directly reflecting them", function() {
  "use strict";
  it("works as expected with primitive properties", function() {
    var frozen = Object.freeze({x: 3});
    var {proxy, revoke} = Proxy.revocable(frozen, {});
    frozen = proxy;
    expect(Reflect.isExtensible(frozen)).toBe(false);

    expect(function() {
      frozen.y = 5;
    }).toThrow();

    {
      let desc = Reflect.getOwnPropertyDescriptor(frozen, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(false);
    }

    expect(function() {
      frozen.x = 4;
    }).toThrow();

    expect(Reflect.deleteProperty(frozen, "x")).toBe(false);
    expect(Reflect.deleteProperty(frozen, "doesNotExist")).toBe(true);

    expect(frozen.x).toBe(3);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isSealed(frozen)).toBe(true);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.freeze(b);

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});

describe("Object.freeze() on proxies to objects", function() {
  "use strict";
  it("works as expected with primitive properties", function() {
    var {proxy, revoke} = Proxy.revocable({x: 3}, {});
    var frozen = Object.freeze(proxy);
    expect(Reflect.isExtensible(frozen)).toBe(false);

    expect(function() {
      frozen.y = 5;
    }).toThrow();

    {
      let desc = Reflect.getOwnPropertyDescriptor(frozen, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(false);
    }

    expect(function() {
      frozen.x = 4;
    }).toThrow();

    expect(Reflect.deleteProperty(frozen, "x")).toBe(false);
    expect(Reflect.deleteProperty(frozen, "doesNotExist")).toBe(true);

    expect(frozen.x).toBe(3);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isSealed(frozen)).toBe(true);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.freeze(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});

describe("Object.seal() on ordinary objects", function() {
  "use strict";
  it("works as expected with primitive properties", function() {
    var sealed = Object.seal({x: 3});
    expect(Reflect.isExtensible(sealed)).toBe(false);
    expect(function() {
      sealed.y = 5;
    }).toThrow();
    expect(sealed.y).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(sealed, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(true);
    }
    sealed.x = 4;
    expect(sealed.x).toBe(4);
    expect(Object.isFrozen(sealed)).toBe(false);
    expect(Object.isSealed(sealed)).toBe(true);

    expect(Reflect.deleteProperty(sealed, "x")).toBe(false);
    expect(Reflect.deleteProperty(sealed, "doesNotExist")).toBe(true);

    expect(sealed.x).toBe(4);
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.seal(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);    
  });
});

describe("Object.seal() on objects with proxies directly reflecting them", function() {
  "use strict";
  it("works as expected with primitive properties", function() {
    var sealed = Object.seal({x: 3});
    var {proxy, revoke} = Proxy.revocable(sealed, {});
    sealed = proxy;

    expect(Reflect.isExtensible(sealed)).toBe(false);
    expect(function() {
      sealed.y = 5;
    }).toThrow();
    expect(sealed.y).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(sealed, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(true);
    }
    sealed.x = 4;
    expect(sealed.x).toBe(4);
    expect(Object.isFrozen(sealed)).toBe(false);
    expect(Object.isSealed(sealed)).toBe(true);

    expect(Reflect.deleteProperty(sealed, "x")).toBe(false);
    expect(Reflect.deleteProperty(sealed, "doesNotExist")).toBe(true);

    expect(sealed.x).toBe(4);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.seal(b);

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});

describe("Object.seal() on proxies of objects", function() {
  "use strict";
  it("works as expected with primitive properties", function() {
    var {proxy, revoke} = Proxy.revocable({x: 3}, {});
    var sealed = Object.seal(proxy);
    sealed = proxy;

    expect(Reflect.isExtensible(sealed)).toBe(false);
    expect(function() {
      sealed.y = 5;
    }).toThrow();
    expect(sealed.y).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(sealed, "x");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(true);
    }
    sealed.x = 4;
    expect(sealed.x).toBe(4);
    expect(Object.isFrozen(sealed)).toBe(false);
    expect(Object.isSealed(sealed)).toBe(true);

    expect(Reflect.deleteProperty(sealed, "x")).toBe(false);
    expect(Reflect.deleteProperty(sealed, "doesNotExist")).toBe(true);

    expect(sealed.x).toBe(4);

    revoke();
  });

  it("disallows calling setPrototypeOf() unless it's the existing prototype", function() {
    function A() {}
    A.prototype.name = "letterA";

    function B() {}
    B.prototype = new A();
    B.prototype.name = "letterB";

    function C() {}

    let b = new B();

    var {proxy, revoke} = Proxy.revocable(b, {});
    b = proxy;

    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);
    Object.seal(b);

    expect(Reflect.setPrototypeOf(b, A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    expect(Reflect.setPrototypeOf(b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(b)).toBe(B.prototype);

    revoke();
  });
});
it(
  "A membrane-like proxy set always returns the same object for a prototype lookup",
  function() {
    "use strict";

    const ShadowKeyMap = new WeakMap();

    /**
     * Define a shadow target, so we can manipulate the proxy independently of the
     * original target.
     *
     * @argument value {Object} The original target.
     *
     * @returns {Object} A shadow target to minimally emulate the real one.
     * @private
     */
    function makeShadowTarget(value) {
      "use strict";
      var rv;
      if (Array.isArray(value))
        rv = [];
      else if (typeof value == "object")
        rv = {};
      else if (typeof value == "function") {
        rv = function() {};
        /* ES7 specification says that functions in strict mode do not have their
         * own "arguments" or "length" properties naturally.  But in non-strict
         * code, V8 adds those properties.  (Mozilla adds them for both strict code
         * and non-strict code, which technically is a spec violation.)  So to make
         * the membrane code work correctly with shadow targets, we start with the
         * minimalist case (strict mode explicitly on), and add missing properties.
         */
        let keys = Reflect.ownKeys(value);
        keys.forEach(function(key) {
          if (Reflect.getOwnPropertyDescriptor(rv))
            return;
          let desc = Reflect.getOwnPropertyDescriptor(value, key);
          Reflect.defineProperty(rv, key, desc);
        });
      }
      else
        throw new Error("Unknown value for makeShadowTarget");
      ShadowKeyMap.set(rv, value);
      return rv;
    }

    function getRealTarget(target) {
      return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
    }

    function wetA() {}

    // this doesn't really matter - it's just a way of identifying the prototype 
    Reflect.defineProperty(wetA.prototype, "constructorName", {
      value: "wetA",
      writable: false,
      enumerable: true,
      configurable: false
    });

    const wet_a = new wetA();
    const wet_b = new wetA();

    expect(Reflect.getPrototypeOf(wet_a)).toBe(wetA.prototype);
    expect(Reflect.getPrototypeOf(wet_b)).toBe(wetA.prototype);

    const handler = {
      membrane: {
        dryMap: new WeakMap(),
        prototypeMap: new WeakMap()
      },

      wrapPrototype: function(proto)
      {
        if (!this.membrane.prototypeMap.has(proto))
        {
          let proxy = new Proxy(Reflect, proto);
          this.membrane.prototypeMap.set(proto, proxy);
        }
        return this.membrane.prototypeMap.get(proto);
      },

      getOwnPropertyDescriptor: function(shadow, propertyName)
      {
        const target = getRealTarget(shadow);
        let rv = Reflect.getOwnPropertyDescriptor(target, propertyName);
        if (rv)
        {
          if (Reflect.ownKeys(rv).includes("value"))
            rv.value = this.getProxy(rv.value);
          else
            throw new Error("not supported for this test");

          if (propertyName === "prototype")
            rv.value = this.wrapPrototype(rv.value);

          let oldDesc = Reflect.getOwnPropertyDescriptor(shadow, propertyName);
          if (!oldDesc.configurable)
            rv.configurable = false;

          Reflect.defineProperty(shadow, propertyName, rv);
        }

        return rv;
      },

      get: function(shadow, propertyName)
      {
        const target = getRealTarget(shadow);
        let rv = this.getProxy(Reflect.get(target, propertyName));
        if (propertyName === "prototype")
          rv = this.wrapPrototype(rv);
        if (shadow[propertyName] !== rv)
          shadow[propertyName] = rv;
        return rv;
      },

      getPrototypeOf: function(shadow)
      {
        const target = getRealTarget(shadow);
        const proto = Reflect.getPrototypeOf(target);
        const rv = this.wrapPrototype(this.getProxy(proto));
        Reflect.setPrototypeOf(shadow, rv);
        return rv;
      },

      getProxy: function(wetValue) {
        {
          const t = typeof wetValue;
          if ((t !== "object") && (t !== "function"))
            return wetValue;
        }

        if (!this.membrane.dryMap.has(wetValue))
        {
          const shadow = makeShadowTarget(wetValue);
          const p = new Proxy(shadow, this);
          this.membrane.dryMap.set(wetValue, p);
        }
        return this.membrane.dryMap.get(wetValue);
      }
    };

    const dryA  = handler.getProxy(wetA);
    const dry_a = handler.getProxy(wet_a);
    const dry_b = handler.getProxy(wet_b);

    const dryProto = dryA.prototype;
    expect(dryProto).not.toBe(wetA.prototype);

    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.seal(dry_a);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.seal(dryA);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.seal(dry_b);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.freeze(dry_a);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.freeze(dryA);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.freeze(dry_b);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);
  }
);
describe(
  "A lazy getter can define a property before it is needed", 
  function() {
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
      };
      return Reflect.defineProperty(target, propName, desc);
    }

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

    it(
      "on a set of cyclic references objects about to be sealed",
      function() {
        /* This is a difficult but possible problem:  in the Membrane
         * implementation, proxies are created only when needed, via the
         * ProxyNotify API.  If a "proxy listener" wants to seal many proxies,
         * and the underlying target indirectly refers to itself through a chain
         * of property names (a.b.c === a, for example), we can get stuck in a
         * situation where we're called to freeze a proxy for one proxy under
         * creation already.  The result is an identity chicken-and-egg paradox:
         * we can't seal any proxy under creation until all the properties are
         * known to the ObjectGraphHandler, and we can't look up all the
         * properties if a property lookup leads to a proxy creation.
         *
         * If one of the descriptors in the cyclic property reference chain is
         * an accessor descriptor instead of a data descriptor, we're fine.
         *
         * When all of them are data descriptors, that's when we run into
         * trouble, and we must break the chain somewhere.  This requires the
         * problem be broken down into three distinct parts:
         * (1) the proxy handler (where I recursively create and freeze proxies)
         * (2) the lazy getter definition
         * (3) a data structure to track targets of proxies under construction
         */

        // start infrastructure
        //{
        const masterMap = new WeakMap();

        const pHandler = {
          preventExtensions: function(shadowTarget) {
            // We have to define the properties on the shadow target first.
            const target = masterMap.get(shadowTarget).target;
            const keys = Reflect.ownKeys(target);
            keys.forEach(function(propName) {
              defineCyclicLazyGetter(
                target, shadowTarget, propName
              );

              // Trigger the lazy getter so that the property can be sealed.
              Reflect.get(shadowTarget, propName);
            }, this);

            return Reflect.preventExtensions(shadowTarget);
          }
        };

        function defineCyclicLazyGetter(realTarget, shadowTarget, propName) {
          var lockState = "none", lockedValue;
          function setLockedValue(value) {
            lockedValue = value;
            lockState = "finalized";
          }

          const lazyDesc = {
            get: function() {
              if (lockState === "finalized")
                return lockedValue;
              if (lockState === "transient")
                return masterMap.get(shadowTarget).proxy;

              /* When the shadow target is sealed, desc.configurable is not
                 updated.  But the shadow target's properties all get the
                 [[Configurable]] flag removed.  So an attempt to delete the
                 property will fail...
               */
              let current = Reflect.getOwnPropertyDescriptor(
                shadowTarget, propName
              );
              if (!current.configurable)
                throw new Error("lazy getter descriptor is not configurable");

              let sourceDesc = Reflect.getOwnPropertyDescriptor(realTarget, propName);

              /* In this test, we're assuming isDataDescriptor(sourceDesc),
                 since that's the harder one for a cyclic object reference.
                 The real membrane code can easily wrap getters and setters.
              */
              if (typeof sourceDesc.value === "object") {
                if (buildingProxiesFor.has(sourceDesc.value)) {
                  buildingProxiesFor.get(sourceDesc.value).push(setLockedValue);
                  sourceDesc = lazyDesc;
                  delete lazyDesc.set;
                  lockState = "transient";
                }
                else if (masterMap.has(sourceDesc.value))
                  sourceDesc.value = masterMap.get(sourceDesc.value).proxy;
                else
                  sourceDesc.value = buildSealedProxy(sourceDesc.value);
              }

              setLockedValue = undefined;

              Reflect.deleteProperty(shadowTarget, propName);
              Reflect.defineProperty(shadowTarget, propName, sourceDesc);
              return sourceDesc.value;
            },

            set: function(newValue) {
              /* When the shadow target is sealed, desc.configurable is not
                 updated.  But the shadow target's properties all get the
                 [[Configurable]] flag removed.  So an attempt to delete the
                 property will fail...
               */
              let current = Reflect.getOwnPropertyDescriptor(
                shadowTarget, propName
              );
              if (!current.configurable)
                throw new Error("lazy getter descriptor is not configurable");

              let sourceDesc = Reflect.getOwnPropertyDescriptor(realTarget, propName);
              if (typeof newValue !== "object")
                sourceDesc.value = newValue;
              else if (masterMap.has(newValue))
                sourceDesc.value = masterMap.get(value).proxy;
              else
                sourceDesc.value = buildSealedProxy(newValue);
              Reflect.deleteProperty(shadowTarget, propName);
              Reflect.defineProperty(shadowTarget, propName, sourceDesc);
              setLockedValue = undefined;
              return sourceDesc.value;
            },

            enumerable:
              Reflect.getOwnPropertyDescriptor(realTarget, propName).enumerable,

            configurable: true
          };

          Reflect.defineProperty(shadowTarget, propName, lazyDesc);
        }

        const buildingProxiesFor = new WeakMap();

        const revocables = [];
        function buildSealedProxy(obj) {
          const callbacks = [/* callbacks or promises */];
          buildingProxiesFor.set(obj, callbacks);
          try {
            let pMap = {
              target: obj,
              shadow: {}
            };
            let parts = Proxy.revocable(pMap.shadow, pHandler);
            Object.assign(pMap, parts);

            masterMap.set(pMap.target, pMap);
            masterMap.set(pMap.shadow, pMap);
            masterMap.set(pMap.proxy,  pMap);
            revocables.push(pMap.revoke);

            // the real challenge
            Object.seal(pMap.proxy);

            try {
              callbacks.forEach(function(c) { c(pMap.proxy); });
            }
            catch (e) {
              // do nothing
            }
            return pMap.proxy;
          }
          finally {
            buildingProxiesFor.delete(obj);
          }
        }
        //}
        // end infrastructure

        // set up the raw objects
        const a = { objName: "a" },
              b = { objName: "b" },
              c = { objName: "c" };

        a.child = b;
        b.child = c;
        c.grandParent = a;

        const A = buildSealedProxy(a);
        const B = (masterMap.has(b) ? masterMap.get(b).proxy : undefined),
              C = (masterMap.has(c) ? masterMap.get(c).proxy : undefined);

        expect(A.child.child.grandParent === A).toBe(true);
        expect(Object.isSealed(A)).toBe(true);
        expect(typeof B).not.toBe("undefined");
        if (B) {
          expect(B.child.grandParent.child === B).toBe(true);
          expect(Object.isSealed(B)).toBe(true);
        }
        expect(typeof C).not.toBe("undefined");
        if (C) {
          expect(C.grandParent.child.child === C).toBe(true);
          expect(Object.isSealed(C)).toBe(true);
        }
        revocables.forEach(function(r) { r(); });
      }
    );
  }
);
describe(
  "A proxy handler's traps are only invoked with the required arguments from the proxy",
  function() {
    "use strict";
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
          expect(arguments[arguments.length - 1]).not.toBe(unexpected);
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
describe("Receivers in Reflect", function() {
  var alpha, beta, ALPHA, BETA;
  beforeEach(function() {
    ALPHA = {
      value: "A"
    };
    BETA  = {
      value: "B"
    };

    alpha = {
      get upper() {
        return this._upper;
      },
      set upper(val) {
        this._upper = val;
      },
      _upper: ALPHA,
      value: "a",
    };

    beta = {
      _upper: BETA,
      value: "b"
    };
  });

  afterEach(function() {
    alpha = null;
    beta = null;
    ALPHA = null;
    BETA = null;
  });

  it("are where property lookups happen", function() {
    expect(Reflect.get(alpha, "upper", beta)).toBe(BETA);
  });

  it("are where property setter invocations happen", function() {
    const X = {};
    Reflect.set(alpha, "upper", X, beta);
    expect(beta._upper).toBe(X);
    expect(alpha._upper).toBe(ALPHA);
  });
});
"use strict";
it("Reflect Proxy objects correctly implement instanceof", function() {
  function a() {}
  const {proxy, revoke} = Proxy.revocable(a, Reflect);
  const A = proxy;

  const b = new a();
  expect(b instanceof a).toBe(true);
  expect(b instanceof A).toBe(true);

  const B = new A();
  expect(B instanceof a).toBe(true);
  expect(B instanceof A).toBe(true);
});
/*
Suppose you have the following:

  const alpha = {}, beta = {};
  alpha.next = beta;
  beta.next = alpha;

  const Alpha = getProxy(alpha);

  const map = new Map();

  getProxy(original):
  I. looks for an existing proxy in map and if it doesn't find it:
    A. creates a proxy
    B. executes a listener which may replace the proxy:
      1. defines all the keys of the proxy as proxies paralleling original's keys
         by calling getProxy
      2. seals the proxy
    C. calls map.set(original, proxy);
  II. returns map.get(original);

In the simple recursive case, this is doomed to infinite recursion:
getProxy(alpha.next.next) doesn't find anything in the map, even after
getProxy(alpha) and getProxy(alpha.next) have started (but not finished).

The first solution I came up with used "lazy getters".  A lazy getter for an
object's property is an accessor descriptor which tries to replace itself with a
data descriptor as soon as possible.  If you don't know what accessor
descriptors and data descriptors are, read this:

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

Unfortunately, there's a catch.  Given the following pseudo-code:
  const foo = {};
  Object.defineProperty(foo, "propertyName", lazyGetter({value: 3, writable: true}));

If I call:
  Reflect.defineProperty(foo, "propertyName", {configurable: false});

or more generically:
  Object.seal(foo);

then the lazy getter for foo.propertyName is locked in.  The ECMAScript
specification explicitly prohibits the lazy getter from being replaced with a
direct data descriptor of the form {value: 3, writable: true}.

Under the algorithm I listed above for getProxy(), I can define lazy getters
for Alpha and Alpha.next... but because they're all on the stack when I first
call getProxy(alpha), and they're all sealed before that call exits, at least
one lazy getter is locked in, and cannot be replaced.

So yes, Alpha.next.next === Alpha, but we have an accessor descriptor (a lazy
getter) forever when we wanted only data descriptors.

The second, and more reliable solution, involves a priority queue:
https://en.wikipedia.org/wiki/Priority_queue

For ECMAScript, this enters a land between synchronous functions and
asynchronous functions / Promise / await and async keywords.  If you don't
know what Promises are or what the await and async keywords are, read these:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await

A priority queue, in JavaScript, is somewhat simpler.  Most examples define
them as simple values ordered by priority flags.  In my context, I replace the
values with callback functions, which I consider much more useful.  The priority
queue I use has an array of priority names, each of which corresponds to an
array of callback functions.  Each call to the queue's next() method executes
the next highest priority callback, until there are none to execute.  If there
was a callback, queue.next() returns true.  Otherwise, it returns false.

The key to making a priority queue work here is that the call to create a
proxy cannot return a value until all of the callback functions that were
scheduled have executed.  The getProxy code inserts callbacks into the queue
with different priorities.  In the example above, getProxy directly defines
properties on the proxy, and then (in the listener) schedules a call to
Object.seal to run later - but strictly speaking not asynchronously, simply at a
lower priority.

This means that recursive calls to getProxy() insert higher-priority operations
(defining that proxy's properties as data descriptor) before lower-priority
operations (sealing a proxy and locking the data descriptors).  Most
importantly, all operations complete before any getProxy() call exits normally.

By using this approach, I no longer need lazy getters:  I can use direct data
descriptors, as the Proxy interface within the ECMAScript specification intends.

There are details which I don't cover here:
  * Exception handling
  * Return values

However, those are details to work out separately, and distract from this 
example.
*/

describe("Sealed cyclic references: ", function() {
  const map = new Map();

  const alpha = {}, beta = {};
  alpha.next = beta;
  beta.next = alpha;
  var refCount;

  function isAccessorDescriptor(desc) {
    if (typeof desc === "undefined") {
      return false;
    }
    if (!("get" in desc) && !("set" in desc))
      return false;
    return true;
  }

  beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    map.clear();
    refCount = 0;
  });

  it(
    "A very simple recursive implementation hits an infinite stack error",
    function() {
      function buildReferenceAndSeal(obj) {
        refCount++;
        if (refCount > 10)
          throw "Infinite recursion";

        if (!map.has(obj)) {
          const rv = {};

          // Simulating an observer
          {
            const desc = {
              value: buildReferenceAndSeal(obj.next),
              writable: false,
              enumerable: true,
              configurable: false
            };
            Reflect.defineProperty(rv, "next", desc);
            Object.seal(rv);
          }

          map.set(obj, rv);
        }

        return map.get(obj);
      }

      expect(function() {
        buildReferenceAndSeal(alpha);
      }).toThrow("Infinite recursion");
    }
  );

  it(
    "A lazy-getter recursive implementation can work, but leaves one lazy getter behind",
    function() {
      const inConstruction = new Map();
      function defineLazyGetter(source, target, propName) {
        let lockState = "none", lockedValue;
        function setLockedValue(value) {
          // This lockState check should be treated as an assertion.
          if (lockState !== "transient")
            throw new Error("setLockedValue should be callable exactly once!");
          lockedValue = value;
          lockState = "finalized";
        }

        const lazyDesc = {
          get: function() {
            if (lockState === "finalized")
              return lockedValue;
            if (lockState === "transient")
              return map.get(source[propName]);

            let current = Reflect.getOwnPropertyDescriptor(target, propName);
            if (current && !current.configurable)
              throw new Error("lazy getter descriptor is not configurable -- this is fatal");

            // sourceDesc is the descriptor we really want
            let sourceDesc = Reflect.getOwnPropertyDescriptor(source, propName);

            let hasValue = "value" in sourceDesc,
                value = sourceDesc.value;

            // This is necessary to force desc.value to be wrapped.
            if (hasValue) {
              sourceDesc.value = buildReferenceAndSeal(value);
            }

            if (hasValue && inConstruction.has(value)) {
              /* Ah, nuts.  Somewhere in our stack trace, the unwrapped value has
               * a proxy in this object graph under construction.  That's not
               * supposed to happen very often, but can happen during a recursive
               * Object.seal() or Object.freeze() call.  What that means is that
               * we may not be able to replace the lazy getter (which is an
               * accessor descriptor) with a data descriptor when external code
               * looks up the property on the shadow target.
               */

              inConstruction.get(value).push(setLockedValue);
              sourceDesc = lazyDesc;
              delete sourceDesc.set;
              lockState = "transient";
            }

            Reflect.deleteProperty(target, propName);
            Reflect.defineProperty(target, propName, sourceDesc);
  
            // Finally, run the actual getter.
            if (sourceDesc === undefined)
              return undefined;
            if ("get" in sourceDesc)
              return sourceDesc.get.apply(this);
            if ("value" in sourceDesc)
              return sourceDesc.value;
            return undefined;
          },

          set: function(value) {
            let current = Reflect.getOwnPropertyDescriptor(target, propName);
            if (!current.configurable)
              throw new Error("lazy getter descriptor is not configurable -- this is fatal");

            const desc = {
              value: current.value,
              writable: true,
              enumerable: current.enumerable,
              configurable: true
            };

            if (!Reflect.deleteProperty(target, propName))
              throw new Error("deleteProperty should've worked");
            if (!Reflect.defineProperty(target, propName, desc))
              throw new Error("defineProperty should've worked");

            return value;
          },

          enumerable: true,
          configurable: true
        };

        {
          let current = Reflect.getOwnPropertyDescriptor(source, propName);
          if (current && !current.enumerable)
            lazyDesc.enumerable = false;
        }

        Reflect.defineProperty(target, propName, lazyDesc);
      }

      function buildReferenceAndSeal(obj) {
        refCount++;
        if (refCount >= 10)
          throw new Error("runaway");

        if (!map.has(obj))
        {
          const rv = {};
          map.set(obj, rv);

          const callbacks = [];
          inConstruction.set(obj, callbacks);

          // Simulating an observer
          {
            defineLazyGetter(obj, rv, "next");
            // We want to trigger the lazy getter so that the property can be sealed.
            void(Reflect.get(rv, "next"));
            Object.seal(rv);
            map.set(obj, rv);
          }

          callbacks.forEach(function(c) {
            try {
              c(rv);
            }
            catch (e) {
              // do nothing
            }
          });
    
          inConstruction.delete(obj);
        }

        return map.get(obj);
      }

      const Alpha = buildReferenceAndSeal(alpha);
      expect(Alpha.next.next).toBe(Alpha);
      expect(Reflect.isExtensible(Alpha)).toBe(false);
      expect(Reflect.isExtensible(Alpha.next)).toBe(false);

      let accessorCount = 0;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha, "next")
          ))
        accessorCount++;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha.next, "next")
          ))
        accessorCount++;

      expect(accessorCount).toBe(1);
    }
  );

  it(
    "A priority queue can resolve all the data descriptors",
    function() {
      const queue = {
        levels: ["firstCall", "seal", "final"],
        levelMap: new Map()
      };
      
      queue.append = function(level, callback)
      {
        if (!this.levels.includes(level))
          throw new Error("Unknown level");
        if (typeof callback !== "function")
          throw new Error("callback must be a function");
      
        this.levelMap.get(level).push(callback);
      };
      
      queue.next = function()
      {
        const arrays = Array.from(this.levelMap.values());
        const firstArray = arrays.find((array) => array.length > 0);
        if (!firstArray)
          return false;
      
        try
        {
          firstArray.shift()();
        }
        catch (e)
        {
          arrays.forEach((array) => array.length = 0);
          throw e;
        }
        return true;
      };

      {
        Object.freeze(queue.levels);
        queue.levels.forEach((l) => queue.levelMap.set(l, []));
        Object.freeze(queue.levelMap);
        Object.freeze(queue);
      }

      function buildReferenceAndSeal(obj, outparam) {
        refCount++;
        if (refCount > 10)
          throw "Infinite recursion";

        // executing immediately
        if (!map.has(obj)) {
          const rv = {};
          map.set(obj, rv);

          rv.next = pseudoProxy(obj.next);
  
          // Simulating an observer
          {
            if ([alpha, beta].includes(obj)) {
              if (!Reflect.isExtensible(rv))
                throw new Error("rv is not extensible");
              queue.append("seal", function() {
                Object.seal(rv);
              });
            }
          }
        }

        // executing deferred
        queue.append("final", function() {
          const rv = map.get(obj);
          outparam.value = rv;
        });
      }

      function pseudoProxy(obj) {
        const outparam = {
          value: undefined
        };
        queue.append("firstCall", function() {
          buildReferenceAndSeal(obj, outparam);
        });

        while (queue.next()) {
          // do nothing
        }

        return outparam.value;
      }

      const Alpha = pseudoProxy(alpha);
      expect(Alpha.next.next).toBe(Alpha);
      expect(Reflect.isExtensible(Alpha)).toBe(false);
      expect(Reflect.isExtensible(Alpha.next)).toBe(false);

      let accessorCount = 0;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha, "next")
          ))
        accessorCount++;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha.next, "next")
          ))
        accessorCount++;

      expect(accessorCount).toBe(0);
    }
  );
});

describe("Promises", function() {
  var resolve, reject, builtPromise;
  beforeEach(function() {
    builtPromise = new Promise(function(res, rej) {
      resolve = res;
      reject  = rej;
    });
  });
  afterEach(function() {
    builtPromise = null;
    resolve      = null;
    reject       = null;
  });

  it(
    "may be resolved from Proxy.getOwnPropertyDescriptor synchronously",
    function(done) {
      const handler = {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const rv = {
            value: builtPromise,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, rv);
          return rv;
        }
      };

      let proxy = new Proxy({}, handler);
    
      let promise = Reflect.getOwnPropertyDescriptor(proxy, "promise").value;
      promise = promise.then(
        (val) => { expect(val).toBe(true); },
        () => { fail("unexpected promise rejection"); }
      );
      promise = promise.then(done, done);
      resolve(true);
    }
  );

  it(
    "may be resolved from Proxy.get synchronously",
    function(done) {
      const handler = {
        get: function(/* target, propertyName, receiver*/) {
          return builtPromise;
        }
      };

      let proxy = new Proxy({}, handler);
    
      let promise = proxy.promise;
      promise = promise.then(
        (val) => { expect(val).toBe(true); },
        () => { fail("unexpected promise rejection"); }
      );
      promise = promise.then(done, done);
      resolve(true);
    }
  );

  it(
    "may be rejected from Proxy.getOwnPropertyDescriptor synchronously",
    function(done) {
      const handler = {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const rv = {
            value: builtPromise,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, rv);
          return rv;
        }
      };

      let proxy = new Proxy({}, handler);
    
      let promise = Reflect.getOwnPropertyDescriptor(proxy, "promise").value;
      promise = promise.then(
        () => { fail("unexpected promise resolved"); },
        (val) => { expect(val).toBe(true); }
      );
      promise = promise.then(done, done);
      reject(true);
    }
  );

  it(
    "may be rejected from Proxy.get synchronously",
    function(done) {
      const handler = {
        get: function(/*target, propertyName, receiver*/) {
          return builtPromise;
        }
      };

      let proxy = new Proxy({}, handler);

      let promise = proxy.promise;
      promise = promise.then(
        () => { fail("unexpected promise resolved"); },
        (val) => { expect(val).toBe(true); }
      );
      promise = promise.then(done, done);
      reject(true);
    }
  );

  /* XXX ajvincent Disabled for Node engine not supporting async/await keywords in version 6.5.0
  it(
    "may be resolved from Proxy.getOwnPropertyDescriptor asynchronously",
    async function() {
      const handler = {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const rv = {
            value: builtPromise,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, rv);
          return rv;
        }
      };

      let proxy = new Proxy({}, handler);
      let promise = Reflect.getOwnPropertyDescriptor(proxy, "promise").value;
      resolve(true);
      let value = await promise;
      expect(value).toBe(true);    
    }
  );

  it(
    "may be resolved from Proxy.get asynchronously",
    async function() {
      const handler = {
        get: function() {
          return builtPromise;
        }
      };

      let proxy = new Proxy({}, handler);
      let promise = proxy.promise;
      resolve(true);
      expect(await promise).toBe(true);
    }
  );
  */
});
describe("Generators", function() {
  let generator;
  function reset() {
    generator = (function* () {
      let count = 0;
      while (true)
      {
        yield { count };
        count++;
      }
    })();
  }
  beforeEach(reset);

  it(
    "returned through getOwnPropertyDescriptor work",
    function() {
      let proxy = new Proxy({}, {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const desc = {
            value: generator,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, desc);
          return desc;
        }
      });

      let local = Reflect.getOwnPropertyDescriptor(proxy, "foo").value;
      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      let result = local.return("x");
      expect(result.value).toBe("x");
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);

      reset();
      local = Reflect.getOwnPropertyDescriptor(proxy, "bar").value;

      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      expect(function() {
        result = local.throw("foo");
      }).toThrow("foo");
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    }
  );

  it(
    "returned through get work",
    function() {
      let proxy = new Proxy({}, {
        get: function(target, propertyName) {
          const desc = {
            value: generator,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, desc);
          return desc.value;
        }
      });

      let local = proxy.foo;
      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      let result = local.return("x");
      expect(result.value).toBe("x");
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);

      reset();
      local = proxy.bar;

      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      expect(function() {
        result = local.throw("foo");
      }).toThrow("foo");
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    }
  );
});
it(
  "Iterable objects work when returned through a Reflect proxy",
  function() {
    let base, proxy, revoke, obj;
    base = {count: 0};
    base[Symbol.iterator] = function() {
      return {
        next: function() {
          let rv = {
            value: this.count,
            done: this.count > 3
          };
          this.count++;
          return rv;
        },
        get count() {
          return base.count;
        },
        set count(val) {
          base.count = val;
          return true;
        }
      };
    };

    expect(Array.from(base)).toEqual([0, 1, 2, 3]);
    base.count = 0;

    try {
      obj = Proxy.revocable(base, Reflect);
      proxy  = obj.proxy;
      revoke = obj.revoke;
      let items = Array.from(proxy);
      expect(items).toEqual([0, 1, 2, 3]);
    }
    finally {
      revoke();
    }
  }
);

it("Array.prototype.splice generates reasonable results with a proxy", function() {
  const x = ["alpha", "beta", "gamma", "pi", "chi"];

  const handler = {};
  let events = [];
  Reflect.ownKeys(Reflect).forEach(function(trap) {
    handler[trap] = function() {
      let msg = trap + " called";
      if (typeof arguments[1] == "string")
        msg += ` for property "${arguments[1]}"`;
      if (trap === "set")
        msg += ` and value "${arguments[2]}"`;
      events.push("enter: " + msg);
      const rv = Reflect[trap].apply(Reflect, arguments);
      events.push("exit:  " + msg + ` and return value ${JSON.stringify(rv)}`);
      return rv;
    };
  });

  const X = new Proxy(x, handler);
  X.splice(1, 3, "delta", "epsilon");
  expect(x.length).toBe(4);

  /* XXX ajvincent Google Chrome has calls to isExtensible, while Mozilla Firefox
   * does not.  I don't know which one is correct.
   */
  events = events.filter((str) => !/isExtensible/.test(str));

  expect(events).toEqual([
    `enter: get called for property "splice"`,
    `exit:  get called for property "splice" and return value undefined`,
    `enter: get called for property "length"`,
    `exit:  get called for property "length" and return value 5`,
    `enter: get called for property "constructor"`,
    `exit:  get called for property "constructor" and return value undefined`,
    `enter: has called for property "1"`,
    `exit:  has called for property "1" and return value true`,
    `enter: get called for property "1"`,
    `exit:  get called for property "1" and return value "beta"`,
    `enter: has called for property "2"`,
    `exit:  has called for property "2" and return value true`,
    `enter: get called for property "2"`,
    `exit:  get called for property "2" and return value "gamma"`,
    `enter: has called for property "3"`,
    `exit:  has called for property "3" and return value true`,
    `enter: get called for property "3"`,
    `exit:  get called for property "3" and return value "pi"`,
    `enter: has called for property "4"`,
    `exit:  has called for property "4" and return value true`,
    `enter: get called for property "4"`,
    `exit:  get called for property "4" and return value "chi"`,
    `enter: set called for property "3" and value "chi"`,
    `enter: getOwnPropertyDescriptor called for property "3"`,
    `exit:  getOwnPropertyDescriptor called for property "3" and return value {"value":"pi","writable":true,"enumerable":true,"configurable":true}`,
    `enter: defineProperty called for property "3"`,
    `exit:  defineProperty called for property "3" and return value true`,
    `exit:  set called for property "3" and value "chi" and return value true`,
    `enter: deleteProperty called for property "4"`,
    `exit:  deleteProperty called for property "4" and return value true`,
    `enter: set called for property "1" and value "delta"`,
    `enter: getOwnPropertyDescriptor called for property "1"`,
    `exit:  getOwnPropertyDescriptor called for property "1" and return value {"value":"beta","writable":true,"enumerable":true,"configurable":true}`,
    `enter: defineProperty called for property "1"`,
    `exit:  defineProperty called for property "1" and return value true`,
    `exit:  set called for property "1" and value "delta" and return value true`,
    `enter: set called for property "2" and value "epsilon"`,
    `enter: getOwnPropertyDescriptor called for property "2"`,
    `exit:  getOwnPropertyDescriptor called for property "2" and return value {"value":"gamma","writable":true,"enumerable":true,"configurable":true}`,
    `enter: defineProperty called for property "2"`,
    `exit:  defineProperty called for property "2" and return value true`,
    `exit:  set called for property "2" and value "epsilon" and return value true`,
    `enter: set called for property "length" and value "4"`,
    `enter: getOwnPropertyDescriptor called for property "length"`,
    `exit:  getOwnPropertyDescriptor called for property "length" and return value {"value":5,"writable":true,"enumerable":false,"configurable":false}`,
    `enter: defineProperty called for property "length"`,
    `exit:  defineProperty called for property "length" and return value true`,
    `exit:  set called for property "length" and value "4" and return value true`
  ]);
});

/*
[
  `alpha`,
  `delta`,
  `epsilon`,
  `chi`
]
*/

it(
  "Setting a prototype on a proxy to an array doesn't affect directly modifying the array",
  function() {
    "use strict";
    var x = ["alpha", "beta", "gamma"];
  
    const handler = {};
    const events = [];
    Reflect.ownKeys(Reflect).forEach(function(trap) {
      handler[trap] = function() {
        var rv;
        events.push(`enter ${trap}`);
        try {
          rv = Reflect[trap].apply(x, arguments);
        }
        catch (e) {
          events.push(`error ${trap} ${e}`);
          throw e;
        }
        finally {
          events.push(`leave ${trap}`);
        }
        return rv;
      };
    });
  
    const proto = Proxy.revocable([], handler);
    Reflect.ownKeys(Array.prototype).forEach(function(key) {
      Reflect.defineProperty(
        proto,
        key,
        Reflect.getOwnPropertyDescriptor(Array.prototype, key)
      );
    });
    Reflect.setPrototypeOf(x, proto);

    expect(Reflect.getOwnPropertyDescriptor(x, "splice")).toBe(undefined);
    let spliceValue;
    {
      const desc = Reflect.getOwnPropertyDescriptor(proto, "splice");
      expect(desc).not.toBe(undefined);
      if (desc)
        spliceValue = desc.value;
      else
        spliceValue = undefined;
    }
    expect(Reflect.get(x, "splice")).toBe(spliceValue);
  
    events.push("start");
    x[1] = "delta";
    events.push("middle");
    x.splice(1, 1, "epsilon");
    events.push("end");
    expect(events).toEqual(["start", "middle", "end"]);
    expect(x).toEqual(["alpha", "epsilon", "gamma"]);
  }
);
"use strict"
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof MembraneMocks != "function") ||
    (typeof loggerLib != "object") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, loggerLib, DAMP } = require("../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("basic concepts: ", function() {
  var wetDocument, dryDocument, membrane;
  
  beforeEach(function() {
    let parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
    membrane = parts.membrane;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
    membrane = null;
  });
  
  it("dryDocument and wetDocument should not be the same", function() {
    expect(dryDocument === wetDocument).toBe(false);
  });

  it("Looking up a primitive on a directly defined value works", function() {
    expect(dryDocument.nodeType).toBe(9);
  });
  
  it("Looking up null through a property name works", function() {
    expect(dryDocument.ownerDocument).toBe(null);
  });

  it("Looking up null through a property getter works", function() {
    expect(dryDocument.firstChild).toBe(null);
  });

  it("Setters should wrap and unwrap values correctly", function () {
    var extraHolder;
    const desc = {
      get: function() { return extraHolder; },
      set: function(val) {
        extraHolder = val;
        return val;
      },
      enumerable: true,
      configurable: true
    };

    Reflect.defineProperty(dryDocument, "extra", desc);
    
    var unwrappedExtra = {};
    dryDocument.extra = unwrappedExtra;
    expect(typeof extraHolder).toBe("object");
    expect(extraHolder).not.toBe(null);
    expect(extraHolder).not.toBe(unwrappedExtra);

    /* In summary:
     *
     * dryDocument is a proxy, dryDocument.extra is an unwrapped object
     * wetDocument is an unwrapped object, wetDocument.extra is a proxy
     */

    let found, foundValue;
    [found, foundValue] = membrane.getMembraneValue("wet", wetDocument);
    expect(found).toBe(true);
    expect(foundValue).toBe(wetDocument);

    [found, foundValue] = membrane.getMembraneValue("dry", dryDocument);
    expect(found).toBe(true);
    expect(foundValue).toBe(wetDocument);

    [found, foundValue] = membrane.getMembraneProxy("wet", wetDocument);
    expect(found).toBe(true);
    expect(foundValue).toBe(wetDocument);

    [found, foundValue] = membrane.getMembraneProxy("dry", dryDocument);
    expect(found).toBe(true);
    expect(foundValue).toBe(dryDocument);

    [found, foundValue] = membrane.getMembraneValue("wet", wetDocument.extra);
    expect(found).toBe(true);
    expect(foundValue).toBe(unwrappedExtra);

    [found, foundValue] = membrane.getMembraneValue("dry", dryDocument.extra);
    expect(found).toBe(true);
    expect(foundValue).toBe(unwrappedExtra);

    [found, foundValue] = membrane.getMembraneProxy("wet", wetDocument.extra);
    expect(found).toBe(true);
    expect(foundValue).toBe(extraHolder);

    [found, foundValue] = membrane.getMembraneProxy("dry", dryDocument.extra);
    expect(found).toBe(true);
    expect(foundValue).toBe(unwrappedExtra);
  });

  it("Looking up an object twice returns the same object", function() {
    var root1 = dryDocument.rootElement;
    var root2 = dryDocument.rootElement;
    expect(root1 === root2).toBe(true);
    expect(root1 !== wetDocument.rootElement).toBe(true);
    expect(typeof root1).toBe("object");
    expect(root1 !== null).toBe(true);
  });

  it("Looking up an cyclic object (a.b.c == a)", function() {
    var root = dryDocument.rootElement;
    var owner = root.ownerDocument;
    expect(dryDocument === owner).toBe(true);
  });

  it("Looking up a method twice returns the same method", function() {
    var method1 = dryDocument.insertBefore;
    var method2 = dryDocument.insertBefore;

    expect(method1 === method2).toBe(true);
    expect(method1 !== wetDocument.insertBefore).toBe(true);
    expect(typeof method1).toBe("function");
  });

  it(
    "Looking up a non-configurable, non-writable property twice returns the same property, protected",
    function() {
      const obj = { value: 6 };
      Reflect.defineProperty(wetDocument, "extra", {
        value: obj,
        writable: false,
        enumerable: true,
        configurable: false
      });
  
      var lookup1 = dryDocument.extra;
      var lookup2 = dryDocument.extra;

      expect(lookup1 === lookup2).toBe(true);
      expect(lookup1 === obj).toBe(false);

      expect(lookup1.value).toBe(6);
    }
  );

  it("Looking up an accessor descriptor works", function() {
    var desc = Object.getOwnPropertyDescriptor(dryDocument, "firstChild");
    expect(desc.configurable).toBe(true);
    expect(desc.enumerable).toBe(true);
    expect(typeof desc.get).toBe("function");
    expect("set" in desc).toBe(true);
    expect(typeof desc.set).toBe("undefined");


    desc = Object.getOwnPropertyDescriptor(dryDocument, "baseURL");
    expect(desc.configurable).toBe(true);
    expect(desc.enumerable).toBe(true);
    expect(typeof desc.get).toBe("function");
    expect(typeof desc.set).toBe("function");

    dryDocument.baseURL = "https://www.ecmascript.org/";
    expect(dryDocument.baseURL).toBe("https://www.ecmascript.org/");
  });

  it("Executing a method returns a properly wrapped object", function() {
    var rv;
    expect(function() {
      rv = dryDocument.insertBefore(dryDocument.rootElement, null);
    }).not.toThrow();
    expect(rv == dryDocument.firstChild).toBe(true);
    expect(dryDocument.firstChild == dryDocument.rootElement).toBe(true);
  });

  it("ElementDry and NodeDry respect Object.getPrototypeOf", function() {
    let wetRoot, ElementWet, NodeWet;
    let dryRoot, ElementDry, NodeDry;

    let parts = MembraneMocks();
    wetRoot     = parts.wet.doc.rootElement;
    ElementWet  = parts.wet.Element;
    NodeWet     = parts.wet.Node;

    let e, eP, proto, p2;

    e = new ElementWet({}, "test");
    eP = Object.getPrototypeOf(e);
    proto = ElementWet.prototype;
    expect(eP === proto).toBe(true);

    proto = Object.getPrototypeOf(proto);
    p2 = NodeWet.prototype;
    expect(proto === p2).toBe(true);
    
    dryRoot     = parts.dry.doc.rootElement;
    ElementDry  = parts.dry.Element;
    NodeDry     = parts.dry.Node;

    e = new ElementDry({}, "test");
    eP = Object.getPrototypeOf(e);
    proto = ElementDry.prototype;
    expect(eP === proto).toBe(true);

    proto = Object.getPrototypeOf(proto);
    p2 = NodeDry.prototype;
    expect(proto === p2).toBe(true);

    expect(dryRoot instanceof ElementDry).toBe(true);

    expect(dryRoot instanceof NodeDry).toBe(true);
  });

  it("ElementDry as a constructor reflects assigned properties", function() {
    let parts = MembraneMocks();
    
    let ElementDry = parts.dry.Element;
    let ElementWet = parts.wet.Element;
    let proto1 = ElementDry.prototype;
    let owner = {
      isFakeDoc: true,
      root: null
    };
    let k = new ElementDry(owner, "k");
    expect(typeof k).not.toBe("undefined");

    let proto2 = Object.getPrototypeOf(k);
    expect(proto1 === proto2).toBe(true);
    let kOwner = k.ownerDocument;
    expect(kOwner === owner).toBe(true);
    owner.root = k;

    /* This might be cheating, since on the "wet" object graph, there's no
     * reason to look up owner.root.  On the other hand, if k is passed back to
     * the "wet" object graph, being able to find the root property is allowed.
     */
    let dryWetMB = parts.membrane;

    let [found, wetK] = dryWetMB.getMembraneValue("wet", k);
    expect(found).toBe(true);
  
    expect(Object.getPrototypeOf(wetK) === ElementWet.prototype);
    let wetKOwner = wetK.ownerDocument;
    expect(wetKOwner !== owner).toBe(true);
    let wetKRoot = wetKOwner.root;
    expect(wetKRoot === wetK).toBe(true);
  });

  // XXX ajvincent Be sure to retest this via frames, sandboxes.
  it(
    "Executing a function via .apply() returns a properly wrapped object",
    function() {
      var method1 = dryDocument.insertBefore;
      var rv;
      expect(function() {
        rv = method1.apply(dryDocument, [dryDocument.rootElement, null]);
      }).not.toThrow();
      expect(rv == dryDocument.firstChild).toBe(true);
      expect(dryDocument.firstChild == dryDocument.rootElement).toBe(true);
    }
  );

  it("Looking up a proxy-added property works", function() {
    [
      dryDocument,
      dryDocument.rootElement,
      dryDocument.insertBefore
    ].forEach(function(dryObj) {
      var keys = Object.getOwnPropertyNames(dryObj);
      expect(keys.indexOf("membraneGraphName")).not.toBe(-1);
      expect(dryDocument.membraneGraphName).toBe("dry");
    });
  });

  it("Looking up Object.isExtensible() works", function() {
    let wetExtensible = Object.isExtensible(wetDocument);
    let dryExtensible = Object.isExtensible(dryDocument);

    expect(wetExtensible).toBe(true);
    expect(dryExtensible).toBe(true);

    Object.preventExtensions(wetDocument);

    wetExtensible = Object.isExtensible(wetDocument);
    dryExtensible = Object.isExtensible(dryDocument);

    expect(wetExtensible).toBe(false);
    expect(dryExtensible).toBe(false);
  });

  it("The in operator works", function() {
    let checkHas = function(value, valueName, propName, index, array) {
      expect(propName in value).toBe(index !== array.length - 1);
    };
    let propList = [
        "nodeType",
        "nodeName",
        "childNodes",
        "ownerDocument",
        "firstChild",
        "unknownProperty"
    ];

    propList.forEach(checkHas.bind(null, dryDocument, "dryDocument"));

    // root follows inheritance patterns.
    let root = dryDocument.rootElement;
    propList.forEach(checkHas.bind(null, root, "root"));
  });

  describe("The delete operator works as expected", function() {
    it("on dryDocument.rootElement", function() {
      let wasDeleted = delete dryDocument.rootElement;
      expect(typeof dryDocument.rootElement).toBe("undefined");
      expect("rootElement" in dryDocument).toBe(false);
      expect(wasDeleted).toBe(true);
    });

    it("on dryDocument.rootElement.nodeName", function() {
      let root = dryDocument.rootElement;
      let wasDeleted = delete root.nodeName;
      expect(typeof root.nodeName).toBe("undefined");
      expect("nodeName" in root).toBe(false);
      expect(wasDeleted).toBe(true);
    });

    it("on dryDocument.rootElement.insertBefore", function() {
      let root = dryDocument.rootElement;
      let wasDeleted = delete root.insertBefore;

      // This is because insertBefore is inherited from NodeWet.prototype.
      expect(typeof root.insertBefore).toBe("function");
      expect("insertBefore" in root).toBe(true);
      expect(wasDeleted).toBe(true);
    });
  });

  describe("Deleting a property via Reflect.deleteProperty(...) works as expected", function() {
    it("when the property doesn't exist", function() {
      expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(true);
    });

    it("when the property descriptor has configurable: true", function() {
      Reflect.defineProperty(dryDocument, "doesNotExist", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: true
      });
      expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(true);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist")).toBe(undefined);
    });

    it("when the property descriptor has configurable: false", function() {
      Reflect.defineProperty(dryDocument, "doesNotExist", {
        value: 2,
        writable: true,
        enumerable: true,
        configurable: false
      });
      expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(false);
      let desc = Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist");
      expect(typeof desc).toBe("object");
      if (desc) {
        expect(desc.value).toBe(2);
      }
    });

    it(
      "when the property descriptor is initially defined on the original target with configurable: true",
      function() {
        Reflect.defineProperty(wetDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(true);
        expect(
          Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist")
        ).toBe(undefined);
      }
    );

    it(
      "when the property descriptor is initially defined on the original target with configurable: false",
      function() {
        Reflect.defineProperty(wetDocument, "doesNotExist", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: false
        });
        expect(Reflect.deleteProperty(dryDocument, "doesNotExist")).toBe(false);
        let desc = Reflect.getOwnPropertyDescriptor(dryDocument, "doesNotExist");
        expect(typeof desc).toBe("object");
        if (desc) {
          expect(desc.value).toBe(2);
        }
      }
    );
  });

  it("Defining a property via Object.defineProperty(...) works as expected", function() {
    Object.defineProperty(dryDocument, "screenWidth", {
      value: 200,
      writable: true,
      enumerable: true,
      configurable: true
    });
    expect(dryDocument.screenWidth).toBe(200);
    expect(wetDocument.screenWidth).toBe(200);

    let localHeight = 150;
    Object.defineProperty(dryDocument, "screenHeight", {
      get: function() { return localHeight; },
      set: function(val) { localHeight = val; },
      enumerable: true,
      configurable: true
    });
    expect(dryDocument.screenHeight).toBe(150);
    expect(wetDocument.screenHeight).toBe(150);

    let location = {
      name: "location"
    };
    Object.defineProperty(dryDocument, "location", {
      value: location,
      writable: true,
      enumerable: true,
      configurable: true
    });
    expect(dryDocument.location === location).toBe(true);
    expect(typeof dryDocument.location.membraneGraphName).toBe("undefined");
    expect(wetDocument.location !== location).toBe(true);
    expect(wetDocument.location.name === "location").toBe(true);
    expect(wetDocument.location.membraneGraphName === "wet").toBe(true);

    /* XXX ajvincent There is an obvious temptation to just call:
     * dryDocument.screenWidth = 200;
     *
     * That's covered in the next test.  Here, we're testing defineProperty.
     *
     * On the other hand, we've just tested that setting a property from the
     * "dry" side retains its identity with the "dry" object graph.
     */

    // Additional test for configurable: false
    const obj = {};
    Object.defineProperty(dryDocument, "extra", {
      value: obj,
      writable: true,
      enumerable: false,
      configurable: false
    });
    let extra = dryDocument.extra;
    expect(extra).toBe(obj);
  });

  it("Defining a property directly works as expected", function() {
    dryDocument.screenWidth = 200;
    expect(dryDocument.screenWidth).toBe(200);
    expect(wetDocument.screenWidth).toBe(200);

    let localHeight = 150;
    Object.defineProperty(dryDocument, "screenHeight", {
      get: function() { return localHeight; },
      set: function(val) { localHeight = val; },
      enumerable: true,
      configurable: true
    });
    wetDocument.screenHeight = 200;
    expect(dryDocument.screenHeight).toBe(200);
    expect(wetDocument.screenHeight).toBe(200);

    let location = {
      name: "location"
    };
    dryDocument.location = location;
    expect(dryDocument.location === location).toBe(true);
    expect(typeof dryDocument.location.membraneGraphName).toBe("undefined");
    expect(wetDocument.location !== location).toBe(true);
    expect(wetDocument.location.name === "location").toBe(true);
    expect(wetDocument.location.membraneGraphName === "wet").toBe(true);    
  });

  it("Setting a prototype works as expected", function() {
    const logger = loggerLib.getLogger("test.membrane.setPrototypeOf");
    let wetRoot, ElementWet, NodeWet;
    let dryRoot, ElementDry, NodeDry;

    let parts = MembraneMocks(false, logger);
    wetRoot     = parts.wet.doc.rootElement;
    ElementWet  = parts.wet.Element;
    NodeWet     = parts.wet.Node;
    parts.wet.root = wetRoot;

    dryRoot     = parts.dry.doc.rootElement;
    ElementDry  = parts.dry.Element;
    NodeDry     = parts.dry.Node;
    parts.dry.root = dryRoot;

    let XHTMLElementDryProto = {
      namespaceURI: "http://www.w3.org/1999/xhtml"
    };
    let eProto = ElementDry.prototype;

    const traceMap = new Map(/* value: name */);
    {
      traceMap.addMember = function(value, name) {
        if (!this.has(value))
          this.set(value, name);
        if ((typeof value === "function") && !this.has(value.prototype))
          this.set(value.prototype, name + ".prototype");
      };

      {
        let keys = Reflect.ownKeys(parts.wet);
        keys.forEach(function(key) {
          let value = this[key];
          traceMap.addMember(value, "parts.wet." + key);
        }, parts.wet);

        traceMap.addMember(
          Reflect.getPrototypeOf(parts.wet.Node.prototype),
          "parts.wet.EventListener.prototype"
        );
      }
      {
        let keys = Reflect.ownKeys(parts.dry);
        keys.forEach(function(key) {
          let value = this[key];
          traceMap.addMember(value, "parts.dry." + key);
        }, parts.dry);

        traceMap.addMember(
          Reflect.getPrototypeOf(parts.dry.Node.prototype),
          "parts.dry.EventListener.prototype"
        );

        traceMap.set(XHTMLElementDryProto, "XHTMLElementDryProto");
      }

      traceMap.getPrototypeChain = function(value) {
        var rv = [], next;
        while (value) {
          next = this.get(value) || "(unknown)";
          rv.push(next);
          value = Reflect.getPrototypeOf(value);
        }
        return rv;
      };
    }

    {
      let chain = traceMap.getPrototypeChain(parts.wet.root);
      let expectedChain = [
        "parts.wet.root",
        "parts.wet.Element.prototype",
        "parts.wet.Node.prototype",
        "parts.wet.EventListener.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    {
      let chain = traceMap.getPrototypeChain(parts.dry.root);
      let expectedChain = [
        "parts.dry.root",
        "parts.dry.Element.prototype",
        "parts.dry.Node.prototype",
        "parts.dry.EventListener.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    expect(Reflect.setPrototypeOf(XHTMLElementDryProto, eProto)).toBe(true);
    {
      let chain = traceMap.getPrototypeChain(XHTMLElementDryProto);
      let expectedChain = [
        "XHTMLElementDryProto",
        "parts.dry.Element.prototype",
        "parts.dry.Node.prototype",
        "parts.dry.EventListener.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    expect(Reflect.setPrototypeOf(dryRoot, XHTMLElementDryProto)).toBe(true);
    expect(Reflect.getPrototypeOf(dryRoot) === XHTMLElementDryProto).toBe(true);
    {
      let chain = traceMap.getPrototypeChain(parts.dry.root);
      let expectedChain = [
        "parts.dry.root",
        "XHTMLElementDryProto",
        "parts.dry.Element.prototype",
        "parts.dry.Node.prototype",
        "parts.dry.EventListener.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    {
      let chain = traceMap.getPrototypeChain(parts.wet.root);
      let expectedChain = [
        "parts.wet.root",
        "(unknown)",
        "parts.wet.Element.prototype",
        "parts.wet.Node.prototype",
        "parts.wet.EventListener.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }

    expect(dryRoot.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    expect(wetRoot.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);

    let XHTMLElementDry = function(ownerDoc, name) {
      // this takes care of ownerDoc, name
      ElementDry.apply(this, [ownerDoc, name]);
    };
    XHTMLElementDry.prototype = XHTMLElementDryProto;
    traceMap.addMember(XHTMLElementDry, "XHTMLElementDry");

    let x = new XHTMLElementDry(dryDocument, "test");
    traceMap.addMember(x, "x");
    {
      let chain = traceMap.getPrototypeChain(x);
      let expectedChain = [
        "x",
        "XHTMLElementDryProto",
        "parts.dry.Element.prototype",
        "parts.dry.Node.prototype",
        "parts.dry.EventListener.prototype",
        "(unknown)"
      ];
      expect(chain).toEqual(expectedChain);
    }
    expect(x.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    expect(x.nodeType).toBe(1);
  });

  it("Calling Object.preventExtensions(...) works as expected", function() {
    expect(Object.isExtensible(dryDocument)).toBe(true);
    Object.preventExtensions(dryDocument);
    expect(Object.isExtensible(dryDocument)).toBe(false);

    // this line is NOT expected to throw an exception
    Object.preventExtensions(dryDocument);
    expect(Object.isExtensible(dryDocument)).toBe(false);
  });

  it(
    "ObjectGraphHandler.prototype.revokeEverything() breaks all proxy access on an object graph",
    function() {
      function lookup(obj, propName) {
        return function() {
          return obj[propName];
        };
      }
      let root = lookup(dryDocument, "rootElement")();

      wetDocument.dispatchEvent("unload");
      expect(lookup(dryDocument, "nodeType")).toThrow();
      expect(lookup(dryDocument, "nodeName")).toThrow();
      expect(lookup(dryDocument, "childNodes")).toThrow();
      expect(lookup(dryDocument, "insertBefore")).toThrow();
      expect(lookup(dryDocument, "rootElement")).toThrow();
      expect(lookup(dryDocument, "parentNode")).toThrow();
      expect(lookup(dryDocument, "ownerDocument")).toThrow();
      expect(lookup(dryDocument, "membraneGraphName")).toThrow();

      expect(lookup(root, "nodeType")).toThrow();
      expect(lookup(root, "nodeName")).toThrow();
      expect(lookup(root, "childNodes")).toThrow();
      expect(lookup(root, "insertBefore")).toThrow();
      expect(lookup(root, "rootElement")).toThrow();
      expect(lookup(root, "parentNode")).toThrow();
      expect(lookup(root, "ownerDocument")).toThrow();
      expect(lookup(root, "membraneGraphName")).toThrow();
  });

  it("Wrapped descriptors throw if membrane revoked", function () {
    wetDocument.dispatchEvent("unload");
    expect(function () {
      dryDocument.baseURL = "https://www.ecmascript.org/";
    }).toThrow();

    expect(function () {
      dryDocument.baseURL;
    }).toThrow();
  });

  describe(
    "Object constructors should be properly wrapped (thanks to Luca Franceschini for this test)",
    function() {
      // objects returned by `should`
      function ObjectWrapper(obj) {
        this._obj = obj;
      }

      ObjectWrapper.prototype.equal = function equal(other) {
        return (this._obj === other);
      };
      beforeEach(function() {
        Object.defineProperty(Object.prototype, 'should', {
          configurable: true,
          get: function () {
            return new ObjectWrapper(this);
          }
        });
      });
      afterEach(function() {
        Reflect.deleteProperty(Object.prototype, "should");
      });
      it("for non-wrapped objects", function() {
        const rv = wetDocument.should.equal(wetDocument);
        expect(rv).toBe(true);
      });
      it("for wrapped objects", function() {
        const rv = dryDocument.should.equal(dryDocument);
        expect(rv).toBe(true);
      });
    }
  );

  it("Array.prototype.splice works on wrapped arrays", function() {
    wetDocument.strings = ["alpha", "beta", "gamma"];
    expect(dryDocument.strings.length).toBe(3);

    Array.prototype.splice.apply(dryDocument.strings, [
      1, 1, "delta", "epsilon"
    ]);

    expect(wetDocument.strings).toEqual(["alpha", "delta", "epsilon", "gamma"]);
  });
});

describe("Receivers in proxies", function() {
  let wetObj, dryObj;
  beforeEach(function() {
    wetObj = {
      ALPHA: {
        value: "A"
      },
      BETA: {
        value: "B"
      },
      
      alpha: {
        get upper() {
          return this._upper;
        },
        set upper(val) {
          this._upper = val;
        },
        _upper: null,
        value: "a",
      },

      beta: {
        _upper: null,
        value: "b"
      },

      X: {},
    };
    wetObj.alpha._upper = wetObj.ALPHA;
    wetObj.beta._upper = wetObj.BETA;

    let parts = MembraneMocks();
    dryObj = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet, parts.handlers.dry, wetObj
    );
  });

  it("are where property lookups happen", function() {
    const a = dryObj.alpha, b = dryObj.beta, B = dryObj.BETA;
    const val = Reflect.get(a, "upper", b);
    expect(val).toBe(B);
  });

  it("are where property setter invocations happen", function() {
    const a = dryObj.alpha, b = dryObj.beta, A = dryObj.ALPHA, X = dryObj.X;
    const wetX = wetObj.X;
    Reflect.set(a, "upper", X, b);
    expect(b._upper).toBe(X);
    expect(a._upper).toBe(A);

    expect(wetObj.beta._upper).toBe(wetX);
  });
});

it("More than one object graph can be available", function() {
  let parts = MembraneMocks(true);
  let wetDocument = parts.wet.doc;
  let dryDocument = parts.dry.doc;
  let dampDocument = parts[DAMP].doc;

  wetDocument.dispatchEvent("unload");

  expect(function() {
    void(dryDocument.rootElement);
  }).toThrow();

  expect(function() {
    dampDocument.insertBefore(dampDocument.rootElement, null);
  }).not.toThrow();
});

/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

/* XXX ajvincent This is actually one case where the MembraneMocks are not
 * appropriate, because they forcibly insert a "membraneGraphName" property in a
 * way that is not entirely friendly to Object.freeze() or Object.seal() calls.
 *
 * This should be fixed at some point, but for now we'll just manually create
 * the wet and dry graphs and experiment with freezing and sealing on those.
 */

{
let FreezeSealMocks = function(defineListeners, adjustParts) {
  function wetA() {}
  wetA.prototype.letter = "A";

  function wetB() {}
  wetB.prototype = new wetA();
  wetB.prototype.letter = "B";

  function wetC() {}
  wetC.prototype.letter = "C";

  const parts = {
    wet: {
      A: wetA,
      B: wetB,
      C: wetC,

      b: new wetB()
    },

    dry: {},

    handlers: {},

    membrane: new Membrane()
  };

  parts.wet.b.instance = 1;

  parts.handlers.wet = parts.membrane.getHandlerByName(
    "wet", { mustCreate: true }
  );
  parts.handlers.dry = parts.membrane.getHandlerByName(
    "dry", { mustCreate: true }
  );

  defineListeners(parts);

  let keys = Reflect.ownKeys(parts.wet);
  keys.forEach(function(k) {
    parts.dry[k] = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet[k]
    );
  });
  
  adjustParts(parts);
  return parts;
};

/* These tests are specifically crafted for a perfect mirroring.  Very different
 * results will occur when the mirroring is not perfect.
 */
let freezeSealTests = function(expectedFrozen, defineListeners, adjustParts) {
  var parts;
  beforeEach(function() {
    parts = FreezeSealMocks(defineListeners, adjustParts);
  });
  afterEach(function() {
    parts.handlers.wet.revokeEverything();
    parts.handlers.dry.revokeEverything();
    parts = null;
  });

  it("works as expected when manipulating the wet side", function() {
    expect(Reflect.isExtensible(parts.wet.b)).toBe(false);
    expect(Reflect.isExtensible(parts.wet.B)).toBe(false);

    expect(Reflect.isExtensible(parts.dry.b)).toBe(false);
    expect(Reflect.isExtensible(parts.dry.B)).toBe(false);

    // undefined property cannot be set
    expect(Reflect.defineProperty(parts.wet.b, "extra", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(parts.wet.b.extra).toBe(undefined);
    expect(parts.dry.b.extra).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.wet.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.dry.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let oldDesc = Reflect.getOwnPropertyDescriptor(parts.wet.b, "instance");
      let newDesc = {
        value: 2,
        writable: true,
        enumerable: oldDesc.enumerable,
        configurable: oldDesc.configurable
      };
      let actual = Reflect.defineProperty(parts.wet.b, "instance", newDesc);
      expect(actual).toBe(!expectedFrozen);
    }

    expect(Reflect.deleteProperty(parts.wet.b, "instance")).toBe(false);
    expect(Reflect.deleteProperty(parts.wet.b, "doesNotExist")).toBe(true);

    const expectedValue = expectedFrozen ? 1 : 2;
    expect(parts.wet.b.instance).toBe(expectedValue);
    expect(parts.dry.b.instance).toBe(expectedValue);

    expect(Object.isFrozen(parts.wet.b)).toBe(expectedFrozen);
    expect(Object.isFrozen(parts.dry.b)).toBe(expectedFrozen);

    expect(Object.isSealed(parts.wet.b)).toBe(true);
    expect(Object.isSealed(parts.dry.b)).toBe(true);

    // setPrototypeOf
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.wet.b, parts.wet.A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.wet.b, parts.wet.C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.wet.b, parts.wet.B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.wet.b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
  });


  it("works as expected when manipulating the dry side", function() {
    expect(Reflect.isExtensible(parts.wet.b)).toBe(false);
    expect(Reflect.isExtensible(parts.wet.B)).toBe(false);

    expect(Reflect.isExtensible(parts.dry.b)).toBe(false);
    expect(Reflect.isExtensible(parts.dry.B)).toBe(false);

    // undefined property cannot be set
    expect(Reflect.defineProperty(parts.wet.b, "extra", {
      value: 5,
      writable: true,
      enumerable: true,
      configurable: true
    })).toBe(false);
    expect(parts.wet.b.extra).toBe(undefined);
    expect(parts.dry.b.extra).toBe(undefined);

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.wet.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let desc = Reflect.getOwnPropertyDescriptor(parts.dry.b, "instance");
      expect(desc.configurable).toBe(false);
      expect(desc.writable).toBe(!expectedFrozen);
    }

    {
      let oldDesc = Reflect.getOwnPropertyDescriptor(parts.dry.b, "instance");
      let newDesc = {
        value: 2,
        writable: true,
        enumerable: oldDesc.enumerable,
        configurable: oldDesc.configurable
      };
      let actual = Reflect.defineProperty(parts.dry.b, "instance", newDesc);
      expect(actual).toBe(!expectedFrozen);
    }

    expect(Reflect.deleteProperty(parts.wet.b, "instance")).toBe(false);
    expect(Reflect.deleteProperty(parts.wet.b, "doesNotExist")).toBe(true);

    const expectedValue = expectedFrozen ? 1 : 2;
    expect(parts.wet.b.instance).toBe(expectedValue);
    expect(parts.dry.b.instance).toBe(expectedValue);

    expect(Object.isFrozen(parts.wet.b)).toBe(expectedFrozen);
    expect(Object.isFrozen(parts.dry.b)).toBe(expectedFrozen);

    expect(Object.isSealed(parts.wet.b)).toBe(true);
    expect(Object.isSealed(parts.dry.b)).toBe(true);

    // setPrototypeOf
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, parts.dry.A.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, parts.dry.C.prototype)).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, parts.dry.B.prototype)).toBe(true);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);

    expect(Reflect.setPrototypeOf(parts.dry.b, {})).toBe(false);
    expect(Reflect.getPrototypeOf(parts.wet.b)).toBe(parts.wet.B.prototype);
    expect(Reflect.getPrototypeOf(parts.dry.b)).toBe(parts.dry.B.prototype);
  });
};

const voidFunc = function() { /* do nothing */ };

describe("Object.freeze on the wet value", function() {
  freezeSealTests(
    true,
    voidFunc,
    function(parts) {
      Object.freeze(parts.wet.b);
      Object.freeze(parts.wet.B);
    }
  );
});

describe("Object.freeze on the dry proxy", function() {
  freezeSealTests(
    true,
    voidFunc,
    function(parts) {
      Object.freeze(parts.dry.b);
      Object.freeze(parts.dry.B);
    }
  );
});

describe("Object.seal on the wet value", function() {
  freezeSealTests(
    false,
    voidFunc,
    function(parts) {
      Object.seal(parts.wet.b);
      Object.seal(parts.wet.B);
    }
  );
});

describe("Object.seal on the dry proxy", function() {
  freezeSealTests(
    false,
    voidFunc,
    function(parts) {
      Object.seal(parts.dry.b);
      Object.seal(parts.dry.B);
    }
  );
});
}
/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Promises through a membrane", function() {
  let parts;
  beforeEach(function() {
    parts = {
      wet: {
        wrapper: {}
      },
      dry: {},
      handlers: {},
      membrane: new Membrane(),

      response: { value: true }
    };
    parts.wet.wrapper.promise = new Promise(function(resolve, reject) {
      parts.wet.wrapper.resolve = resolve;
      parts.wet.wrapper.reject  = reject;
    });

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );

    parts.dry.wrapper = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet.wrapper
    );
  });

  it(
    "may be resolved on the wet side (where the promise came from)",
    function(done) {
      expect(parts.dry.wrapper.promise).not.toBe(parts.wet.wrapper.promise);
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        function(result) {
          expect(result.value).toBe(true);
        },
        fail
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.wet.wrapper.resolve(parts.response);
    }
  );

  it(
    "may be rejected on the wet side",
    function(done) {
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        fail,
        function(result) {
          expect(result.value).toBe(true);
        }
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.wet.wrapper.reject(parts.response);
    }
  );

  it(
    "may be resolved on the dry side",
    function(done) {
      expect(parts.dry.wrapper.promise).not.toBe(parts.wet.wrapper.promise);
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        function(result) {
          expect(result.value).toBe(true);
        },
        fail
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.dry.wrapper.resolve(parts.response);
    }
  );

  it(
    "may be rejected on the dry side",
    function(done) {
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(
        fail,
        function(result) {
          expect(result.value).toBe(true);
        }
      );
      parts.dry.wrapper.promise = parts.dry.wrapper.promise.then(done, done);
      parts.dry.wrapper.reject(parts.response);
    }
  );
});
/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Generators through a membrane", function() {
  let parts;
  beforeEach(function() {
    parts = {
      wet: {
        buildGenerator: function* () {
          let count = 0;
          while (true)
          {
            yield { count };
            count++;
          }
        }
      },
      dry: {},
      handlers: {},
      membrane: new Membrane(),

      response: { value: true }
    };

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );

    parts.dry.buildGenerator = parts.membrane.convertArgumentToProxy(
      parts.handlers.wet,
      parts.handlers.dry,
      parts.wet.buildGenerator
    );
  });

  it("work with normal stepping and a return call", function() {
    let generator = parts.dry.buildGenerator();
    expect(generator.next()).toEqual({value: { count: 0}, done: false});
    expect(generator.next()).toEqual({value: { count: 1}, done: false});
    expect(generator.return("x")).toEqual({value: "x", done: true});
    expect(generator.next()).toEqual({value: undefined, done: true});
  });


  it("work with normal stepping and a throw call", function() {
    let generator = parts.dry.buildGenerator();
    expect(generator.next()).toEqual({value: { count: 0}, done: false});
    expect(generator.next()).toEqual({value: { count: 1}, done: false});
    let result;
    expect(function() {
      result = generator.throw("foo");
    }).toThrow("foo");
    expect(result).toBe(undefined);
    expect(generator.next()).toEqual({value: undefined, done: true});
  });
});
/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

it("Iterators through a membrane work as expected", function() {
  let parts = {
    wet: {
      iterator: {
        count: 0
      }
    },
    dry: {},
    handlers: {},
    membrane: new Membrane(),

    response: { value: true }
  };

  parts.wet.iterator[Symbol.iterator] = function() {
    return {
      next: function() {
        let rv = {
          value: { count: this.count },
          done: this.count > 3
        };
        this.count++;
        return rv;
      },
      get count() {
        return parts.wet.iterator.count;
      },
      set count(val) {
        parts.wet.iterator.count = val;
        return true;
      }
    };
  };

  parts.handlers.wet = parts.membrane.getHandlerByName(
    "wet", { mustCreate: true }
  );
  parts.handlers.dry = parts.membrane.getHandlerByName(
    "dry", { mustCreate: true }
  );

  parts.dry.iterator = parts.membrane.convertArgumentToProxy(
    parts.handlers.wet,
    parts.handlers.dry,
    parts.wet.iterator
  );

  let items = Array.from(parts.dry.iterator)
                   .map((val) => val.count);
  expect(items).toEqual([0, 1, 2, 3]);
});
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof MembraneMocks != "function") ||
    (typeof loggerLib != "object") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, loggerLib, DAMP } = require("../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("Private API methods are not exposed when the membrane is marked 'secured': ", function() {
  "use strict";
  var wetDocument, dryDocument, membrane, isPrivate;
  
  beforeEach(function() {
    let parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
    membrane = parts.membrane;
    isPrivate = membrane.secured;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
    membrane = null;
  });

  it("Membrane.prototype.buildMapping", function() {
    const actual = typeof membrane.buildMapping;
    expect(actual).toBe(isPrivate ? "undefined" : "function");
  });
});
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
}

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  throw new Error("Unable to run tests");
}

describe("replacing proxies tests: ", function() {
  "use strict";
  let parts, membrane, dryHandler, replacedProxy;
  beforeEach(function() {
    parts = MembraneMocks();
    membrane = parts.membrane;
    dryHandler = membrane.getHandlerByName("dry");
    replacedProxy = null;
  });
  afterEach(function() {
    parts = null;
    membrane = null;
    dryHandler = null;
    replacedProxy = null;
  });

  it("Attempting to replace unknown object in dryHandler fails", function() {
    expect(function() {
      membrane.modifyRules.replaceProxy({}, dryHandler);
    }).toThrow();
  });

  it("Attempting to replace wetDocument in dryHandler fails", function() {
    let wetDocument = parts.wet.doc;
    expect(function() {
      membrane.modifyRules.replaceProxy(wetDocument, dryHandler);
    }).toThrow();
  });

  let dryObjectTests = function(dryObjectGenerator) {
    return function() {
      let dryObject;
      beforeEach(function() {
        dryObject = dryObjectGenerator(parts);
      });
      afterEach(function() {
        dryObject = null;
      });

      it("with bare object fails", function() {
        expect(function() {
          membrane.modifyRules.replaceProxy(dryObject, {});
        }).toThrow();
      });

      it("with Reflect fails", function() {
        expect(function() {
          membrane.modifyRules.replaceProxy(dryObject, Reflect);
        }).toThrow();
      });

      it("with object inheriting from Reflect fails", function() {
        let handler = Object.create(Reflect, {
          "thisIsATest": {
            value: true,
            writable: true,
            enumerable: true,
            configurable: true
          }
        });
        expect(function() {
          membrane.modifyRules.replaceProxy(dryObject, handler);
        }).toThrow();
      });

      it("handler with dryHandler succeeds", function() {
        replacedProxy = membrane.modifyRules.replaceProxy(dryObject, dryHandler);
        let mGN = replacedProxy.membraneGraphName;
        expect(mGN).toBe("dry");
      });

      it("handler with dryHandler a second time fails", function() {
        membrane.modifyRules.replaceProxy(dryObject, dryHandler);
        expect(function() {
          membrane.modifyRules.replaceProxy(dryObject, dryHandler);
        }).toThrow();
      });

      it("'s previously replaced handler with dryHandler succeeds", function() {
        replacedProxy = membrane.modifyRules.replaceProxy(dryObject, dryHandler);
        expect(function() {
          replacedProxy = membrane.modifyRules.replaceProxy(replacedProxy, dryHandler);
        }).not.toThrow();
        let mGN = replacedProxy.membraneGraphName;
        expect(mGN).toBe("dry");
      });

      describe("with object inheriting from dryHandler", function() {
        it("directly succeeds", function() {
          let handler = membrane.modifyRules.createChainHandler(dryHandler);
          expect(handler.nextHandler).toBe(dryHandler);
          expect(handler.baseHandler).toBe(dryHandler);

          Object.defineProperties(handler, {
            "thisIsATest": {
              value: true,
              writable: true,
              enumerable: true,
              configurable: true
            }
          });

          replacedProxy = membrane.modifyRules.replaceProxy(dryObject, handler);
          let [found, cachedProxy] = membrane.getMembraneProxy("dry", dryObject);
          expect(found).toBe(true);
          expect(cachedProxy).toBe(replacedProxy);

          [found, cachedProxy] = membrane.getMembraneProxy("dry", replacedProxy);
          expect(found).toBe(true);
          expect(cachedProxy).toBe(replacedProxy);

          let mGN = replacedProxy.membraneGraphName;
          expect(mGN).toBe("dry");
        });

        it("indirectly succeeds", function() {
          let handler = membrane.modifyRules.createChainHandler(dryHandler);
          Object.defineProperties(handler, {
            "thisIsATest": {
              value: true,
              writable: true,
              enumerable: true,
              configurable: true
            }
          });
          let handler2 = membrane.modifyRules.createChainHandler(handler);
          expect(handler2.nextHandler).toBe(handler);
          expect(handler2.baseHandler).toBe(dryHandler);

          Object.defineProperties(handler2, {
            "anotherTest": {
              value: true,
              writable: true,
              enumerable: true,
              configurable: true
            }
          });
          replacedProxy = membrane.modifyRules.replaceProxy(dryObject, handler2);
          let mGN = replacedProxy.membraneGraphName;
          expect(mGN).toBe("dry");
        });

        it("and replacing all traps with forwarding traps succeeds",
           function() {
          let handler = membrane.modifyRules.createChainHandler(dryHandler);
          let numCalls = 0;
          membrane.allTraps.forEach(function(trapName) {
            handler[trapName] = function() {
              numCalls++;
              return this.nextHandler[trapName].apply(this, arguments);
            };
          });

          replacedProxy = membrane.modifyRules.replaceProxy(dryObject, handler);
          let mGN = replacedProxy.membraneGraphName;
          expect(mGN).toBe("dry");
          expect(numCalls).toBeGreaterThan(0);

          /* XXX ajvincent It's unclear in this sort of scenario whether
           * handler.get() should call handler.getOwnPropertyDescriptor()
           * indirectly via handler.baseHandler.get().  Thus, a proxy overriding
           * only .getOwnPropertyDescriptor to add or hide properties might not
           * mirror that behavior through the handler's .get trap.  Similar
           * ambiguities exist with .set, .defineProperty, also.
           *
           * The most "natural" behavior, I think, is yes, to use the
           * nextHandler's trap as a method of this, via .apply().
           */
        });

        it("and then again with the original dryHandler succeeds", function() {
          let handler = membrane.modifyRules.createChainHandler(dryHandler);
          replacedProxy = membrane.modifyRules.replaceProxy(dryObject, handler);
          replacedProxy = membrane.modifyRules.replaceProxy(replacedProxy, dryHandler);
          let mGN = replacedProxy.membraneGraphName;
          expect(mGN).toBe("dry");
        });
      });
    };
  };

  describe(
    "Attempting to replace dryDocument",
    dryObjectTests(
      function(parts) {
        return parts.dry.doc;
      }
    )
  );

  describe(
    "Attempting to replace NodeDry.prototype",
    dryObjectTests(
      function(parts) {
        return parts.dry.Node.prototype;
      }
    )
  );

  describe("Replacing wetDocument", function() {
    it("with a direct Reflect proxy works", function() {
      let wetDocument = parts.wet.doc;
      let [found, wetProxy] = membrane.getMembraneProxy("wet", wetDocument);
      expect(found).toBe(true);
      expect(wetProxy).toBe(wetDocument);

      membrane.modifyRules.replaceProxy(wetDocument, Reflect);
      [found, wetProxy] = membrane.getMembraneProxy("wet", wetDocument);
      expect(found).toBe(true);
      expect(wetProxy).not.toBe(wetDocument);
      expect(wetProxy.nodeName).toBe("#document");
    });

    it("with an indirect Reflect proxy works", function() {
      let wetDocument = parts.wet.doc;
      let [found, wetProxy] = membrane.getMembraneProxy("wet", wetDocument);
      expect(found).toBe(true);
      expect(wetProxy).toBe(wetDocument);
      expect(wetProxy.nodeName).toBe("#document");

      let keys = Reflect.ownKeys(wetProxy);
      expect(keys.includes("shouldNotBeAmongKeys")).toBe(true);
      
      let handler = membrane.modifyRules.createChainHandler(Reflect);
      expect(handler.nextHandler).toBe(Reflect);
      expect(handler.baseHandler).toBe(Reflect);
      let lastVisited = null;
      membrane.allTraps.forEach(function(trapName) {
        handler[trapName] = function() {
          try {
            var rv = this.nextHandler[trapName].apply(this, arguments);
            if ((trapName == "ownKeys") && rv.includes("shouldNotBeAmongKeys")) {
              rv.splice(rv.indexOf("shouldNotBeAmongKeys"), 1);
            }
            return rv;
          }
          finally {
            lastVisited = trapName;
          }
        };
      });

      let proxy = membrane.modifyRules.replaceProxy(wetDocument, handler);
      [found, wetProxy] = membrane.getMembraneProxy("wet", wetDocument);
      expect(found).toBe(true);
      expect(wetProxy).not.toBe(wetDocument);
      expect(wetProxy).toBe(proxy);
      let name = wetProxy.nodeName;
      expect(name).toBe("#document");
      expect(lastVisited).toBe("get");

      keys = Reflect.ownKeys(wetProxy);
      expect(keys.includes("shouldNotBeAmongKeys")).toBe(false);
      expect(lastVisited).toBe("ownKeys");

      // This tests propagation of newly generated properties across the membrane.
      let dryDocument = parts.dry.doc;
      keys = Reflect.ownKeys(dryDocument);
      expect(keys.includes("shouldNotBeAmongKeys")).toBe(false);
      /*
      expect(lastVisited).toBe("ownKeys");
      */
    });

    it(
      "with a proxy inheriting from the wet object graph does not work",
      function() {
        let wetDocument = parts.wet.doc;
        let wetHandler = membrane.getHandlerByName("wet");
        let found, wetProxy;

        expect(function() {
          wetDocument = membrane.modifyRules.replaceProxy(wetDocument, wetHandler);
        }).toThrow();
        [found, wetProxy] = membrane.getMembraneProxy("wet", wetDocument);
        expect(found).toBe(true);
        expect(wetProxy).toBe(wetDocument);

        let handler = membrane.modifyRules.createChainHandler(wetHandler);
        expect(function() {
          wetDocument = membrane.modifyRules.replaceProxy(wetDocument, handler);
        }).toThrow();
        [found, wetProxy] = membrane.getMembraneProxy("wet", wetDocument);
        expect(found).toBe(true);
        expect(wetProxy).toBe(wetDocument);
      }
    );
  });
});
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Pass-through filters", function() {
  "use strict";
  const MUSTCREATE = Object.freeze({ mustCreate: true });
  const p = {};
  function passP(value) {
    if (value === p)
      return true;
    return false;
  }
  describe("on the membrane", function() {
    it("do not wrap objects when returning true", function() {
      const membrane = new Membrane({passThroughFilter: passP});
      const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // second time test
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // the other way test
      wrappedP = membrane.convertArgumentToProxy(dryHandler, wetHandler, p);
      expect(wrappedP).toBe(p);

      // back again
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // through another graph handler
      const dampHandler = membrane.getHandlerByName(
        Symbol("damp"), { mustCreate: true }
      );
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dampHandler, p);
      expect(wrappedP).toBe(p);
    });

    it("defers to previously wrapped values", function() {
      let count = 0;
      const membrane = new Membrane({
        passThroughFilter: function(value) {
          count++;
          if ((value === p) && (count > 1))
            return true;
          return false;
        }
      });
      const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it(
      "allows a value to be wrapped if the filter returns false in the future (don't do this)",
      function() {
        /* XXX ajvincent Seriously, don't.  If you do, and you expect the
           membrane to preserve the identity assertions, you're asking it to
           remember every value that ever passes through it, and that's wasteful
           of memory - at least for the WeakMap that now has to hold every value
           the membrane has seen.
         */
        let count = 0;
        const membrane = new Membrane({
          passThroughFilter: function(value) {
            count++;
            if ((value === p) && (count === 1))
              return true;
            return false;
          }
        });
        const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
        const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

        let wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(p);

        let proxyToP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it(
      "force wrapping when the membrane filter returns false and there are no graph filters",
      function() {
        const membrane = new Membrane({passThroughFilter: () => false});
        const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
        const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

        let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it("cannot be replaced", function() {
      const membrane = new Membrane({
        passThroughFilter: passP,
      });

      let desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
      expect(typeof desc).toBe("object");
      if (!desc)
        return;
      expect(desc.value).toBe(passP);
      expect(desc.writable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect(desc.configurable).toBe(false);
    });

    it("cannot be assigned after construction", function() {
      const membrane = new Membrane();

      let desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
      expect(typeof desc).toBe("object");
      if (!desc)
        return;
      expect(typeof desc.value).toBe("function");
      expect(desc.writable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect(desc.configurable).toBe(false);
    });

    it("cannot be assigned as a non-function value", function() {
      const membrane = new Membrane({passThroughFilter: p});

      let desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
      expect(typeof desc).toBe("object");
      if (!desc)
        return;
      expect(typeof desc.value).toBe("function");
      expect(desc.writable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect(desc.configurable).toBe(false);
    });

    it("propagates an exception thrown", function() {
      const membrane = new Membrane({
        passThroughFilter: function() {
          throw p;
        }
      });

      const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);
      expect(function() {
        membrane.convertArgumentToProxy(wetHandler, dryHandler, {});
      }).toThrow(p);
    });
  });

  describe("on object graph wrappers", function() {
    let membrane, wetHandler, dryHandler;
    beforeEach(function() {
      membrane = new Membrane();
      wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);
    });
    afterEach(function() {
      membrane = undefined;
      wetHandler = undefined;
      dryHandler = undefined;
    });

    it("do not wrap objects when returning true from both graphs", function() {
      wetHandler.passThroughFilter = passP;
      dryHandler.passThroughFilter = passP;

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // second time test
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // the other way test
      wrappedP = membrane.convertArgumentToProxy(dryHandler, wetHandler, p);
      expect(wrappedP).toBe(p);

      // back again
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });

    it("wrap an object when the target graph handler does not return true", function() {
      wetHandler.passThroughFilter = passP;

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it("wrap an object when the origin graph handler does not return true", function() {
      dryHandler.passThroughFilter = passP;

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it("defers to previously wrapped values", function() {
      let count = 0;
      function passP2(value) {
        count++;
        if ((value === p) && (count > 1))
          return true;
        return false;
      }

      wetHandler.passThroughFilter = passP;
      dryHandler.passThroughFilter = passP2;

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);

      // I could test the reverse case, but it's redundant.
    });

    it(
      "allows a value to be wrapped if the filter returns false in the future (don't do this)",
      function() {
        // XXX ajvincent See above note.
        let count = 0;
        function passP2(value) {
          count++;
          if ((value === p) && (count === 1))
            return true;
          return false;
        }

        wetHandler.passThroughFilter = passP;
        dryHandler.passThroughFilter = passP2;

        let wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(p);

        let proxyToP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it("cannot be replaced more than once", function() {
      expect(wetHandler.mayReplacePassThrough).toBe(true);
      let oldFilter = wetHandler.passThroughFilter;
      wetHandler.passThroughFilter = passP;
      expect(wetHandler.mayReplacePassThrough).toBe(false);

      let desc = Reflect.getOwnPropertyDescriptor(
        wetHandler, "passThroughFilter"
      );
      expect(typeof desc).toBe("object");
      if (!desc)
        return false;
      expect(desc.configurable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect("get" in desc).toBe(true);
      expect("set" in desc).toBe(true);

      expect(function() {
        wetHandler.passThroughFilter = oldFilter;
      }).toThrow();
      expect(wetHandler.passThroughFilter).toBe(passP);
    });

    it("cannot be assigned as a non-function value", function() {
      let oldFilter = wetHandler.passThroughFilter;
      expect(function() {
        wetHandler.passThroughFilter = {};
      }).toThrow();

      expect(wetHandler.passThroughFilter).toBe(oldFilter);
    });

    it("propagates an exception thrown", function() {
      wetHandler.passThroughFilter = function() {
        throw p;
      };
      expect(function() {
        membrane.convertArgumentToProxy(wetHandler, dryHandler, {});
      }).toThrow(p);
    });
  });
});
/* XXX ajvincent I'm not going to use the MembraneMocks in these tests, because
 * the mocks create proxies to objects before any listeners can be registered.
 * I could modify the mocks to take listeners through an options object, but
 * that is just going to make the mocks code more complicated than necessary.
 *
 * Similarly, the logger we create will not be attached to the membrane.
 */

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
}

describe("An object graph handler's proxy listeners", function() {
  var membrane, wetHandler, dryHandler, appender, ctor1;
  const logger = loggerLib.getLogger("test.membrane.proxylisteners");

  function getMessageProp(event) { return event.message; }
  function getMessages() {
    return this.events.map(getMessageProp);
  }

  function mustSkip(value) {
    return ((value === Object.prototype) ||
            (value === ctor1) ||
            (value === ctor1.prototype));
  }

  beforeEach(function() {
    membrane = new Membrane({logger: logger});
    wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
    dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });

    appender = new loggerLib.Appender();
    logger.addAppender(appender);
    appender.getMessages = getMessages;
    appender.setThreshold("INFO");

    ctor1 = function(arg1) {
      try {
        this.label = "ctor1 instance";
        this.arg1 = arg1;
      }
      catch (ex) {
        // do nothing, this is not that important to our tests
      }    
    };
    ctor1.prototype.label = "ctor1 prototype";
    ctor1.prototype.number = 2;
  });

  afterEach(function() {
    logger.removeAppender(appender);

    wetHandler.revokeEverything();
    dryHandler.revokeEverything();

    membrane = null;
    wetHandler = null;
    dryHandler = null;
    appender = null;
  });

  /* XXX ajvincent I could use Jasmine spies, but for once, I don't like the
   * API that Jasmine spies presents.  Instead, I'll use the logger mocks to
   * record events and their order.
   */
  
  describe("are notified of a proxy before the proxy is returned", function() {
    /* We're not testing API of meta yet.  That'll be a separate test.
    The only reason we test for the proxy is to ensure the proxy is the same for
    the listeners and the returned value.
    */

    var meta0, meta1, meta2;
    function listener1(meta) {
      if (mustSkip(meta.target))
        return;
      meta1 = meta;
      logger.info("listener1");
    }
    function listener2(meta) {
      if (mustSkip(meta.target))
        return;
      meta2 = meta;
      logger.info("listener2");
    }
    function listener0(meta) {
      if (mustSkip(meta.target))
        return;
      meta0 = meta;
      logger.info("listener0");
    }

    function reset() {
      appender.clear();
      meta0 = undefined;
      meta1 = undefined;
      meta2 = undefined;
    }

    beforeEach(function() {
      wetHandler.addProxyListener(listener0);
      wetHandler.addProxyListener(listener2);
      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);
      reset();
    });

    afterEach(reset);

    it("via membrane.convertArgumentToProxy", function() {
      var x = new ctor1("one");
      logger.info("x created");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      logger.info("dry(x) created");
      expect(X.label).toBe("ctor1 instance");
      expect(X).not.toBe(x);

      let messages = appender.getMessages();
      expect(messages.length).toBe(6);
      expect(messages[0]).toBe("x created");

      // origin ObjectGraphHandler's listeners
      expect(messages[1]).toBe("listener0");
      expect(messages[2]).toBe("listener2");

      // target ObjectGraphHandler's listeners
      expect(messages[3]).toBe("listener1");
      expect(messages[4]).toBe("listener2");

      expect(messages[5]).toBe("dry(x) created");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).not.toBe(undefined);
      expect(meta2.proxy).toBe(X);
    });

    it("via wrapping a non-primitive property", function() {
      var y = {};
      var x = new ctor1(y);
      expect(x.arg1).toBe(y);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      appender.clear();

      logger.info("X.y retrieval start");
      var Y = X.arg1;
      logger.info("X.y retrieval end");
      expect(Y).not.toBe(y);

      let messages = appender.getMessages();
      expect(messages.length).toBe(6);
      expect(messages[0]).toBe("X.y retrieval start");

      // origin ObjectGraphHandler's listeners
      expect(messages[1]).toBe("listener0");
      expect(messages[2]).toBe("listener2");

      // target ObjectGraphHandler's listeners
      expect(messages[3]).toBe("listener1");
      expect(messages[4]).toBe("listener2");

      expect(messages[5]).toBe("X.y retrieval end");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).not.toBe(undefined);
      expect(meta2.proxy).toBe(Y);
    });

    it("via wrapping a primitive property", function() {
      var y = 4;
      var x = new ctor1(y);
      expect(x.arg1).toBe(y);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      reset();

      logger.info("X.y retrieval start");
      var Y = X.arg1;
      logger.info("X.y retrieval end");
      expect(Y).toBe(y); // because it's a primitive

      let messages = appender.getMessages();
      expect(messages.length).toBe(2);
      expect(messages[0]).toBe("X.y retrieval start");
      expect(messages[1]).toBe("X.y retrieval end");

      expect(meta0).toBe(undefined);
      expect(meta1).toBe(undefined);
      expect(meta2).toBe(undefined);
    });

    it("via counter-wrapping a non-primitive argument", function() {
      var cbVal;
      const Z = { argIndex: 0 }, Z2 = { argIndex: 1 }, rv = { isRV: true };
      function callback(k) {
        logger.info("Entering callback");
        cbVal = k;
        logger.info("Exiting callback");
        return rv;
      }

      var x = new ctor1(callback);
      expect(x.arg1).toBe(callback);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      {
        let Y = X.arg1; // we've already tested this above
        reset();
        Y = null;
      }

      logger.info("Calling X.arg1 start");
      var K = X.arg1(Z, Z2);
      logger.info("Calling X.arg1 end");
      expect(cbVal).not.toBe(undefined);
      expect(cbVal).not.toBe(null);
      expect(typeof cbVal).toBe("object");
      if (cbVal)
        expect(cbVal.argIndex).toBe(0);

      let messages = appender.getMessages();
      expect(messages.length).toBe(16);
      expect(messages[0]).toBe("Calling X.arg1 start");

      // for argument 0
      // origin ObjectGraphHandler's listeners
      expect(messages[1]).toBe("listener1");
      expect(messages[2]).toBe("listener2");
      // target ObjectGraphHandler's listeners
      expect(messages[3]).toBe("listener0");
      expect(messages[4]).toBe("listener2");

      // for argument 1
      // origin ObjectGraphHandler's listeners
      expect(messages[5]).toBe("listener1");
      expect(messages[6]).toBe("listener2");
      // target ObjectGraphHandler's listeners
      expect(messages[7]).toBe("listener0");
      expect(messages[8]).toBe("listener2");

      // executing the method
      expect(messages[9]).toBe("Entering callback");
      expect(messages[10]).toBe("Exiting callback");

      // for return value
      // origin ObjectGraphHandler's listeners
      expect(messages[11]).toBe("listener0");
      expect(messages[12]).toBe("listener2");
      // target ObjectGraphHandler's listeners
      expect(messages[13]).toBe("listener1");
      expect(messages[14]).toBe("listener2");

      expect(messages[15]).toBe("Calling X.arg1 end");

      expect(typeof meta2).toBe("object");
      expect(K).not.toBe(undefined);
      expect(K).not.toBe(null);
      expect(typeof K).toBe("object");
      if (K)
        expect(K.isRV).toBe(true);
    });

    it("via counter-wrapping a primitive argument", function() {
      var cbVal;
      function callback(k) {
        cbVal = k;
      }

      var x = new ctor1(callback);
      expect(x.arg1).toBe(callback);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      {
        let Y = X.arg1; // we've already tested this above
        reset();
        Y = null;
      }

      const Z = true;

      logger.info("Calling X.arg1 start");
      X.arg1(Z);
      logger.info("Calling X.arg1 end");
      expect(cbVal).not.toBe(undefined);

      let messages = appender.getMessages();
      expect(messages.length).toBe(2);
      expect(messages[0]).toBe("Calling X.arg1 start");
      expect(messages[1]).toBe("Calling X.arg1 end");

      expect(meta0).toBe(undefined);
      expect(meta1).toBe(undefined);
      expect(meta2).toBe(undefined);
      expect(cbVal).toBe(true);
    });
  });

  describe("can override the proxy to return", function() {
    it("with a primitive", function() {
      var rv = "primitive";
      dryHandler.addProxyListener(function(meta) {
        meta.proxy = rv;
      });
      var x = new ctor1("one");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(X).toBe(rv);
    });

    it("with a non-primitive", function() {
      var rv = {};
      dryHandler.addProxyListener(function(meta) {
        meta.proxy = rv;
      });
      var x = new ctor1("one");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(X).toBe(rv);
    });

    it("with the unwrapped value, and without Membrane protection", function() {
      var rv = {};
      dryHandler.addProxyListener(function(meta) {
        meta.proxy = meta.target;
      });
      var x = new ctor1(rv);
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      expect(X).toBe(x);

      // If X was wrapped, X.arg1 would also be wrapped, and wouldn't be rv.
      expect(X.arg1).toBe(rv);
    });

    it("with a new proxy built from the existing handler", function() {
      var handler2 = membrane.modifyRules.createChainHandler(dryHandler);
      var extraDesc = {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true
      };
      
      handler2.getOwnPropertyDescriptor = function(target, propName) {
        if (propName == "extra")
          return extraDesc;
        return this.nextHandler.getOwnPropertyDescriptor(target, propName);
      };
      dryHandler.addProxyListener(function(meta) {
        meta.handler = handler2;
        meta.rebuildProxy();
      });

      var x = new ctor1("three");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      expect(X.extra).toBe(3);
      expect(x.extra).toBe(undefined);
    });

    it("with a new proxy built locally", function() {
      /* XXX ajvincent BE EXTREMELY CAREFUL IF YOU EVER DO THIS.  This is like
       * returning an object to override the membrane's handlers... including
       * the membrane being unable to revoke your proxy or provide any membrane
       * properties.  In short, it's a really bad idea.
       *
       * What you _should_ do is demonstrated in the previous test:  create a
       * chain handler, define methods on it, and then call meta.rebuildProxy().
       */

      var extraDesc = {
        value: 3,
        writable: true,
        enumerable: true,
        configurable: true
      };

      var handler2 = {};
      handler2.getOwnPropertyDescriptor = function(target, propName) {
        if (propName == "extra")
          return extraDesc;
        return Reflect.getOwnPropertyDescriptor(target, propName);
      };

      function listener(meta) {
        meta.proxy = new Proxy(meta.target, handler2);        
      }

      dryHandler.addProxyListener(listener);

      var x = new ctor1("three");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );

      let XDesc = Reflect.getOwnPropertyDescriptor(X, "extra");
      expect(XDesc.value).toBe(3);
      expect(x.extra).toBe(undefined);
    });

    /**
     * @note This function here is for testing meta.useShadowTarget.  This test
     * exposes an optimization which replaces the proxy using the
     * heavy-duty ObjectGraphHandler with another proxy using only lightweight
     * methods (and in the case of target functions, the graph handler's .call
     * and .construct methods).
     *
     * For the Object.freeze() and Object.seal() tests, you'll see properties
     * and prototypes looked up at the time of sealing.  For the normal case,
     * those properties will be looked up on demand only.  That's why the 
     * "if (mode) { ... } else { ... }" blocks exist:  to distinguish between
     * sealed object tests and lazy getter tests.
     */
    function useShadowTargetTests(mode) {
      // begin test infrastructure
      function ctor2(arg1, arg2) {
        ctor1.apply(this, [arg1]);
        this.arg2 = arg2;
      }
      ctor2.prototype = new ctor1("ctor2 base");

      var lastLogArg;
      function logTest(arg) {
        logger.info("Executing logTest");
        lastLogArg = arg;
      }

      function testListener(meta) {
        try {
          if ([x, logTest, ctor2, ctor2.prototype, a, b, c].includes(meta.target))
          {
            logger.info("starting useShadowTarget");
            meta.useShadowTarget(mode);
            logger.info("finished useShadowTarget");
          }
        }
        catch (ex) {
          meta.throwException(ex);
        }
      }

      function lazyDescTest(obj, propName) {
        const desc = Reflect.getOwnPropertyDescriptor(obj, propName);
        const hasGetAndSet = mode !== "prepared" ? "undefined" : "function";
        expect(typeof desc.get).toBe(hasGetAndSet);
        expect(typeof desc.set).toBe(hasGetAndSet);

        let expectation;
        expectation = expect(typeof desc.value);
        if (mode !== "prepared")
          expectation = expectation.not;
        expectation.toBe("undefined");

        let expectedValue;
        if (mode === "frozen")
          expectedValue = false;
        else if (mode === "sealed")
          expectedValue = true;
        else
          expectedValue = undefined;
        expect(desc.writable).toBe(expectedValue);

        expect(desc.enumerable).toBe(true);
        expect(desc.configurable).toBe(mode === "prepared");
      }

      function directDescTest(proxy, target, propName) {
        let desc = Reflect.getOwnPropertyDescriptor(proxy, propName);
        let check = Reflect.getOwnPropertyDescriptor(target, propName);
        expect(typeof desc.get).toBe("undefined");
        expect(typeof desc.set).toBe("undefined");
        expect(typeof desc.value).toBe(typeof check.value);

        let expectedValue;
        if (mode === "frozen")
          expectedValue = false;
        else
          expectedValue = true;
        expect(desc.writable).toBe(expectedValue);

        expect(desc.enumerable).toBe(true);
        expect(desc.configurable).toBe(mode === "prepared");
      }
      // end test infrastructure, begin real tests

      dryHandler.addProxyListener(testListener);

      /* Most tests are done with x and X.  I do special cyclic value tests
      with a/b/c, and A/B/C.
      */
      var x, X, a, A, b, B, c, C;
      {
        x = new ctor2("one", logTest);
        logger.info("x created");

        X = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          x
        );
        logger.info("dry(x) created");

        // Invocation of proxy listeners
        let messages = appender.getMessages();
        if (mode !== "prepared") {
          expect(messages.length).toBe(8);
          expect(messages[0]).toBe("x created");

          // X 
          expect(messages[1]).toBe("starting useShadowTarget");

          // Reflect.getPrototypeOf(X)
          expect(messages[2]).toBe("starting useShadowTarget");
          expect(messages[3]).toBe("finished useShadowTarget");

          // X.arg2, also known as logTest
          expect(messages[4]).toBe("starting useShadowTarget");
          expect(messages[5]).toBe("finished useShadowTarget");

          // X
          expect(messages[6]).toBe("finished useShadowTarget");

          expect(messages[7]).toBe("dry(x) created");
        }
        else {
          expect(messages.length).toBe(6);
          expect(messages[0]).toBe("x created");
          // x
          expect(messages[1]).toBe("starting useShadowTarget");

          // Reflect.getPrototypeOf(X)
          expect(messages[2]).toBe("starting useShadowTarget");
          expect(messages[3]).toBe("finished useShadowTarget");

          // X
          expect(messages[4]).toBe("finished useShadowTarget");
          expect(messages[5]).toBe("dry(x) created");
        }
      }

      appender.clear();
      {
        let keys = Reflect.ownKeys(X).sort();
        expect(keys.length).toBe(3);
        expect(keys[0]).toBe("arg1");
        expect(keys[1]).toBe("arg2");
        expect(keys[2]).toBe("label");
      }

      /* Property descriptors for each property.  Lazy properties will have
       * .get() and .set().  Sealed properties will have .value and .writable.
       */
      ["arg1", "arg2", "label"].forEach(function(key) {
        lazyDescTest(X, key);
      });

      expect(X.arg1).toBe("one");

      // Invoking the lazy getters in the prepared case for arg2.
      {
        appender.clear();
        logger.info("looking up arg2");
        expect(typeof X.arg2).toBe("function");
        logger.info("exiting arg2 lookup");
        let messages = appender.getMessages();

        if (mode !== "prepared") {
          // The lazy getters have already been invoked and discarded.
          expect(messages.length).toBe(2);
          expect(messages[0]).toBe("looking up arg2");
          expect(messages[1]).toBe("exiting arg2 lookup");
        }
        else {
          // The lazy getters force us into the listener again.
          expect(messages.length).toBe(4);
          expect(messages[0]).toBe("looking up arg2");
          expect(messages[1]).toBe("starting useShadowTarget");
          expect(messages[2]).toBe("finished useShadowTarget");
          expect(messages[3]).toBe("exiting arg2 lookup");
        }
      }

      {
        /* Looking up X.arg2 this time doesn't invoke useShadowTarget, because
         * the lazy getter for arg2 was replaced with a descriptor referring
         * directly to the wrapped method.
         */
        appender.clear();
        logger.info("looking up arg2");
        expect(typeof X.arg2).toBe("function");
        logger.info("exiting arg2 lookup");
        let messages = appender.getMessages();
        expect(messages.length).toBe(2);
        expect(messages[0]).toBe("looking up arg2");
        expect(messages[1]).toBe("exiting arg2 lookup");
      }

      if (typeof X.arg2 === "function") {
        appender.clear();
        X.arg2();
        let messages = appender.getMessages();
        expect(messages.length).toBe(1);
        expect(messages[0]).toBe("Executing logTest");
      }

      expect(X.label).toBe("ctor1 instance");

      // Property descriptors, this time direct instead of lazy.
      ["arg1", "arg2", "label"].forEach(function(key) {
        directDescTest(X, x, key);
      });

      // testing wrapping of arguments:  are we actually invoking call?
      const dryArg = {};
      for (let loop = 0; loop < 2; loop++) {
        appender.clear();
        logger.info("entering logTest with argument");
        X.arg2(dryArg);
        logger.info("leaving logTest with argument");
        let wetArg = membrane.convertArgumentToProxy(
          dryHandler,
          wetHandler,
          dryArg
        );
        expect(lastLogArg === wetArg).toBe(true);

        let messages = appender.getMessages();
        expect(messages.length).toBe(3);
        expect(messages[0]).toBe("entering logTest with argument");
        expect(messages[1]).toBe("Executing logTest");
        expect(messages[2]).toBe("leaving logTest with argument");
      }

      // disabling the apply trap, so that a function should not be executable
      {
        const funcWrapper = X.arg2;
        const graphName = dryHandler.fieldName;
        expect(typeof graphName).toBe("string");
        membrane.modifyRules.disableTraps(
          graphName, funcWrapper, ["apply"]
        );
        appender.clear();
        logger.info("entering logTest with argument");
        expect(function() {
          funcWrapper(dryArg);
        }).toThrow();
        logger.info("leaving logTest with argument");
        let messages = appender.getMessages();
        expect(messages.length).toBe(2);
      }

      // testing the construct trap
      {
        let CTOR2 = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          ctor2
        );

        let wetArg = membrane.convertArgumentToProxy(
          dryHandler,
          wetHandler,
          dryArg
        );

        {
          appender.clear();
          let K = new CTOR2("foo", dryArg);
          let k = membrane.convertArgumentToProxy(
            dryHandler,
            wetHandler,
            K
          );
          expect(k.arg2 === wetArg).toBe(true);
        }

        // testing disableTraps on a constructor
        membrane.modifyRules.disableTraps(
          dryHandler.fieldName, CTOR2, ["construct"]
        );

        expect(function() {
          void(new CTOR2());
        }).toThrow();
      }

      // Cyclic object references
      {
        a = { objName: "a" };
        b = { objName: "b" };
        a.child = b;
        b.parent = a;

        A = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          a
        );
        B = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          b
        );

        expect(A.child.parent === A).toBe(true);
        expect(B.parent.child === B).toBe(true);
      }

      // really push the cyclic test a step further, for scalability testing
      {
        a = { objName: "a" };
        b = { objName: "b" };
        c = { objName: "c" };

        a.child = b;
        b.child = c;
        c.grandParent = a;

        A = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          a
        );

        B = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          b
        );

        C = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          c
        );

        expect(A.child.child.grandParent === A).toBe(true);
        expect(B.child.grandParent.child === B).toBe(true);
        expect(C.grandParent.child.child === C).toBe(true);
      }

      /* XXX ajvincent Beyond this point, you should not step through in a
       * debugger.  You will get inconsistent results if you do.
       */

      {
        /* The first time for non-sealed objects, we should invoke the lazy
         * getPrototypeOf call.  For sealed objects, we've already invoked the
         * lazy call when sealing the object.
         */
        appender.clear();
        logger.info("entering getPrototypeOf");
        Reflect.getPrototypeOf(X);
        logger.info("exiting getPrototypeOf");

        let messages = appender.getMessages();
        expect(messages.length).toBe(2);
        expect(messages[0]).toBe("entering getPrototypeOf");
        expect(messages[1]).toBe("exiting getPrototypeOf");
      }

      {
        // The second time, the getPrototypeOf call should be direct.
        appender.clear();
        logger.info("entering getPrototypeOf");
        let Y = Reflect.getPrototypeOf(X);
        logger.info("exiting getPrototypeOf");

        let messages = appender.getMessages();
        expect(messages.length).toBe(2);
        expect(messages[0]).toBe("entering getPrototypeOf");
        expect(messages[1]).toBe("exiting getPrototypeOf");

        appender.clear();

        let expectedY = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          ctor2.prototype
        );

        messages = appender.getMessages();
        expect(messages.length).toBe(0);

        expect(Y === expectedY).toBe(true);
      }
    }

    it("a prepared shadow target", useShadowTargetTests.bind(null, "prepared"));
    it("a sealed shadow target",   useShadowTargetTests.bind(null, "sealed"));
    it("a frozen shadow target",   useShadowTargetTests.bind(null, "frozen"));

    function useShadowWithDefer(objOp) {
      // begin test infrastructure
      function ctor2(arg1, arg2) {
        ctor1.apply(this, [arg1]);
        this.arg2 = arg2;
      }
      ctor2.prototype = new ctor1("ctor2 base");

      var lastLogArg;
      function logTest(arg) {
        logger.info("Executing logTest");
        lastLogArg = arg;
      }

      function testListener(meta) {
        try {
          if ([p, logTest, ctor2, ctor2.prototype, a, b, c].includes(meta.target)) {
            logger.info("starting useShadowTarget");
            meta.useShadowTarget("prepared");
            logger.info("finished useShadowTarget");
          }
        }
        catch (ex) {
          meta.throwException(ex);
        }
      }

      // end test infrastructure, begin real tests

      dryHandler.addProxyListener(testListener);

      // I do special cyclic value tests with a/b/c, and A/B/C.
      var p, P, a, A, b, B, c, C;
      {
        // repeating earlier conditions
        p = new ctor2("one", logTest);

        appender.clear();

        P = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          p
        );

        logger.info(`starting ${objOp}`);
        Object[objOp](P);
        logger.info(`finished ${objOp}`);

        let messages = appender.getMessages();
        expect(messages.length).toBe(8);
        
        // P
        expect(messages[0]).toBe("starting useShadowTarget");

        // Reflect.getPrototypeOf(P)
        expect(messages[1]).toBe("starting useShadowTarget");
        expect(messages[2]).toBe("finished useShadowTarget");

        // P
        expect(messages[3]).toBe("finished useShadowTarget");
        expect(messages[4]).toBe(`starting ${objOp}`);

        // logtest, aka p.arg2, via Object.seal(P).
        expect(messages[5]).toBe("starting useShadowTarget");
        expect(messages[6]).toBe("finished useShadowTarget");

        expect(messages[7]).toBe(`finished ${objOp}`);

        let desc = Reflect.getOwnPropertyDescriptor(P, "arg2");
        expect(desc.configurable).toBe(false);
        expect("value" in desc).toBe(true);
      }

      // Cyclic object references, sealing after initial creation.
      {
        a = { objName: "a" };
        b = { objName: "b" };
        a.child = b;
        b.parent = a;

        A = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          a
        );

        Object[objOp](A);

        B = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          b
        );

        Object[objOp](B);

        expect(A.child.parent === A).toBe(true);
        expect(B.parent.child === B).toBe(true);
      }

      // Cyclic object references, sealing after all proxies' creation.
      {
        a = { objName: "a" };
        b = { objName: "b" };
        a.child = b;
        b.parent = a;

        A = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          a
        );

        B = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          b
        );

        Object[objOp](A);
        Object[objOp](B);

        expect(A.child.parent === A).toBe(true);
        expect(B.parent.child === B).toBe(true);
      }


      // really push the cyclic test a step further, for scalability testing
      {
        a = { objName: "a" };
        b = { objName: "b" };
        c = { objName: "c" };

        a.child = b;
        b.child = c;
        c.grandParent = a;

        A = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          a
        );

        B = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          b
        );

        C = membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          c
        );

        Object[objOp](A);
        Object[objOp](B);
        Object[objOp](C);

        expect(A.child.child.grandParent === A).toBe(true);
        expect(B.child.grandParent.child === B).toBe(true);
        expect(C.grandParent.child.child === C).toBe(true);
      }
    }

    it(
      "a prepared shadow target which is later sealed",
      useShadowWithDefer.bind(null, "seal")
    );

    it(
      "a prepared shadow target which is later frozen",
      useShadowWithDefer.bind(null, "freeze")
    );
  });

  describe("can stop iteration to further listeners", function() {
    var meta1, meta2;
    beforeEach(function() {
      meta1 = undefined;
      meta2 = undefined;
    });

    it("by invoking meta.stopIteration();", function() {
      function listener1(meta) {
        if (mustSkip(meta.target))
          return;

        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        logger.info("listener1: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener1: stopped = " + meta.stopped);
      }

      function listener2(meta) {
        if (mustSkip(meta.target))
          return;

        meta2 = meta;
        logger.info("listener2: stopped = " + meta.stopped);
        logger.info("listener2: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener2: stopped = " + meta.stopped);
      }

      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);

      var x = new ctor1("one");
      logger.info("x created");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      logger.info("dry(x) created");
      expect(X.label).toBe("ctor1 instance");
      expect(X).not.toBe(x);

      let messages = appender.getMessages();
      expect(messages.length).toBe(5);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1: stopped = false");
      expect(messages[2]).toBe("listener1: calling meta.stopIteration();");
      expect(messages[3]).toBe("listener1: stopped = true");
      expect(messages[4]).toBe("dry(x) created");

      expect(meta2).toBe(undefined);
      expect(typeof meta1).toBe("object");
      expect(meta1.proxy).toBe(X);
      expect(meta1.stopped).toBe(true);
    });

    it("by invoking meta.throwException(exn);", function() {
      const dummyExn = {};
      function listener1(meta) {
        if (mustSkip(meta.target))
          return;

        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        logger.info("listener1: calling meta.throwException(exn1);");
        meta.throwException(dummyExn);
        logger.info("listener1: stopped = " + meta.stopped);
      }

      function listener2(meta) {
        if (mustSkip(meta.target))
          return;

        meta2 = meta;
        logger.info("listener2: stopped = " + meta.stopped);
        logger.info("listener2: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener2: stopped = " + meta.stopped);
      }

      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);

      var x = new ctor1("one");
      logger.info("x created");
      expect(function() {
        membrane.convertArgumentToProxy(
          wetHandler,
          dryHandler,
          x
        );
      }).toThrow(dummyExn);
      logger.info("dry(x) threw");

      let messages = appender.getMessages();
      expect(messages.length).toBe(5);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1: stopped = false");
      expect(messages[2]).toBe("listener1: calling meta.throwException(exn1);");
      expect(messages[3]).toBe("listener1: stopped = true");
      expect(messages[4]).toBe("dry(x) threw");

      expect(meta2).toBe(undefined);
      expect(typeof meta1).toBe("object");
      expect(meta1.stopped).toBe(true);
    });

    it("but not by accidentally triggering an exception", function() {
      const dummyExn = {};
      function listener1(meta) {
        if (mustSkip(meta.target))
          return;
        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        throw dummyExn; // this is supposed to be an accident
      }

      function listener2(meta) {
        if (mustSkip(meta.target))
          return;
        meta2 = meta;
        logger.info("listener2: stopped = " + meta.stopped);
      }

      dryHandler.addProxyListener(listener1);
      dryHandler.addProxyListener(listener2);

      var x = new ctor1("one");
      logger.info("x created");
      var X = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        x
      );
      logger.info("dry(x) created");
      expect(X.label).toBe("ctor1 instance");
      expect(X).not.toBe(x);

      let messages = appender.getMessages();
      expect(messages.length).toBe(5);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1: stopped = false");
      expect(messages[2]).toBe(dummyExn);
      expect(messages[3]).toBe("listener2: stopped = false");
      expect(messages[4]).toBe("dry(x) created");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta2.proxy).toBe(X);
    });
  });
});
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof MembraneMocks != "function") ||
    (typeof loggerLib != "object") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, loggerLib, DAMP } = require("../../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("Function listeners", function() {
  "use strict";
  // Customize this for whatever variables you need.
  var parts, membrane, dryDocument, wetDocument, dampDocument;
  const logger = loggerLib.getLogger("test.membrane.functionlisteners");
  const appender = new loggerLib.Appender();
  appender.setThreshold("INFO");
  logger.addAppender(appender);

  const mLogger = loggerLib.getLogger("test.membrane.errors");
  const mAppender = new loggerLib.Appender();
  mAppender.setThreshold("WARN");
  mLogger.addAppender(mAppender);

  function setParts() {
    dryDocument  = parts.dry.doc;
    wetDocument  = parts.wet.doc;
    dampDocument = parts[DAMP].doc;
    membrane     = parts.membrane;
  }

  beforeEach(function() {
    parts = MembraneMocks(true, mLogger);
    setParts();
    appender.clear();
    mAppender.clear();
  });

  function clearParts() {
    dryDocument  = null;
    wetDocument  = null;
    dampDocument = null;

    membrane.getHandlerByName("dry").revokeEverything();
    membrane = null;
    parts    = null;
  }
  afterEach(clearParts);

  function TestMessage(
    cbToken, reason, trapName, fromField, toField, target, rvOrExn
  )
  {
    this.cbToken   = cbToken;
    this.reason    = reason;
    this.trapName  = trapName;
    this.fromField = fromField;
    this.toField   = toField;
    this.target    = target;
    this.rvOrExn   = rvOrExn;
  }
  TestMessage.prototype.expectEquals = function(other/*, index*/) {
    let pass = other instanceof TestMessage;
    expect(pass).toBe(true);
    if (!pass)
      return;

    Reflect.ownKeys(this).forEach((key) => {
      let t = this[key], o = other[key];
      expect(t).toBe(o);
    }, this);
  };
  TestMessage.prototype.toString = function() {
    return JSON.stringify([
      this.cbToken,
      this.reason,
      this.trapName,
      this.fromField,
      this.toField,
      this.target.name,
      this.rvOrExn
    ]);
  };
  
  function fireInfo(
    cbToken, reason, trapName, fromField, toField, target, rvOrExn
  )
  {
    var msg = new TestMessage(
      cbToken, reason, trapName, fromField, toField, target, rvOrExn
    );
    logger.info(msg);
    return appender.events.length;
  }

  const TestListeners = {
    wet0: fireInfo.bind(null, "wet0"),
    wet1: fireInfo.bind(null, "wet1"),

    dry0: fireInfo.bind(null, "dry0"),
    dry1: fireInfo.bind(null, "dry1"),

    damp: fireInfo.bind(null, "damp"),
    
    mem0: fireInfo.bind(null, "mem0"),
    mem1: fireInfo.bind(null, "mem1"),

    target: function atTarget() {
      return appender.events.length;
    }
  };

  function testMessageSequence(messages) {
    expect(messages.length).toBe(appender.events.length);
    if (messages.length === appender.events.length) {
      messages.forEach(function(m, index) {
        m.expectEquals(appender.events[index].message, index);
      });
    }
  }
  
  it(
    "on an apply call and through cross-membrane callback functions",
    function() {
      // Event listeners, basically.
      parts.dry.doc.addEventListener("applyTest", TestListeners.target, false);

      parts.membrane.addFunctionListener(TestListeners.mem0);
      parts.membrane.addFunctionListener(TestListeners.mem1);

      parts.handlers.dry.addFunctionListener(TestListeners.dry0);
      parts.handlers.dry.addFunctionListener(TestListeners.dry1);

      parts.handlers.wet.addFunctionListener(TestListeners.wet0);
      parts.handlers.wet.addFunctionListener(TestListeners.wet1);

      parts.dry.doc.dispatchEvent("applyTest");

      const messages = [
        /* entering dispatchEvent */
        new TestMessage(
          "dry0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "dry1", "enter",  "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "wet0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "wet1", "enter",  "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "mem0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "mem1", "enter",  "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),

        /* entering added event listener */
        new TestMessage(
          "wet0", "enter",  "apply", "wet", "dry",
          TestListeners.target, undefined
        ),
        new TestMessage(
          "wet1", "enter",  "apply", "wet", "dry",
          TestListeners.target, undefined
        ),
        new TestMessage(
          "dry0", "enter",  "apply", "wet", "dry",
          TestListeners.target, undefined
        ),
        new TestMessage(
          "dry1", "enter",  "apply", "wet", "dry",
          TestListeners.target, undefined
        ),
        new TestMessage(
          "mem0", "enter",  "apply", "wet", "dry",
          TestListeners.target, undefined
        ),
        new TestMessage(
          "mem1", "enter",  "apply", "wet", "dry",
          TestListeners.target, undefined
        ),

        /* exiting added event listener */
        new TestMessage(
          "wet0", "return",  "apply", "wet", "dry",
          TestListeners.target, 12
        ),
        new TestMessage(
          "wet1", "return",  "apply", "wet", "dry",
          TestListeners.target, 12
        ),
        new TestMessage(
          "dry0", "return",  "apply", "wet", "dry",
          TestListeners.target, 12
        ),
        new TestMessage(
          "dry1", "return",  "apply", "wet", "dry",
          TestListeners.target, 12
        ),
        new TestMessage(
          "mem0", "return",  "apply", "wet", "dry",
          TestListeners.target, 12
        ),
        new TestMessage(
          "mem1", "return",  "apply", "wet", "dry",
          TestListeners.target, 12
        ),

        /* exiting dispatchEvent */
        new TestMessage(
          "dry0", "return", "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "dry1", "return", "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "wet0", "return", "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "wet1", "return", "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "mem0", "return", "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        ),
        new TestMessage(
          "mem1", "return", "apply", "dry", "wet",
          parts.wet.doc.dispatchEvent, undefined
        )
      ];
      testMessageSequence(messages);
    }
  );

  it(
    "on a construct() call",
    function() {
      parts.handlers.wet.addFunctionListener(TestListeners.wet0);

      const dryElem = new parts.dry.Element(parts.dry.doc, "test");

      const messages = [
        new TestMessage(
          "wet0", "enter",  "construct", "dry", "wet",
          parts.wet.Element, undefined
        ),

        new TestMessage(
          "wet0", "return", "construct", "dry", "wet",
          parts.wet.Element, dryElem
        ),
      ];
      testMessageSequence(messages);
    }
  );

  it(
    "is ignored for object graphs not involved",
    function() {
      parts.handlers.wet.addFunctionListener(TestListeners.wet0);
      parts.handlers.dry.addFunctionListener(TestListeners.dry0);

      // ignored in the test
      parts.handlers[DAMP].addFunctionListener(TestListeners.damp);

      const dryElem = parts.dry.doc.createElement("test");

      const messages = [
        new TestMessage(
          "dry0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.createElement, undefined
        ),
        new TestMessage(
          "wet0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.createElement, undefined
        ),

        new TestMessage(
          "dry0", "return", "apply", "dry", "wet",
          parts.wet.doc.createElement, dryElem
        ),
        new TestMessage(
          "wet0", "return", "apply", "dry", "wet",
          parts.wet.doc.createElement, dryElem
        ),
      ];
      testMessageSequence(messages);
    }
  );

  it(
    "can be removed at will",
    function() {
      parts.handlers.wet.addFunctionListener(TestListeners.wet0);

      parts.handlers.dry.addFunctionListener(TestListeners.dry1);
      parts.handlers.dry.addFunctionListener(TestListeners.dry0);

      // ignored in the test
      parts.dry.doc.createElement("test");

      appender.clear();
      parts.handlers.dry.removeFunctionListener(TestListeners.dry1);

      const dryElem = parts.dry.doc.createElement("test");

      const messages = [
        new TestMessage(
          "dry0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.createElement, undefined
        ),
        new TestMessage(
          "wet0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.createElement, undefined
        ),

        new TestMessage(
          "dry0", "return", "apply", "dry", "wet",
          parts.wet.doc.createElement, dryElem
        ),
        new TestMessage(
          "wet0", "return", "apply", "dry", "wet",
          parts.wet.doc.createElement, dryElem
        ),
      ];
      testMessageSequence(messages);
    }
  );

  it(
    "can throw an exception and not interfere with other listeners or the target function",
    function() {
      const staticException = new Error("Unhandled!");

      parts.handlers.wet.addFunctionListener(TestListeners.wet0);

      parts.handlers.dry.addFunctionListener(function(reason) {
        if (reason !== "enter")
          return;
        throw staticException;
      });

      parts.handlers.dry.addFunctionListener(TestListeners.dry0);

      mAppender.clear();
      const dryElem = parts.dry.doc.createElement("test");

      const messages = [
        new TestMessage(
          "dry0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.createElement, undefined
        ),
        new TestMessage(
          "wet0", "enter",  "apply", "dry", "wet",
          parts.wet.doc.createElement, undefined
        ),

        new TestMessage(
          "dry0", "return", "apply", "dry", "wet",
          parts.wet.doc.createElement, dryElem
        ),
        new TestMessage(
          "wet0", "return", "apply", "dry", "wet",
          parts.wet.doc.createElement, dryElem
        ),
      ];
      testMessageSequence(messages);

      expect(mAppender.events.length).toBe(1);
      if (mAppender.events.length >= 1) {
        expect(mAppender.events[0].level).toBe("ERROR");
        expect(mAppender.events[0].message).toBe(staticException);
      }
    }
  );

  it(
    "notifies of exceptions thrown from the target function",
    function() {
      parts.handlers.wet.addFunctionListener(TestListeners.wet0);

      const staticException = new Error("Unhandled!");
      parts.wet.doc.generateExceptionString = function() {
        throw staticException;
      };

      parts.handlers.dry.addFunctionListener(TestListeners.dry0);

      var exception;
      try {
        parts.dry.doc.generateExceptionString();
      }
      catch (ex) {
        exception = ex;
      }
      expect(exception).toBe(staticException);

      const messages = [
        new TestMessage(
          "dry0", "enter", "apply", "dry", "wet",
          parts.wet.doc.generateExceptionString, undefined
        ),
        new TestMessage(
          "wet0", "enter", "apply", "dry", "wet",
          parts.wet.doc.generateExceptionString, undefined
        ),

        new TestMessage(
          "dry0", "throw", "apply", "dry", "wet",
          parts.wet.doc.generateExceptionString, staticException
        ),
        new TestMessage(
          "wet0", "throw", "apply", "dry", "wet",
          parts.wet.doc.generateExceptionString, staticException
        ),
      ];
      testMessageSequence(messages);
    }
  );
});
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Binding two values manually", function() {
  "use strict";
  // I'm not using the mocks here, since the concept is simple.
  const graphNames = {
    A: Symbol("A"),
    B: Symbol("B"),
    C: Symbol("C"),
    D: Symbol("D")
  };

  const values = {
    objA: { name: "objA" },
    objB: { name: "objB" },
    objC: { name: "objC" },
    objD: { name: "objD" },

    str: "values.str"
  };

  var membrane, graphA, graphB, graphC, graphD;
  beforeEach(function() {
    membrane = new Membrane();
    graphA = membrane.getHandlerByName(graphNames.A, { mustCreate: true });
    graphB = membrane.getHandlerByName(graphNames.B, { mustCreate: true });
  });
  afterEach(function() {
    graphA.revokeEverything();
    graphA = null;
    graphB.revokeEverything();
    graphB = null;

    if (graphC) {
      graphC.revokeEverything();
      graphC = null;
    }

    if (graphD) {
      graphD.revokeEverything();
      graphD = null;
    }

    membrane = null;
  });

  it("when both values are objects unknown to the membrane", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);
  });

  it("when the same value is passed in for both object graphs", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objA);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objA);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objA);
  });

  it(
    "when the first value is an object unknown to the membrane, and the second value is a primitive",
    function() {
      membrane.bindValuesByHandlers(graphA, values.objA,
                                    graphB, values.str);
      let check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
      expect(check).toBe(values.str);
    }
  );

  it(
    "when the first value is a primitive, and the second value is an object unknown to the membrane",
    function() {
      membrane.bindValuesByHandlers(graphB, values.str,
                                    graphA, values.objA);
      let check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
      expect(check).toBe(values.str);
    }
  );

  it("when both values are known in the correct graph locations", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);

    // Rerunning to make sure a theoretical no-op actually is a no-op.
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);
  });

  it(
    "when the second value is known to the membrane and the first value is an object",
    function() {
      graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
      membrane.bindValuesByHandlers(graphC, values.objC,
                                    graphB, values.objB);
      membrane.bindValuesByHandlers(graphA, values.objA,
                                    graphB, values.objB);
      let check;

      check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
      expect(check).toBe(values.objA);

      check = membrane.convertArgumentToProxy(graphC, graphA, values.objC);
      expect(check).toBe(values.objA);

      check = membrane.convertArgumentToProxy(graphC, graphB, values.objC);
      expect(check).toBe(values.objB);

      check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
      expect(check).toBe(values.objB);

      check = membrane.convertArgumentToProxy(graphB, graphC, values.objB);
      expect(check).toBe(values.objC);

      check = membrane.convertArgumentToProxy(graphA, graphC, values.objA);
      expect(check).toBe(values.objC);
    }
  );

  it("to a third object graph holding a proxy", function() {
    graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
    let objC = membrane.convertArgumentToProxy(
      graphA,
      graphC,
      values.objA
    );

    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
    expect(check).toBe(values.objB);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);

    // ensure graph B and graph C are linked properly
    let proxy = membrane.convertArgumentToProxy(graphA, graphC, values.objA);
    expect(proxy).toBe(objC);
    check = membrane.convertArgumentToProxy(graphC, graphB, proxy);
    expect(check).toBe(values.objB);

    check = membrane.convertArgumentToProxy(graphB, graphC, proxy);
    expect(check).toBe(objC);
  });

  it("when both values are objects in the membrane works", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);

    // checking for a no-op
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);
  });

  it(
    "fails when an object is already defined in the first graph's field",
    function() {
      membrane.convertArgumentToProxy(
        graphA,
        graphB,
        values.objA
      );

      expect(function() {
        membrane.bindValuesByHandlers(graphA, values.objA,
                                      graphB, values.objB);
      }).toThrow();

      // Ensure values.objB is not in the membrane.
      Reflect.ownKeys(graphNames).forEach(function(k) {
        let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
        expect(found).toBe(false);
        void(v);
      });
    }
  );

  it(
    "fails when an object is already defined in the second graph's field",
    function() {
      membrane.convertArgumentToProxy(
        graphA,
        graphB,
        values.objA
      );

      // XXX ajvincent Possibly throwing the wrong exception?
      expect(function() {
        membrane.bindValuesByHandlers(graphB, values.objB,
                                      graphA, values.objA);
      }).toThrow();

      // Ensure values.objB is not in the membrane.
      Reflect.ownKeys(graphNames).forEach(function(k) {
        let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
        expect(found).toBe(false);
        void(v);
      });
    }
  );

  it(
    "fails when an object is passed in for the wrong object graph",
    function() {
      graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
      membrane.convertArgumentToProxy(
        graphA,
        graphC,
        values.objA
      );

      expect(function() {
        membrane.bindValuesByHandlers(graphC, values.objA,
                                      graphB, values.objB);
      }).toThrow();

      // Ensure values.objB is not in the membrane.
      Reflect.ownKeys(graphNames).forEach(function(k) {
        let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
        expect(found).toBe(false);
        void(v);
      });
    }
  );

  it("fails when both values are primitive", function() {
    expect(function() {
      membrane.bindValuesByHandlers(graphA, values.strA,
                                    graphB, "Goodbye");
    }).toThrow();

    // we can't look up primitives in the membrane.
  });

  it("fails when trying to join two sets of object graphs", function() {
    graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
    graphD = membrane.getHandlerByName(graphNames.D, { mustCreate: true });

    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);

    membrane.bindValuesByHandlers(graphC, values.objC,
                                  graphD, values.objD);

    expect(function() {
      membrane.bindValuesByHandlers(graphC, values.objC,
                                    graphA, values.objA);
    }).toThrow();
  });
});
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Primordial values", function() {
  "use strict";
  const MUSTCREATE = Object.freeze({ mustCreate: true });
  const topValues = [
    /* explicitly testing for prototypes passing through */
    Object.prototype, Function.prototype, Array.prototype,
    /* testing common primordials as well */
    Object, Function, Array, Date, Map, Set, WeakMap, WeakSet
  ];
  var passThrough;
  {
    const pSet = new Set(Membrane.Primordials);
    passThrough = pSet.has.bind(pSet);
  }

  it("are available on the Membrane as a frozen array", function() {
    expect(Array.isArray(Membrane.Primordials)).toBe(true);
    expect(Object.isFrozen(Membrane.Primordials)).toBe(true);
    {
      let desc = Reflect.getOwnPropertyDescriptor(Membrane, "Primordials");
      expect(desc.writable).toBe(false);
      expect(desc.configurable).toBe(false);
    }

    if (!Array.isArray(Membrane.Primordials))
      return;

    topValues.forEach(function(k) {
      expect(Membrane.Primordials.includes(k)).toBe(true);
    });
  });

  it("can pass through all object graphs, if requested", function() {
    const membrane = new Membrane({passThroughFilter: passThrough});
    const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
    const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });

    let wetObj = {};
    let dryObj = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetObj);
    expect(dryObj).not.toBe(wetObj);
  });

  it("can pass through specific object graphs, if requested", function() {
    const membrane = new Membrane();
    const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
    const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

    wetHandler.passThroughFilter = passThrough;
    dryHandler.passThroughFilter = passThrough;

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });
  });

  it("are available through DistortionsListener instances", function() {
    const membrane = new Membrane();
    const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
    const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

    let wetDL = membrane.modifyRules.createDistortionsListener();
    wetDL.ignorePrimordials();
    wetDL.bindToHandler(wetHandler);

    let dryDL = membrane.modifyRules.createDistortionsListener();
    dryDL.ignorePrimordials();
    dryDL.bindToHandler(dryHandler);

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });
  });
});
/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("DistortionsListener", function() {
  var parts;
  beforeEach(function() {
    parts = {
      wet: {},
      dry: {},
      handlers: {
        wet: null,
        dry: null,
      },
      membrane: new Membrane(),
      distortions: null,
      bindDry: function() {
        this.distortions.bindToHandler(this.handlers.dry);
      },
      updateKeys: function() {
        let keys = Reflect.ownKeys(this.wet);
        keys.forEach(function(k) {
          if (k in this.dry)
            return;
          this.dry[k] = this.membrane.convertArgumentToProxy(
            this.handlers.wet,
            this.handlers.dry,
            this.wet[k]
          );
        }, this);
      },
      config: null
    };

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );

    parts.distortions = parts.membrane.modifyRules.createDistortionsListener();
    parts.config = parts.distortions.sampleConfig(true);
    // disable the set trap
    parts.config.proxyTraps.splice(parts.config.proxyTraps.indexOf("set"), 1);
  });

  afterEach(function() {
    parts = null;
  });

  describe(".prototype.addListener", function() {
    it("for a function as a value", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";
      parts.distortions.addListener(parts.wet.A, "value", parts.config);
      parts.bindDry();
      parts.updateKeys();

      expect(parts.dry.A.color).toBe("red");
      expect(function() {
        parts.dry.A.fontSize = "12px";
      }).toThrow();
      expect("fontSize" in parts.wet.A).toBe(false);

      parts.wet.B = function() {};
      parts.wet.B.color = "blue";
      parts.distortions.addListener(parts.wet.B, "value", parts.config);
      parts.distortions.removeListener(parts.wet.B, "value");
      parts.updateKeys();

      expect(parts.dry.B.color).toBe("blue");
      expect(function() {
        parts.dry.B.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.B).toBe(true);
    });

    it("for a function's prototype", function() {
      {
        parts.wet.A = function() {};
        parts.wet.A.prototype.color = "red";
        parts.distortions.addListener(parts.wet.A, "prototype", parts.config);
        parts.bindDry();
        parts.updateKeys();

        expect(parts.dry.A.prototype.color).toBe("red");
        expect(function() {
          parts.dry.A.prototype.fontSize = "12px";
        }).toThrow();
        expect("fontSize" in parts.wet.A.prototype).toBe(false);
      }

      {
        parts.wet.B = function() {};
        parts.wet.B.prototype.color = "blue";
        parts.distortions.addListener(parts.wet.B, "prototype", parts.config);
        parts.distortions.removeListener(parts.wet.B, "prototype");
        parts.updateKeys();

        expect(parts.dry.B.prototype.color).toBe("blue");
        expect(function() {
          parts.dry.B.prototype.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.B.prototype).toBe(true);
      }

      // This is about using "value" versus "prototype" in the second argument.
      {
        parts.wet.C = function() {};
        parts.wet.C.prototype.color = "green";
        parts.distortions.addListener(
          parts.wet.C.prototype, "value", parts.config
        );
        parts.distortions.removeListener(parts.wet.C, "prototype");
        parts.updateKeys();

        expect(parts.dry.C.prototype.color).toBe("green");
        expect(function() {
          parts.dry.C.prototype.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.C.prototype).toBe(true);
      }

      {
        parts.wet.D = function() {};
        parts.wet.D.prototype.color = "yellow";
        parts.distortions.addListener(parts.wet.D, "prototype", parts.config);
        parts.distortions.removeListener(parts.wet.D.prototype, "value");
        parts.updateKeys();

        expect(parts.dry.D.prototype.color).toBe("yellow");
        expect(function() {
          parts.dry.D.prototype.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.D.prototype).toBe(true);
      }
    });

    it("for instances of a constructor function", function() {
      {
        parts.wet.A = function() {};
        parts.wet.A.prototype.color = "red";
        parts.wet.a = new parts.wet.A();
        parts.wet.a.fontFamily = "Verdana";
        parts.distortions.addListener(parts.wet.A, "instance", parts.config);
        
        parts.bindDry();
        parts.updateKeys();

        expect(parts.dry.a.color).toBe("red");
        expect(function() {
          parts.dry.a.fontSize = "12px";
        }).toThrow();
        expect("fontSize" in parts.wet.a).toBe(false);

        parts.distortions.removeListener(parts.wet.A, "instance");
        parts.wet.b = new parts.wet.A();
        parts.wet.b.fontFamily = "Times New Roman";
        parts.updateKeys();

        expect(parts.dry.b.color).toBe("red");
        expect(function() {
          parts.dry.b.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.b).toBe(true);
      }
    });

    it("for an iterable list of values", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";

      const B = function() {};
      B.color = "blue";

      const C = function() {};
      C.color = "green";

      const D = function() {};
      D.color = "yellow";

      parts.distortions.addListener(
        [parts.wet.A, B, C, D], "iterable", parts.config
      );
      parts.bindDry();
      parts.updateKeys();

      expect(parts.dry.A.color).toBe("red");
      expect(function() {
        parts.dry.A.fontSize = "12px";
      }).toThrow();
      expect("fontSize" in parts.wet.A).toBe(false);

      parts.wet.B = B;
      parts.wet.C = C;
      parts.distortions.removeListener([B, C], "iterable");
      parts.updateKeys();

      expect(parts.dry.B.color).toBe("blue");
      expect(function() {
        parts.dry.B.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.B).toBe(true);

      expect(parts.dry.C.color).toBe("green");
      expect(function() {
        parts.dry.C.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.C).toBe(true);
      
      parts.wet.D = D;
      parts.distortions.removeListener(D, "value");
      parts.updateKeys();

      expect(parts.dry.D.color).toBe("yellow");
      expect(function() {
        parts.dry.D.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.D).toBe(true);
    });

    it("for a filterable list of values", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";

      const B = function() {};
      B.color = "blue";

      const items = new Set([parts.wet.A, B]);
      const filter = function(meta) {
        return items.has(meta.target);
      };

      parts.distortions.addListener(
        filter, "filter", parts.config
      );
      parts.bindDry();
      parts.updateKeys();

      expect(parts.dry.A.color).toBe("red");
      expect(function() {
        parts.dry.A.fontSize = "12px";
      }).toThrow();
      expect("fontSize" in parts.wet.A).toBe(false);

      parts.wet.B = B;
      items.delete(B);
      parts.updateKeys();

      expect(parts.dry.B.color).toBe("blue");
      expect(function() {
        parts.dry.B.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.B).toBe(true);
    });
  });
});
"use strict"

if ((typeof MembraneMocks != "function") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, DAMP } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Storing unknown properties locally", function() {
  function fixKeys(keys) {
    if (keys.includes("membraneGraphName"))
      keys.splice(keys.indexOf("membraneGraphName"), 1);
  }

  // Customize this for whatever variables you need.
  var parts, membrane, dryRoot, wetRoot, dampRoot;
  beforeEach(function() {
    parts = MembraneMocks(true);
    dryRoot  = parts.dry.doc.rootElement;
    wetRoot  = parts.wet.doc.rootElement;
    dampRoot = parts[DAMP].doc.rootElement;
    membrane = parts.membrane;
  });
  afterEach(function() {
    dryRoot  = null;
    wetRoot  = null;
    dampRoot = null;
    membrane = null;
    parts    = null;
  });

  function addUnknownPropertySpecs() {
    it(
      "defineProperty stores a value on the dry graph only",
      function() {
        let x = { isExtra: true };
        let xDesc = { value: x, writable: true, enumerable: true, configurable: true };
        {
          let np = parts.dry.Node.prototype;
          Reflect.defineProperty(np, "extra", xDesc);
        }

        {
          let np = parts.wet.Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(false);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).toBe(undefined);
          expect(Reflect.has(np, "extra")).toBe(false);
          expect(Reflect.get(np, "extra")).toBe(undefined);
          let root = parts.wet.doc.rootElement;
          expect(Reflect.has(root, "extra")).toBe(false);
          expect(Reflect.get(root, "extra")).toBe(undefined);
        }

        {
          let np = parts[DAMP].Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(false);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).toBe(undefined);
          expect(Reflect.has(np, "extra")).toBe(false);
          expect(Reflect.get(np, "extra")).toBe(undefined);
          let root = parts[DAMP].doc.rootElement;
          expect(Reflect.has(root, "extra")).toBe(false);
          expect(Reflect.get(root, "extra")).toBe(undefined);
        }

        {
          let np = parts.dry.Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(true);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).not.toBe(undefined);
          if (desc) {
            expect(desc.value).toBe(x);
            expect(desc.writable).toBe(true);
            expect(desc.enumerable).toBe(true);
            expect(desc.configurable).toBe(true);
          }
          expect(Reflect.has(np, "extra")).toBe(true);
          expect(Reflect.get(np, "extra")).toBe(x);
          let root = parts.dry.doc.rootElement;
          expect(Reflect.has(root, "extra")).toBe(true);
          expect(Reflect.get(np, "extra")).toBe(x);
        }
      }
    );

    it(
      "defineProperty replaces a value on the dry graph only",
      function() {
        // store the value as a data descriptor
        let y = { isExtra: 1 };
        let yDesc = { value: y, writable: true, enumerable: true, configurable: true };
        {
          let np = parts.dry.Node.prototype;
          Reflect.defineProperty(np, "extra", yDesc);
        }
        
        // store another value with the same name on the data descriptor
        let x = { isExtra: true };
        let xDesc = { value: x, writable: true, enumerable: true, configurable: true };
        {
          let np = parts.dry.Node.prototype;
          Reflect.defineProperty(np, "extra", xDesc);
        }

        {
          let np = parts.wet.Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(false);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).toBe(undefined);
          expect(Reflect.has(np, "extra")).toBe(false);
          expect(Reflect.get(np, "extra")).toBe(undefined);
          let root = parts.wet.doc.rootElement;
          expect(Reflect.has(root, "extra")).toBe(false);
          expect(Reflect.get(root, "extra")).toBe(undefined);
        }

        {
          let np = parts[DAMP].Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(false);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).toBe(undefined);
          expect(Reflect.has(np, "extra")).toBe(false);
          expect(Reflect.get(np, "extra")).toBe(undefined);
          let root = parts[DAMP].doc.rootElement;
          expect(Reflect.has(root, "extra")).toBe(false);
          expect(Reflect.get(root, "extra")).toBe(undefined);
        }

        {
          let np = parts.dry.Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(true);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).not.toBe(undefined);
          if (desc) {
            expect(desc.value).toBe(x);
            expect(desc.writable).toBe(true);
            expect(desc.enumerable).toBe(true);
            expect(desc.configurable).toBe(true);
          }
          expect(Reflect.has(np, "extra")).toBe(true);
          expect(Reflect.get(np, "extra")).toBe(x);
          let root = parts.dry.doc.rootElement;
          expect(Reflect.has(root, "extra")).toBe(true);
          expect(Reflect.get(np, "extra")).toBe(x);
        }
      }
    );

    it(
      "defineProperty preserves the order of inserted values",
      function() {
        // Insert three values on the dry graph.
        let firstKeySet = Reflect.ownKeys(dryRoot);
        fixKeys(firstKeySet);

        // Here, we care if the dryRoot is extensible, not the wetRoot.
        const isDryExtensible = Reflect.isExtensible(dryRoot);
        function addProps() {
          Object.defineProperties(dryRoot, {
            "factoids": {
              value: {
                statesInTheUSA: 50,
                baseballTeams: 30
              },
              writable: true,
              enumerable: true,
              configurable: true
            },
            "timestamp": {
              value: new Date(),
              writable: true,
              enumerable: true,
              configurable: true
            },
            "authorName": {
              value: "John Doe",
              writable: true,
              enumerable: true,
              configurable: true
            }
          });
        }
        if (isDryExtensible)
          addProps();
        else
          expect(addProps).toThrow();

        // Ensure Reflect.ownKeys puts the inserted values at the end.
        let keySet = Reflect.ownKeys(dryRoot);
        fixKeys(keySet);

        var expectedLength = firstKeySet.length;
        if (isDryExtensible)
          expectedLength += 3;

        expect(keySet.length).toBe(expectedLength);
        for (let i = 0; i < firstKeySet.length; i++) {
          expect(keySet[i]).toBe(firstKeySet[i]);
        }
        keySet = keySet.slice(firstKeySet.length);

        if (isDryExtensible) {
          expect(keySet[0]).toBe("factoids");
          expect(keySet[1]).toBe("timestamp");
          expect(keySet[2]).toBe("authorName");
        }

        // Insert a value on the wet graph.
        const isWetExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(wetRoot, "extra", {
          value: { isExtra: true },
          writable: true,
          enumerable: true,
          configurable: true
        });
        if (isWetExtensible && isDryExtensible)
          expectedLength++;

        // Ensure the new wet graph's key precedes the dry graph keys.
        keySet = Reflect.ownKeys(dryRoot);
        fixKeys(keySet);
        expect(keySet.length).toBe(expectedLength);
        for (let i = 0; i < firstKeySet.length; i++) {
          expect(keySet[i]).toBe(firstKeySet[i]);
        }
        keySet = keySet.slice(firstKeySet.length);

        if (isWetExtensible && isDryExtensible) {
          expect(keySet[0]).toBe("extra");
          keySet.shift();
        }

        if (isDryExtensible) {
          expect(keySet[0]).toBe("factoids");
          expect(keySet[1]).toBe("timestamp");
          expect(keySet[2]).toBe("authorName");
        }
      }
    );

    it(
      "defineProperty will not mask existing properties of the wet object graph",
      function() {
        const isWetExtensible = Reflect.isExtensible(wetRoot);
        const isDryExtensible = Reflect.isExtensible(dryRoot);

        Reflect.defineProperty(dryRoot, "nodeType", {
          value: 0,
          enumerable: true,
          writable: false,
          configurable: true
        });

        expect(function() {
          void(dryRoot.nodeType);
        }).not.toThrow();

        expect(wetRoot.nodeType).toBe(isWetExtensible && isDryExtensible ? 0 : 1);

        Reflect.defineProperty(wetRoot, "nodeType", {
          value: 15,
          enumerable: true,
          writable: false,
          configurable: true
        });

        expect(function() {
          void(dryRoot.nodeType);
        }).not.toThrow();

        let value = isDryExtensible && isWetExtensible ? 15 : 1;
        expect(dryRoot.nodeType).toBe(value);
      }
    );

    it(
      "defineProperty works when the property is not configurable",
      function() {
        const isDryExtensible = Reflect.isExtensible(dryRoot);
        let defined = Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: false
        });
        expect(defined).toBe(isDryExtensible);
        let extra = dryRoot.extra;
        expect(extra).toBe(defined ? 1 : undefined);
      }
    );

    describe(
      "defineProperty works correctly with previously defined accessor descriptors",
      function() {
        it("on the wet object graph", function() {
          parts.dry.doc.baseURL = "about:blank";
          expect(parts.wet.doc.baseURL).toBe("about:blank");
        });

        it("on the dry object graph", function() {
          var local = "one";
          // This isn't the test.
          Reflect.defineProperty(dryRoot, "localProp", {
            get: function() { return local; },
            set: function(val) { local = val; },
            enumerable: true,
            configurable: true
          });

          // extra test:  did localProp make it to wetRoot?
          expect(Reflect.getOwnPropertyDescriptor(wetRoot, "localProp"))
                .toBe(undefined);

          // This is what we're really testing.
          const isDryExtensible = Reflect.isExtensible(dryRoot);
          Reflect.defineProperty(dryRoot, "localProp", {
            value: "two",
            writable: true,
            enumerable: false,
            configurable: true
          });
          expect(dryRoot.localProp).toBe(isDryExtensible ? "two" : undefined);
          expect(Reflect.getOwnPropertyDescriptor(wetRoot, "localProp"))
                .toBe(undefined);
        });
      }
    );

    /* http://www.ecma-international.org/ecma-262/7.0/#sec-proxy-object-internal-methods-and-internal-slots-defineownproperty-p-desc
     * [[DefineOwnProperty]] for proxy objects enforces the following invariants:
     *   A property cannot be added, if the target object is not extensible.
     *
     * In Firefox, this throws an exception.  So to make this work, we need to
     * replace the target at proxy creation with a "shadow target" that will
     * pass typeof tests (for function calls), and maintains its own
     * extensibility settings.
     */
    it(
      "defineProperty does nothing when the proxy is not extensible",
      function() {
        Object.preventExtensions(dryRoot);
        let firstKeySet = Reflect.ownKeys(dryRoot);
        fixKeys(firstKeySet);
        let x = { isExtra: true };
        let xDesc = { value: x, writable: true, enumerable: true, configurable: true };
        let defined = Reflect.defineProperty(dryRoot, "extra", xDesc);
        expect(defined).toBe(false);

        let keySet = Reflect.ownKeys(dryRoot);
        fixKeys(keySet);
        expect(keySet.length).toBe(firstKeySet.length);
        for (let i = 0; i < firstKeySet.length; i++) {
          expect(keySet[i]).toBe(firstKeySet[i]);
        }
      }
    );

    it(
      "defineProperty called on the wet graph for the same name does not override the dry graph",
      function() {
        const isDryExtensible = Reflect.isExtensible(dryRoot);
        Reflect.defineProperty(dryRoot, "firstExtra", {
          value: 1,
          writable: true,
          enumerable: true,
          configurable: true
        });

        Reflect.defineProperty(dryRoot, "secondExtra", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(typeof wetRoot.firstExtra).toBe("undefined");
        expect(typeof wetRoot.secondExtra).toBe("undefined");

        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1 : undefined);
        expect(dryRoot.secondExtra).toBe(isDryExtensible ? 2 : undefined);

        Reflect.defineProperty(wetRoot, "secondExtra", {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1 : undefined);
        expect(dryRoot.secondExtra).toBe(isDryExtensible ? 2 : 0);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(isDryExtensible);
        expect(keys.includes("secondExtra")).toBe(isDryExtensible);
      }
    );

    it(
      "defineProperty called on the damp graph for the same name does not override the dry graph",
      function() {
        const isDryExtensible  = Reflect.isExtensible(dryRoot);
        Reflect.defineProperty(dryRoot, "firstExtra", {
          value: 1,
          writable: true,
          enumerable: true,
          configurable: true
        });

        Reflect.defineProperty(dryRoot, "secondExtra", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(typeof dampRoot.firstExtra).toBe("undefined");
        expect(typeof dampRoot.secondExtra).toBe("undefined");

        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1 : undefined);
        expect(dryRoot.secondExtra).toBe(isDryExtensible ? 2 : undefined);

        Reflect.defineProperty(dampRoot, "secondExtra", {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1: undefined);

        let value;
        if (isDryExtensible) {
          value = 2;
        }
        else if (parts.wetIsLocal) {
          /* This means that all proxies store their values locally:  a change
           * to dampRoot.secondExtra does not affect wetRoot.secondExtra or
           * dryRoot.secondExtra.
           */
          value = undefined;
        }
        else {
          value = 0;
        }
        expect(dryRoot.secondExtra).toBe(value);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(isDryExtensible);
        expect(keys.includes("secondExtra")).toBe(isDryExtensible);
      }
    );

    it(
      "deleteProperty on the dry graph deletes from both the dry graph and the wet graph",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: true,
          configurable: true
        });

        Reflect.defineProperty(wetRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(Reflect.deleteProperty(dryRoot, "extra")).toBe(true);

        expect(typeof dryRoot.extra).toBe("undefined");
        expect(typeof wetRoot.extra).toBe("undefined");
      }
    );

    it(
      "deleteProperty called on the wet graph does not override the dry graph",
      function() {
        const isWetExtensible = Reflect.isExtensible(wetRoot);
        const isDryExtensible = Reflect.isExtensible(dryRoot);
        Reflect.defineProperty(dryRoot, "firstExtra", {
          value: 1,
          writable: true,
          enumerable: true,
          configurable: true
        });
        Reflect.defineProperty(wetRoot, "firstExtra", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(wetRoot.firstExtra).toBe(isWetExtensible ? 2 : undefined);
        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1 : 2);

        Reflect.deleteProperty(wetRoot, "firstExtra");
        expect(typeof wetRoot.firstExtra).toBe("undefined");
        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1 : undefined);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(isDryExtensible);
      }
    );

    it(
      "deleteProperty called on the damp graph does not override the dry graph",
      function() {
        const isDampExtensible = Reflect.isExtensible(dampRoot);
        const isDryExtensible  = Reflect.isExtensible(dryRoot);
        Reflect.defineProperty(dryRoot, "firstExtra", {
          value: 1,
          writable: true,
          enumerable: true,
          configurable: true
        });
        Reflect.defineProperty(dampRoot, "firstExtra", {
          value: 2,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(dampRoot.firstExtra).toBe(isDampExtensible ? 2 : undefined);

        let value;
        if (isDryExtensible) {
          value = 1;
        }
        else if (parts.wetIsLocal) {
          /* This means that all proxies store their values locally:  a change
           * to dampRoot.secondExtra does not affect wetRoot.secondExtra or
           * dryRoot.secondExtra.
           */
          value = undefined;
        }
        else {
          value = 2;
        }
        expect(dryRoot.firstExtra).toBe(value);

        Reflect.deleteProperty(dampRoot, "firstExtra");
        expect(typeof dampRoot.firstExtra).toBe("undefined");
        expect(dryRoot.firstExtra).toBe(isDryExtensible ? 1 : undefined);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(isDryExtensible);
      }
    );

    describe(
      "deleteProperty works correctly with previously defined accessor descriptors",
      function() {

        it("on the wet object graph", function() {
          var local = "one";
          // This isn't the test.
          Reflect.defineProperty(wetRoot, "localProp", {
            get: function() { return local; },
            set: function(val) { local = val; },
            enumerable: true,
            configurable: true
          });

          expect(Reflect.deleteProperty(wetRoot, "localProp")).toBe(true);
          expect(Reflect.getOwnPropertyDescriptor(dryRoot, "localProp"))
                .toBe(undefined);
          expect(Reflect.getOwnPropertyDescriptor(wetRoot, "localProp"))
                .toBe(undefined);
        });

        it("on the dry object graph", function() {
          var local = "one";
          const isWetExtensible = Reflect.isExtensible(wetRoot);
          // This isn't the test.
          Reflect.defineProperty(wetRoot, "localProp", {
            get: function() { return local; },
            set: function(val) { local = val; },
            enumerable: true,
            configurable: true
          });
          expect(dryRoot.localProp).toBe(isWetExtensible ? "one" : undefined);

          // This is what we're really testing.
          expect(Reflect.deleteProperty(dryRoot, "localProp")).toBe(true);
          expect(Reflect.getOwnPropertyDescriptor(dryRoot, "localProp"))
                .toBe(undefined);
          expect(Reflect.getOwnPropertyDescriptor(wetRoot, "localProp"))
                .toBe(undefined);
        });
      }
    );

    describe(
      "set stores unknown properties locally on the dry graph, unwrapped",
      function() {
        const x = { isExtra: true };
        function setter() {
          dryRoot.extra = x;
        }

        it(
          "when the object doesn't have a descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            if (isDryExtensible)
              setter();
            else
              expect(setter).toThrow();

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );

        it(
          "when the object has a direct data descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            Reflect.defineProperty(dryRoot, "extra", {
              value: { isExtra: 1 },
              writable: true,
              enumerable: true,
              configurable: true
            });

            if (isDryExtensible)
              setter();
            else
              expect(setter).toThrow();

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );

        it(
          "when the object has a direct accessor descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            let extraValue = 1;
            Reflect.defineProperty(dryRoot, "extra", {
              get: function() { return extraValue; },
              set: function(val) { extraValue = val; },
              enumerable: true,
              configurable: true
            });

            if (isDryExtensible)
              setter();
            else
              expect(setter).toThrow();

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );

        it(
          "when the object has a locally inherited data descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            Reflect.defineProperty(parts.dry.Node.prototype, "extra", {
              value: { isExtra: 1 },
              writable: true,
              enumerable: true,
              configurable: true
            });

            if (isDryExtensible)
              setter();
            else
              expect(setter).toThrow();

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );

        it(
          "when the object has a proxied inherited data descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            let y = { isExtra: 1 };
            Reflect.defineProperty(parts.wet.Node.prototype, "extra", {
              value: y,
              writable: true,
              enumerable: true,
              configurable: true
            });

            if (isDryExtensible)
              setter();
            else
              expect(setter).toThrow();

            let wetGetExtra = Reflect.get(wetRoot, "extra");
            expect(wetGetExtra === y).toBe(true);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );


        it(
          "when the object has a locally inherited accessor descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            let extraValue = 1;
            Reflect.defineProperty(parts.dry.Node.prototype, "extra", {
              get: function() { return extraValue; },
              set: function(val) { extraValue = val; },
              enumerable: true,
              configurable: true
            });

            setter();

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );

        it(
          "when the object has a proxied inherited accessor descriptor with that name",
          function() {
            const isDryExtensible = Reflect.isExtensible(dryRoot);
            let extraValue = 1;
            Reflect.defineProperty(parts.wet.Node.prototype, "extra", {
              get: function() { return extraValue; },
              set: function(val) { extraValue = val; },
              enumerable: true,
              configurable: true
            });

            setter();

            let wetGetExtra = Reflect.get(wetRoot, "extra");
            expect(wetGetExtra === 1).toBe(true);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(isDryExtensible);
          }
        );
      }
    );

    it(
      "deleteProperty followed by .defineProperty is consistent with new properties",
      function() {
        const isDryExtensible = Reflect.isExtensible(dryRoot);
        // define the property on the dry graph
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          enumerable: true,
          writable: false,
          configurable: true
        });

        // delete the property on the dry graph
        Reflect.deleteProperty(dryRoot, "extra");

        // define the property on the dry graph, differently
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          enumerable: true,
          writable: false,
          configurable: true
        });

        // define the property on the wet graph
        Reflect.defineProperty(wetRoot, "extra", {
          value: 15,
          enumerable: true,
          writable: false,
          configurable: true
        });

        // ensure the property on the dry graph takes precedence
        expect(dryRoot.extra).toBe(isDryExtensible ? 2 : 15);
      }
    );

    it(
      "deleteProperty followed by .defineProperty is consistent with predefined properties",
      function() {
        // Remember, nodeType is inherited from parts.wet.Element.prototype.
        const isWetExtensible = Reflect.isExtensible(wetRoot);
        const isDryExtensible = Reflect.isExtensible(dryRoot);

        // delete the property on the dry graph
        Reflect.deleteProperty(dryRoot, "nodeType");

        // define the property on the dry graph
        Reflect.defineProperty(dryRoot, "nodeType", {
          value: 2,
          enumerable: true,
          writable: false,
          configurable: true
        });

        // define the property on the wet graph
        Reflect.defineProperty(wetRoot, "nodeType", {
          value: 15,
          enumerable: true,
          writable: false,
          configurable: true
        });

        // ensure the property on the dry graph takes precedence
        expect(dryRoot.nodeType).toBe((isWetExtensible && isDryExtensible) ? 2 : 1);
      }
    );
  }

  function specsWithSealAndFreezeOptions() {
    describe(
      "on unsealed objects, ObjectGraphHandler(dry).",
      addUnknownPropertySpecs
    );

    describe("on sealed objects, ObjectGraphHandler(dry).", function() {
      addUnknownPropertySpecs();
      beforeEach(function() {
        Object.seal(wetRoot);
      });
    });

    describe("on sealed proxies, ObjectGraphHandler(dry).", function() {
      addUnknownPropertySpecs();
      beforeEach(function() {
        Object.seal(dryRoot);
      });
    });

    describe("on frozen objects, ObjectGraphHandler(dry).", function() {
      addUnknownPropertySpecs();
      beforeEach(function() {
        Object.freeze(wetRoot);
      });
    });

    describe("on frozen proxies, ObjectGraphHandler(dry).", function() {
      addUnknownPropertySpecs();
      beforeEach(function() {
        Object.freeze(dryRoot);
      });
    });
  }

  describe("when required by the dry object graph, ", function() {
    beforeEach(function() {
      membrane.modifyRules.storeUnknownAsLocal("dry", parts.dry.Node.prototype);
    });
    specsWithSealAndFreezeOptions();
  });

  describe("when required by the wet object graph, ", function() {
    beforeEach(function() {
      parts.handlers.wet.ensureMapping(parts.wet.Node.prototype);
      membrane.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node.prototype);
      parts.wetIsLocal = true;
    });
    
    specsWithSealAndFreezeOptions();
  });

  describe(
    "when required by both the wet and the dry object graphs, ",
    function() {
      beforeEach(function() {
        parts.handlers.wet.ensureMapping(parts.wet.Node.prototype);
        membrane.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node.prototype);
        membrane.modifyRules.storeUnknownAsLocal("dry", parts.dry.Node.prototype);
        parts.wetIsLocal = true;
      });

      specsWithSealAndFreezeOptions();
    }
  );

  describe("when required by the damp object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.modifyRules.storeUnknownAsLocal(DAMP, parts[DAMP].Node.prototype);
    });
    it("defineProperty refers to the original object graph", function() {
      Reflect.defineProperty(dryRoot, "extra", {
        value: 15,
        enumerable: true,
        writable: false,
        configurable: true
      });

      let wetExtra = wetRoot.extra;
      expect(wetExtra).toBe(15);

      let dampExtra = dampRoot.extra;
      expect(dampExtra).toBe(15);

      let dryExtra = dryRoot.extra;
      expect(dryExtra).toBe(15);
    });

    it("deleteProperty refers to the original object graph", function() {
      expect(Reflect.deleteProperty(dryRoot, "nodeName")).toBe(true);
      expect(Reflect.has(wetRoot, "nodeName")).toBe(false);
      expect(Reflect.has(dryRoot, "nodeName")).toBe(false);
      expect(Reflect.has(dampRoot, "nodeName")).toBe(false);
    });

    it("set refers to the original object graph", function() {
      dryRoot.extra = 15;

      let wetExtra = wetRoot.extra;
      expect(wetExtra).toBe(15);

      let dampExtra = dampRoot.extra;
      expect(dampExtra).toBe(15);

      let dryExtra = dryRoot.extra;
      expect(dryExtra).toBe(15);
    });
  });

  it("requires a value or proxy already known to the membrane", function() {
    expect(function() {
      membrane.modifyRules.storeUnknownAsLocal("wet", {});
    }).toThrow();
    expect(function() {
      membrane.modifyRules.storeUnknownAsLocal("dry", {});
    }).toThrow();
  });

  it(
    "and then applying a seal() operation on the proxy still works",
    function() {
      /* This is an order-of-operations test:  unlike the above tests, which
       * may seal the dryRoot before the defineProperty operation, this test
       * sets the property and then seals the dryRoot.
       */

      membrane.modifyRules.storeUnknownAsLocal("dry", parts.dry.Node.prototype);
      Reflect.defineProperty(dryRoot, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });

      Object.seal(dryRoot);

      expect(dryRoot.extra).toBe(1);
      expect(wetRoot.extra).toBe(undefined);
    }
  );

  it(
    "and then applying a freeze() operation on the proxy still works",
    function() {
      /* This is an order-of-operations test:  unlike the above tests, which
       * may seal the dryRoot before the defineProperty operation, this test
       * sets the property and then seals the dryRoot.
       */

      membrane.modifyRules.storeUnknownAsLocal("dry", parts.dry.Node.prototype);
      Reflect.defineProperty(dryRoot, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });

      Object.freeze(dryRoot);

      expect(dryRoot.extra).toBe(1);
      expect(wetRoot.extra).toBe(undefined);
    }
  );
});
"use strict"

if ((typeof MembraneMocks != "function") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, DAMP } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Deleting properties locally", function() {
  // Customize this for whatever variables you need.
  var parts, membrane, dryRoot, wetRoot, dampRoot;
  beforeEach(function() {
    parts = MembraneMocks(true);
    dryRoot  = parts.dry.doc.rootElement;
    wetRoot  = parts.wet.doc.rootElement;
    dampRoot = parts[DAMP].doc.rootElement;
    membrane = parts.membrane;
  });

  afterEach(function() {
    dryRoot  = null;
    wetRoot  = null;
    dampRoot = null;
    membrane = null;
    parts    = null;
  });

  function checkProperties(expectedDryExtra) {
    const extraDryAsBool = Boolean(expectedDryExtra);
    const expectedWetExtra = (arguments.length > 1) ? arguments[1] : 1;
    const extraWetAsBool = Boolean(expectedWetExtra);
    {
      let keys = Reflect.ownKeys(dryRoot);
      expect(keys.includes("extra")).toBe(extraDryAsBool);
    }

    {
      let keys = Reflect.ownKeys(wetRoot);
      expect(keys.includes("extra")).toBe(extraWetAsBool);
    }

    {
      let desc = Reflect.getOwnPropertyDescriptor(dryRoot, "extra");
      let expectation = expect(desc);
      if (extraDryAsBool)
        expectation = expectation.not;
      expectation.toBe(undefined);
      if (extraDryAsBool && desc)
        expect(desc.value).toBe(expectedDryExtra);
    }

    {
      let desc = Reflect.getOwnPropertyDescriptor(wetRoot, "extra");
      let expectation = expect(desc);
      if (extraWetAsBool)
        expectation = expectation.not;
      expectation.toBe(undefined);
      if (extraWetAsBool && desc)
        expect(desc.value).toBe(expectedWetExtra);
    }

    {
      let found = Reflect.has(dryRoot, "extra");
      expect(found).toBe(extraDryAsBool);
    }

    {
      let found = Reflect.has(wetRoot, "extra");
      expect(found).toBe(extraWetAsBool);
    }

    {
      let val = Reflect.get(dryRoot, "extra");
      expect(val).toBe(expectedDryExtra);
    }

    {
      let val = Reflect.get(wetRoot, "extra");
      expect(val).toBe(expectedWetExtra);
    }
  }

  function requireLocalDeleteSpecs() {
    it("deleteProperty() removes a configurable property locally", function() {
      const isExtensible = Reflect.isExtensible(wetRoot);
      Reflect.defineProperty(dryRoot, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });

      {
        let deleted = Reflect.deleteProperty(dryRoot, "extra");
        expect(deleted).toBe(true);
      }

      const expectedWet = isExtensible ? 1 : undefined;
      checkProperties(undefined, expectedWet);
    });

    it("deleteProperty() does not remove a non-configurable property", function() {
      const isExtensible = Reflect.isExtensible(wetRoot);
      Reflect.defineProperty(dryRoot, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: false
      });

      {
        let deleted = Reflect.deleteProperty(dryRoot, "extra");
        expect(deleted).toBe(!isExtensible);
      }

      const expectedWet = isExtensible ? 1 : undefined;
      checkProperties(expectedWet, expectedWet);
    });

    it("deleteProperty() does not remove an inherited property", function() {
      Reflect.defineProperty(parts.dry.Node.prototype, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });

      {
        let deleted = Reflect.deleteProperty(dryRoot, "extra");
        expect(deleted).toBe(true);
      }

      {
        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("extra")).toBe(false);
      }

      {
        let keys = Reflect.ownKeys(wetRoot);
        expect(keys.includes("extra")).toBe(false);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(dryRoot, "extra");
        expect(desc).toBe(undefined);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(wetRoot, "extra");
        expect(desc).toBe(undefined);
      }

      {
        let found = Reflect.has(dryRoot, "extra");
        expect(found).toBe(true);
      }

      {
        let found = Reflect.has(wetRoot, "extra");
        expect(found).toBe(true);
      }

      {
        let val = Reflect.get(dryRoot, "extra");
        expect(val).toBe(1);
      }

      {
        let val = Reflect.get(wetRoot, "extra");
        expect(val).toBe(1);
      }
    });

    it(
      "deleteProperty() hides a property stored first on the wet graph",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(wetRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(undefined, expectedWet);
      }
    );
    
    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the wet graph, does not expose the property again",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: false,
          configurable: true
        });
  
        Reflect.deleteProperty(dryRoot, "extra");

        Reflect.defineProperty(wetRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(undefined, expectedWet);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the damp graph, does not expose the property again",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: false,
          configurable: true
        });
  
        Reflect.deleteProperty(dryRoot, "extra");

        Reflect.defineProperty(dampRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(undefined, expectedWet);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the dry graph, re-exposes the property",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.deleteProperty(dryRoot, "extra");

        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(expectedWet, expectedWet);
      }
    );

    it(
      "deleteProperty() is not impacted by .preventExtensions() on the dry graph",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.preventExtensions(dryRoot);
        expect(Reflect.isExtensible(wetRoot)).toBe(false);
        expect(Reflect.isExtensible(dryRoot)).toBe(false);
        expect(Reflect.isExtensible(dampRoot)).toBe(false);

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(undefined, expectedWet);
      }
    );

    it(
      "deleteProperty() is not impacted by .preventExtensions() on the wet graph",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.preventExtensions(wetRoot);
        expect(Reflect.isExtensible(dryRoot)).toBe(false);
        expect(Reflect.isExtensible(wetRoot)).toBe(false);
        expect(Reflect.isExtensible(dampRoot)).toBe(false);

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(undefined, expectedWet);
      }
    );

    it(
      "deleteProperty() is not impacted by .preventExtensions() on the damp graph",
      function() {
        const isExtensible = Reflect.isExtensible(wetRoot);
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.preventExtensions(dampRoot);
        expect(Reflect.isExtensible(dryRoot)).toBe(false);
        expect(Reflect.isExtensible(wetRoot)).toBe(false);
        expect(Reflect.isExtensible(dampRoot)).toBe(false);

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        const expectedWet = isExtensible ? 1 : undefined;
        checkProperties(undefined, expectedWet);
      }
    );
  }

  function specsWithSealAndFreezeOptions() {
    describe(
      "on unsealed objects, ObjectGraphHandler(dry).",
      requireLocalDeleteSpecs
    );

    describe("on sealed objects, ObjectGraphHandler(dry).", function() {
      requireLocalDeleteSpecs();
      beforeEach(function() {
        Object.seal(wetRoot);
      });
    });

    describe("on sealed proxies, ObjectGraphHandler(dry).", function() {
      requireLocalDeleteSpecs();
      beforeEach(function() {
        Object.seal(dryRoot);
      });
    });

    describe("on frozen objects, ObjectGraphHandler(dry).", function() {
      requireLocalDeleteSpecs();
      beforeEach(function() {
        Object.freeze(wetRoot);
      });
    });

    describe("on frozen proxies, ObjectGraphHandler(dry).", function() {
      requireLocalDeleteSpecs();
      beforeEach(function() {
        Object.freeze(dryRoot);
      });
    });
  }
  
  describe("when required by the dry object graph, ", function() {
    beforeEach(function() {
      membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
    });

    specsWithSealAndFreezeOptions();
  });

  describe("when required by the wet object graph, ", function() {
    beforeEach(function() {
      parts.handlers.wet.ensureMapping(parts.wet.Node.prototype);
      membrane.modifyRules.requireLocalDelete("wet", parts.wet.Node.prototype);
    });
    
    specsWithSealAndFreezeOptions();
  });

  describe(
    "when required by both the wet and the dry object graphs, ",
    function() {
      beforeEach(function() {
        parts.handlers.wet.ensureMapping(parts.wet.Node.prototype);
        membrane.modifyRules.requireLocalDelete("wet", parts.wet.Node.prototype);
        membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
      });

      specsWithSealAndFreezeOptions();
    }
  );

  describe("when required by the damp object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.modifyRules.requireLocalDelete(DAMP, parts[DAMP].Node.prototype);
    });

    it(
      "deleteProperty() removes a configurable property",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        checkProperties(undefined, undefined);
      }
    );

    it(
      "deleteProperty() does not remove a non-configurable property",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: false
        });

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(false);
        }

        checkProperties(1, 1);
      }
    );

    it(
      "deleteProperty() does not remove an inherited property",
      function() {
        Reflect.defineProperty(parts.dry.Node.prototype, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        {
          let keys = Reflect.ownKeys(dryRoot);
          expect(keys.includes("extra")).toBe(false);
        }

        {
          let keys = Reflect.ownKeys(wetRoot);
          expect(keys.includes("extra")).toBe(false);
        }

        {
          let desc = Reflect.getOwnPropertyDescriptor(dryRoot, "extra");
          expect(desc).toBe(undefined);
        }

        {
          let desc = Reflect.getOwnPropertyDescriptor(wetRoot, "extra");
          expect(desc).toBe(undefined);
        }

        {
          let found = Reflect.has(dryRoot, "extra");
          expect(found).toBe(true);
        }

        {
          let found = Reflect.has(wetRoot, "extra");
          expect(found).toBe(true);
        }

        {
          let val = Reflect.get(dryRoot, "extra");
          expect(val).toBe(1);
        }

        {
          let val = Reflect.get(wetRoot, "extra");
          expect(val).toBe(1);
        }
      }
    );

    it(
      "deleteProperty() does not hide a property stored first on the wet graph",
      function() {
        Reflect.defineProperty(wetRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        checkProperties(undefined, undefined);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the wet graph, exposes the property again",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: false,
          configurable: true
        });
  
        Reflect.deleteProperty(dryRoot, "extra");

        Reflect.defineProperty(wetRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        checkProperties(1, 1);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the damp graph, exposes the property again",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: false,
          configurable: true
        });
  
        Reflect.deleteProperty(dryRoot, "extra");

        Reflect.defineProperty(dampRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        checkProperties(1, 1);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the dry graph, exposes the property again",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 2,
          writable: true,
          enumerable: false,
          configurable: true
        });
  
        Reflect.deleteProperty(dryRoot, "extra");

        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        checkProperties(1, 1);
      }
    );

    it(
      "deleteProperty() is not impacted by .preventExtensions() on the dry graph",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.preventExtensions(dryRoot);
        expect(Reflect.isExtensible(dryRoot)).toBe(false);
        expect(Reflect.isExtensible(wetRoot)).toBe(false);
        expect(Reflect.isExtensible(dampRoot)).toBe(false);

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        checkProperties(undefined, undefined);
      }
    );

    it(
      "deleteProperty() is not impacted by .preventExtensions() on the wet graph",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.preventExtensions(wetRoot);
        expect(Reflect.isExtensible(dryRoot)).toBe(false);
        expect(Reflect.isExtensible(wetRoot)).toBe(false);
        expect(Reflect.isExtensible(dampRoot)).toBe(false);

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        checkProperties(undefined, undefined);
      }
    );

    it(
      "deleteProperty() is not impacted by .preventExtensions() on the damp graph",
      function() {
        Reflect.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: true
        });

        Reflect.preventExtensions(dampRoot);
        expect(Reflect.isExtensible(dryRoot)).toBe(false);
        expect(Reflect.isExtensible(wetRoot)).toBe(false);
        expect(Reflect.isExtensible(dampRoot)).toBe(false);

        {
          let deleted = Reflect.deleteProperty(dryRoot, "extra");
          expect(deleted).toBe(true);
        }

        checkProperties(undefined, undefined);
      }
    );
  });

  it("requires a value or proxy already known to the membrane", function() {
    expect(function() {
      membrane.modifyRules.requireLocalDelete("wet", {});
    }).toThrow();
    expect(function() {
      membrane.modifyRules.requireLocalDelete("dry", {});
    }).toThrow();
  });

  it(
    "and then applying a seal() operation on the proxy still works",
    function() {
      Reflect.defineProperty(wetRoot, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });

      /* This is an order-of-operations test:  unlike the above tests, which
       * may seal the dryRoot before the delete operation, this test deletes
       * the property and then seals the dryRoot.
       */

      membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
      {
        let deleted = Reflect.deleteProperty(dryRoot, "extra");
        expect(deleted).toBe(true);
      }

      Object.seal(dryRoot);

      checkProperties(undefined, 1);
    }
  );

  it(
    "and then applying a freeze() operation on the proxy still works",
    function() {
      Reflect.defineProperty(wetRoot, "extra", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: true
      });

      /* This is an order-of-operations test:  unlike the above tests, which
       * may seal the dryRoot before the delete operation, this test deletes
       * the property and then seals the dryRoot.
       */

      membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
      {
        let deleted = Reflect.deleteProperty(dryRoot, "extra");
        expect(deleted).toBe(true);
      }

      Object.freeze(dryRoot);

      checkProperties(undefined, 1);
    }
  );
});
/**
 * @fileoverview
 *
 * This defines a common set of tests for a large number of scenarios involving
 * filtering of "own keys".  The basic tests are in definePropertyTests().  The
 * various conditions, through combinatorics, ensure the filtering works in
 * any practical scenario.
 *
 * Everything before definePropertyTests is infrastructure used in the tests.
 *
 * Everything after definePropertyTests sets up conditions for each round of
 * tests, in a nested pattern.  Here is (roughly) the stack trace for the test
 * rounds:
 *
 * definePropertyTests
 * defineTestSet
 * defineTestsByFilter
 * defineTestsByObjectGraph
 * defineTestsBySealant
 */

if ((typeof MembraneMocks != "function") ||
    (typeof DAMP != "symbol") ||
    (typeof loggerLib != "object")) {
  if (typeof require == "function") {
    var { MembraneMocks, loggerLib, DAMP } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

if ((typeof DataDescriptor != "function") ||
    (typeof isDataDescriptor != "function")) {
  if (typeof require == "function") {
    var {
      DataDescriptor,
      isDataDescriptor
    } = require("../../docs/dist/node/utilities.js");
  }
  else
    throw new Error("Unable to run tests: cannot get DataDescriptor");
}

describe("Filtering own keys ", function() {
  "use strict";
  /* XXX ajvincent These tests have grown very complex, even for me.
   * To debug a specific test may require several steps:
   * (1) Set the if (false) condition below to true.
   * (2) In the "defineTests" functions,
     beforeEach(function() {
       debugConditions.add(foo);
     });
   * 
   * (3) In the actual test:
     if (debugConditions.has(foo) && debugConditions.has(bar)...)
       debugger;
   */
  const debugConditions = new Set();
  if (false) {
    afterEach(function() {
      debugConditions.clear();
    });
  }

  //{ infrastructure

  function voidFunc() {}

  function fixKeys(keys) {
    if (keys.includes("membraneGraphName"))
      keys.splice(keys.indexOf("membraneGraphName"), 1);
  }

  function DocBlacklistFilter(name) {
    switch (name) {
      case "__events__":
      case "handleEventAtTarget":
      case "shouldNotBeAmongKeys":
      case "blacklisted":
        return false;
    }
    return true;
  }

  // In theory, an array or set should behave just like a whitelist filter.
  const docKeysAsArray = [
    "ownerDocument",
    "childNodes",
    "nodeType",
    "nodeName",
    "parentNode",
    "firstChild",
    "baseURL",
    "addEventListener",
    "dispatchEvent",
    "membraneGraphName",
    "createElement",
    "insertBefore",
    "rootElement",

    "extra" // to test whitelisted properties that aren't defined
  ];
  Object.freeze(docKeysAsArray);

  const docKeysAsSet = new Set();
  docKeysAsArray.forEach((key) => docKeysAsSet.add(key));
  Object.freeze(docKeysAsSet);

  var extraDesc = new DataDescriptor(3, true, true, true);
  var extraDesc2 = new DataDescriptor(4, true, true, true);

  // Customize this for whatever variables you need.
  var parts, membrane, dryDocument, wetDocument, dampDocument;
  const logger = loggerLib.getLogger("test.membrane.defineProperty");
  var appender = new loggerLib.Appender();
  appender.setThreshold("WARN");
  logger.addAppender(appender);

  function setParts() {
    dryDocument  = parts.dry.doc;
    wetDocument  = parts.wet.doc;
    dampDocument = parts[DAMP].doc;
    membrane     = parts.membrane;
  }

  beforeEach(function() {
    parts = MembraneMocks(true);
    setParts();
    appender.clear();
  });

  function clearParts() {
    dryDocument  = null;
    wetDocument  = null;
    dampDocument = null;

    membrane.getHandlerByName("dry").revokeEverything();
    membrane = null;
    parts    = null;
  }
  afterEach(clearParts);

  function checkDeleted() {
    expect(Reflect.deleteProperty(dryDocument, "blacklisted")).toBe(true);
    var keys = Reflect.ownKeys(dryDocument);
    fixKeys(keys);
    expect(keys.includes("blacklisted")).toBe(false);
    expect(Reflect.has(dryDocument, "blacklisted")).toBe(false);
    {
      let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "blacklisted");
      expect(extra).toBe(undefined);
    }
    expect(Reflect.get(dryDocument, "blacklisted")).toBe(undefined);
  }

  function checkAppenderForWarning(wName) {
    expect(appender.events.length).toBe(1);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("WARN");
      expect(event.message).toBe(
        membrane.constants.warnings[wName]
      );
    }
  }
  
  function sealWetDocument() {
    Object.seal(wetDocument);
  }
  function sealDryDocument() {
    Object.seal(dryDocument);
  }
  function freezeWetDocument() {
    Object.freeze(wetDocument);
  }
  function freezeDryDocument() {
    Object.freeze(dryDocument);
  }

  //} end infrastructure

  function definePropertyTests(modifyFilter) {
    function rebuildMocksWithLogger() {
      clearParts();
      appender.clear();
      parts = MembraneMocks(true, logger);
      setParts();
      modifyFilter();
    }

    it(
      "hides defined properties from getters",
      function() {
        let keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("nodeType")).toBe(true);
        expect(keys.includes("__events__")).toBe(false);
        expect(Reflect.has(dryDocument, "__events__")).toBe(false);
        {
          let events = Reflect.getOwnPropertyDescriptor(
            dryDocument, "__events__"
          );
          expect(events).toBe(undefined);
        }
        expect(Reflect.get(dryDocument, "__events__")).toBe(undefined);
  
        {
          // Consistency check.
          let k2 = Reflect.ownKeys(parts.dry.doc);
          fixKeys(k2);
          expect(k2.length).toBe(keys.length);
          k2.forEach(function(item, index) {
            expect(keys[index]).toBe(item);
          });
        }
  
        // Wet properties are not actually hidden.
        keys = Reflect.ownKeys(parts.wet.doc);
        fixKeys(keys);
        expect(keys.includes("nodeType")).toBe(true);
        expect(keys.includes("__events__")).toBe(true);
        expect(Reflect.has(wetDocument, "__events__")).toBe(true);
        {
          let events = Reflect.getOwnPropertyDescriptor(
            wetDocument, "__events__"
          );
          expect(isDataDescriptor(events)).toBe(true);
          expect(Array.isArray(events.value)).toBe(true);
        }
        {
          let events = Reflect.get(wetDocument, "__events__");
          expect(Array.isArray(events)).toBe(true);
        }
      }
    );

    it(
      "does not affect setting or deleting a (configurable) property that isn't blacklisted",
      function() {
        var keys;
  
        // Set extra initially to 3.
        const isExtensible = Reflect.isExtensible(wetDocument);
        expect(
          Reflect.defineProperty(dryDocument, "extra", extraDesc)
        ).toBe(isExtensible);
  
        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(isExtensible);
        expect(Reflect.has(dryDocument, "extra")).toBe(isExtensible);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
          if (isExtensible)
          {
            expect(isDataDescriptor(extra)).toBe(true);
            expect(extra.value).toBe(3);
          }
          else
          {
            expect(extra).toBe(undefined);
          }
        }
        expect(Reflect.get(dryDocument, "extra")).toBe(isExtensible ? 3 : undefined);
  
        keys = Reflect.ownKeys(wetDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(isExtensible);
        expect(Reflect.has(wetDocument, "extra")).toBe(isExtensible);
        {
          let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
          if (isExtensible)
          {
            expect(isDataDescriptor(extra)).toBe(true);
            expect(extra.value).toBe(3);
          }
          else
          {
            expect(extra).toBe(undefined);
          }
        }
        expect(Reflect.get(wetDocument, "extra")).toBe(isExtensible ? 3 : undefined);
  
        // Set extra again, to 4.
        expect(
          Reflect.defineProperty(dryDocument, "extra", extraDesc2)
        ).toBe(isExtensible);

        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(isExtensible);
        expect(Reflect.has(dryDocument, "extra")).toBe(isExtensible);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
          if (isExtensible)
          {
            expect(isDataDescriptor(extra)).toBe(true);
            expect(extra.value).toBe(4);
          }
          else
            expect(extra).toBe(undefined);
        }
        expect(Reflect.get(dryDocument, "extra")).toBe(isExtensible ? 4 : undefined);
  
        keys = Reflect.ownKeys(wetDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(isExtensible);
        expect(Reflect.has(wetDocument, "extra")).toBe(isExtensible);
        {
          let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
          if (isExtensible)
          {
            expect(isDataDescriptor(extra)).toBe(true);
            expect(extra.value).toBe(4);
          }
          else
            expect(extra).toBe(undefined);
        }
        expect(Reflect.get(wetDocument, "extra")).toBe(isExtensible ? 4 : undefined);
  
        // Delete extra.
        expect(Reflect.deleteProperty(dryDocument, "extra")).toBe(true);
        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(false);
        expect(Reflect.has(dryDocument, "extra")).toBe(false);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
          expect(extra).toBe(undefined);
        }
        expect(Reflect.get(dryDocument, "extra")).toBe(undefined);
  
        keys = Reflect.ownKeys(wetDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(false);
        expect(Reflect.has(wetDocument, "extra")).toBe(false);
        {
          let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
          expect(extra).toBe(undefined);
        }
        expect(Reflect.get(wetDocument, "extra")).toBe(undefined);
      }
    );

    describe(
      ".defineProperty(dryDocument, 'blacklisted', desc) returns false for a blacklisted property, and does not set the property",
      function() {
        var desc;
        beforeEach(function() {
          desc = {
            "value": 2,
            "writable": true,
            "enumerable": true,
          };
        });
  
        afterEach(function() {
          desc = null;
        });
  
        it("where desc.configurable is false,", function() {
          desc.configurable = false;
          expect(
            Reflect.defineProperty(dryDocument, "blacklisted", desc)
          ).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);
        });
  
        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(
            Reflect.defineProperty(dryDocument, "blacklisted", desc)
          ).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);
        });
      }
    );

    describe(
      ".defineProperty(dryDocument, 'blacklisted', desc) triggers a membrane logger warning once",
      function() {
        var desc;
        beforeEach(function() {
          rebuildMocksWithLogger();
          desc = {
            "value": 2,
            "writable": true,
            "enumerable": true,
          };
        });

        afterEach(function() {
          desc = null;
        });

        it("where desc.configurable is false,", function() {
          desc.configurable = false;
          expect(Reflect.defineProperty(
            dryDocument, "blacklisted", desc
          )).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);

          checkAppenderForWarning("FILTERED_KEYS_WITHOUT_LOCAL");
        });
  
        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(Reflect.defineProperty(
            dryDocument, "blacklisted", desc
          )).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);

          checkAppenderForWarning("FILTERED_KEYS_WITHOUT_LOCAL");
        });
      }
    );

    describe(
      ".deleteProperty(dryDocument, 'blacklisted') returns true for a blacklisted property",
      function() {
        it("when the property was never defined", function() {
          expect(Reflect.deleteProperty(dryDocument, "blacklisted")).toBe(true);
          checkDeleted();
        });

        it(
          "when the property was previously defined on the wet graph as configurable",
          function() {
            const isExtensible = Reflect.isExtensible(wetDocument);
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", extraDesc);
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
    
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            let expectation = expect(desc);
            if (isExtensible)
              expectation = expectation.not;
            expectation.toBe(undefined);
            if (desc) {
              expect(desc.value).toBe(3);
            }
          }
        );

        it(
          "when the property was previously defined on the wet graph as non-configurable",
          function() {
            const isExtensible = Reflect.isExtensible(wetDocument);
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", {
              value: 3,
              writable: true,
              enumerable: true,
              configurable: false
            });
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            let expectedDesc = expect(desc);
            if (isExtensible)
              expectedDesc = expectedDesc.not;
            expectedDesc.toBe(undefined);
            if (desc) {
              expect(desc.value).toBe(3);
            }
          }
        );

        it(
          "when the property's definition on the dry graph was attempted",
          function() {
            /* We don't care whether defineProperty returns true or false.  That
             * should've been tested above.
             */
            Reflect.defineProperty(dryDocument, "blacklisted", extraDesc);
  
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).toBe(undefined);
          }
        );
      }
    );

    describe(
      ".deleteProperty(dryDocument, 'blacklisted') triggers a membrane logger warning once",
      function() {
        beforeEach(function() {
          rebuildMocksWithLogger();
        });

        it("when the property was never defined", function() {
          expect(Reflect.deleteProperty(dryDocument, "blacklisted")).toBe(true);
          checkDeleted();
          checkAppenderForWarning("FILTERED_KEYS_WITHOUT_LOCAL");
        });

        it(
          "when the property was previously defined on the wet graph as configurable",
          function() {
            // Set extra initially to 3.
            const wasDefined = Reflect.defineProperty(
              wetDocument, "blacklisted", extraDesc
            );
            appender.clear();
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();

            if (wasDefined)
              checkAppenderForWarning("FILTERED_KEYS_WITHOUT_LOCAL");
            else
              expect(appender.events.length).toBe(0);

            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(Boolean(desc)).toBe(wasDefined);
            if (desc) {
              expect(desc.value).toBe(3);
            }
          }
        );

        it(
          "when the property was previously defined on the wet graph as non-configurable",
          function() {
            // Set extra initially to 3.
            const wasDefined = Reflect.defineProperty(wetDocument, "blacklisted", {
              value: 3,
              writable: true,
              enumerable: true,
              configurable: false
            });
            appender.clear();
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();

            if (wasDefined)
              checkAppenderForWarning("FILTERED_KEYS_WITHOUT_LOCAL");
            else
              expect(appender.events.length).toBe(0);
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(Boolean(desc)).toBe(wasDefined);
            if (desc) {
              expect(desc.value).toBe(3);
            }
          }
        );

        /* "when the property's definition on the dry graph was attempted"
         * No point trying to test this case for the logger warning once:
         * it would have logged the first time for the defineProperty call,
         * so a call to .deleteProperty wouldn't trigger the warning again.
         */
      }
    );
  }

  function defineTestSet(
    filterWet, filterDry, filterObj, descTail, beforeTail
  )
  {
    function modifyFilter() {
      if (filterWet)
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, filterObj);
      if (filterDry)
        membrane.modifyRules.filterOwnKeys("dry", dryDocument, filterObj);
    }

    describe("and with a " + descTail, function() {
      /* XXX ajvincent It turns out the order of beforeEach() calls matters.
         If we tried to seal a mock document before the filter was in
         place, the tests become inconsistent.  Another test at the end of this
         file ensures that a filter does not apply to a sealed document.
      */

      beforeEach(modifyFilter);
      definePropertyTests(modifyFilter);
      beforeEach(beforeTail);
    });
  }

  function defineTestsByFilter(filterWet, filterDry, beforeTail) {
    defineTestSet(
      filterWet, filterDry, DocBlacklistFilter, "blacklist function", beforeTail
    );

    defineTestSet(
      filterWet, filterDry, docKeysAsArray, "whitelist array", beforeTail
    );
    defineTestSet(
      filterWet, filterDry, docKeysAsSet, "whitelist set", beforeTail
    );
  }
  
  function defineTestsByObjectGraph(graphName, beforeTail) {
    const isWet = graphName === "wet";
    describe(`with the ${graphName} object graph`, function() {
      defineTestsByFilter(isWet, !isWet, beforeTail);
    });
  }
  
  function defineTestsBySealant(sealTail) {
    defineTestsByObjectGraph("wet", sealTail);
    defineTestsByObjectGraph("dry", sealTail);
  }

  [
    voidFunc,
    sealWetDocument,
    sealDryDocument,
    freezeWetDocument,
    freezeDryDocument,
  ].forEach(defineTestsBySealant);

  describe("with the wet and dry object graphs", function() {
    defineTestsByFilter(true, true, voidFunc);
  });

  describe("with the damp object graph (not affecting dry or wet)", function() {
    beforeEach(function() {
      membrane.modifyRules.filterOwnKeys(DAMP, dampDocument, DocBlacklistFilter);
    });

    function rebuildMocksWithLogger() {
      clearParts();
      appender.clear();
      parts = MembraneMocks(true, logger);
      setParts();
      membrane.modifyRules.filterOwnKeys(DAMP, dampDocument, DocBlacklistFilter);
    }

    it(
      "does not hide defined properties from getters",
      function() {
        let keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("nodeType")).toBe(true);
        expect(keys.includes("__events__")).toBe(true);
        expect(Reflect.has(dryDocument, "__events__")).toBe(true);
        {
          let events = Reflect.getOwnPropertyDescriptor(
            dryDocument, "__events__"
          );
          expect(isDataDescriptor(events)).toBe(true);
          expect(Array.isArray(events.value)).toBe(true);
        }
        {
          let events = Reflect.get(wetDocument, "__events__");
          expect(Array.isArray(events)).toBe(true);
        }
  
        {
          // Consistency check.
          let k2 = Reflect.ownKeys(parts.dry.doc);
          fixKeys(k2);
          expect(k2.length).toBe(keys.length);
          k2.forEach(function(item, index) {
            expect(keys[index]).toBe(item);
          });
        }
  
        // Wet properties are not actually hidden.
        keys = Reflect.ownKeys(parts.wet.doc);
        fixKeys(keys);
        expect(keys.includes("nodeType")).toBe(true);
        expect(keys.includes("__events__")).toBe(true);
        expect(Reflect.has(wetDocument, "__events__")).toBe(true);
        {
          let events = Reflect.getOwnPropertyDescriptor(
            wetDocument, "__events__"
          );
          expect(isDataDescriptor(events)).toBe(true);
          expect(Array.isArray(events.value)).toBe(true);
        }
        {
          let events = Reflect.get(wetDocument, "__events__");
          expect(Array.isArray(events)).toBe(true);
        }
      }
    );

    it(
      "does not affect setting or deleting a (configurable) property that isn't blacklisted",
      function() {
        var keys;
  
        // Set extra initially to 3.
        expect(
          Reflect.defineProperty(dryDocument, "extra", extraDesc)
        ).toBe(true);
  
        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(true);
        expect(Reflect.has(dryDocument, "extra")).toBe(true);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
          expect(isDataDescriptor(extra)).toBe(true);
          expect(extra.value).toBe(3);
        }
        expect(Reflect.get(dryDocument, "extra")).toBe(3);
  
        keys = Reflect.ownKeys(wetDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(true);
        expect(Reflect.has(wetDocument, "extra")).toBe(true);
        {
          let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
          expect(isDataDescriptor(extra)).toBe(true);
          expect(extra.value).toBe(3);
        }
        expect(Reflect.get(wetDocument, "extra")).toBe(3);
  
        // Set extra again, to 4.
        expect(
          Reflect.defineProperty(dryDocument, "extra", extraDesc2)
        ).toBe(true);

        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(true);
        expect(Reflect.has(dryDocument, "extra")).toBe(true);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
          expect(isDataDescriptor(extra)).toBe(true);
          expect(extra.value).toBe(4);
        }
        expect(Reflect.get(dryDocument, "extra")).toBe(4);
  
        keys = Reflect.ownKeys(wetDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(true);
        expect(Reflect.has(wetDocument, "extra")).toBe(true);
        {
          let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
          expect(isDataDescriptor(extra)).toBe(true);
          expect(extra.value).toBe(4);
        }
        expect(Reflect.get(wetDocument, "extra")).toBe(4);
  
        // Delete extra.
        expect(Reflect.deleteProperty(dryDocument, "extra")).toBe(true);
        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(false);
        expect(Reflect.has(dryDocument, "extra")).toBe(false);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
          expect(extra).toBe(undefined);
        }
        expect(Reflect.get(dryDocument, "extra")).toBe(undefined);
  
        keys = Reflect.ownKeys(wetDocument);
        fixKeys(keys);
        expect(keys.includes("extra")).toBe(false);
        expect(Reflect.has(wetDocument, "extra")).toBe(false);
        {
          let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
          expect(extra).toBe(undefined);
        }
        expect(Reflect.get(wetDocument, "extra")).toBe(undefined);
      }
    );

    describe(
      ".defineProperty(dryDocument, 'blacklisted', desc) returns true for a blacklisted property, and sets the property",
      function() {
        var desc;
        beforeEach(function() {
          desc = {
            "value": 2,
            "writable": true,
            "enumerable": true,
          };
        });

        afterEach(function() {
          desc = null;
        });

        it("where desc.configurable is false,", function() {
          desc.configurable = false;
          expect(
            Reflect.defineProperty(dryDocument, "blacklisted", desc)
          ).toBe(true);
          expect(dryDocument.blacklisted).toBe(2);
          expect(wetDocument.blacklisted).toBe(2);
        });

        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(
            Reflect.defineProperty(dryDocument, "blacklisted", desc)
          ).toBe(true);
          expect(dryDocument.blacklisted).toBe(2);
          expect(wetDocument.blacklisted).toBe(2);
        });
      }
    );

    describe(
      ".defineProperty(dryDocument, 'blacklisted', desc) does not trigger a membrane logger warning",
      function() {
        var desc;
        beforeEach(function() {
          rebuildMocksWithLogger();
          desc = {
            "value": 2,
            "writable": true,
            "enumerable": true,
          };
        });

        afterEach(function() {
          desc = null;
        });

        it("where desc.configurable is false,", function() {
          desc.configurable = false;
          expect(
            Reflect.defineProperty(dryDocument, "blacklisted", desc)
          ).toBe(true);
          expect(dryDocument.blacklisted).toBe(2);
          expect(wetDocument.blacklisted).toBe(2);

          expect(appender.events.length).toBe(0);
        });

        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(
            Reflect.defineProperty(dryDocument, "blacklisted", desc)
          ).toBe(true);
          expect(dryDocument.blacklisted).toBe(2);
          expect(wetDocument.blacklisted).toBe(2);

          expect(appender.events.length).toBe(0);
        });
      }
    );

    describe(
      ".deleteProperty(dryDocument, 'blacklisted') returns true for a blacklisted property",
      function() {
        it("when the property was never defined", function() {
          expect(Reflect.deleteProperty(dryDocument, "blacklisted")).toBe(true);
          checkDeleted();
        });

        it(
          "when the property was previously defined on the wet graph as configurable",
          function() {
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", extraDesc);
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
    
            // Test that the delete propagated through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).toBe(undefined);

            let keys = Reflect.ownKeys(wetDocument);
            fixKeys(keys);
            expect(keys.includes("blacklisted")).toBe(false);
            expect(Reflect.has(wetDocument, "blacklisted")).toBe(false);
            {
              let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "blacklisted");
              expect(extra).toBe(undefined);
            }
            expect(Reflect.get(wetDocument, "blacklisted")).toBe(undefined);
          }
        );

        it(
          "when the property was previously defined on the wet graph as non-configurable",
          function() {
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", {
              value: 3,
              writable: true,
              enumerable: true,
              configurable: false
            });
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(false);

            // Test that the delete didn't apply to the dry object graph.
            {
              let desc = Reflect.getOwnPropertyDescriptor(
                dryDocument, "blacklisted"
              );
              expect(desc).not.toBe(undefined);
              if (desc) {
                expect(desc.value).toBe(3);
              }
            }
  
            // Test that the delete didn't propagate through.
            {
              let desc = Reflect.getOwnPropertyDescriptor(
                wetDocument, "blacklisted"
              );
              expect(desc).not.toBe(undefined);
              if (desc) {
                expect(desc.value).toBe(3);
              }
            }
          }
        );

        it(
          "when the property's definition on the dry graph was attempted",
          function() {
            /* We don't care whether defineProperty returns true or false.  That
             * should've been tested above.
             */
            Reflect.defineProperty(dryDocument, "blacklisted", extraDesc);
  
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).toBe(undefined);
          }
        );
      }
    );

    describe(
      ".deleteProperty(dryDocument, 'blacklisted') does not trigger a membrane logger warning",
      function() {
        beforeEach(function() {
          rebuildMocksWithLogger();
        });

        it("when the property was never defined", function() {
          expect(Reflect.deleteProperty(dryDocument, "blacklisted")).toBe(true);
          checkDeleted();

          expect(appender.events.length).toBe(0);
        });

        it(
          "when the property was previously defined on the wet graph as configurable",
          function() {
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", extraDesc);
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
    
            // Test that the delete propagated through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).toBe(undefined);

            let keys = Reflect.ownKeys(wetDocument);
            fixKeys(keys);
            expect(keys.includes("blacklisted")).toBe(false);
            expect(Reflect.has(wetDocument, "blacklisted")).toBe(false);
            {
              let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "blacklisted");
              expect(extra).toBe(undefined);
            }
            expect(Reflect.get(wetDocument, "blacklisted")).toBe(undefined);

            expect(appender.events.length).toBe(0);
          }
        );

        it(
          "when the property was previously defined on the wet graph as non-configurable",
          function() {
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", {
              value: 3,
              writable: true,
              enumerable: true,
              configurable: false
            });
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(false);

            // Test that the delete didn't apply to the dry object graph.
            {
              let desc = Reflect.getOwnPropertyDescriptor(
                dryDocument, "blacklisted"
              );
              expect(desc).not.toBe(undefined);
              if (desc) {
                expect(desc.value).toBe(3);
              }
            }
  
            // Test that the delete didn't propagate through.
            {
              let desc = Reflect.getOwnPropertyDescriptor(
                wetDocument, "blacklisted"
              );
              expect(desc).not.toBe(undefined);
              if (desc) {
                expect(desc.value).toBe(3);
              }
            }

            expect(appender.events.length).toBe(0);
          }
        );

        /* "when the property's definition on the dry graph was attempted"
         * No point trying to test this case for the logger warning once:
         * it would have logged the first time for the defineProperty call,
         * so a call to .deleteProperty wouldn't trigger the warning again.
         */
      }
    );
  });

  it("is disallowed when the proxy is known to be not extensible", function() {
    function checkKeys() {
      let keys = Reflect.ownKeys(dryDocument);
      fixKeys(keys);
      expect(keys.includes("handleEventAtTarget")).toBe(true);
    }
    Reflect.preventExtensions(dryDocument);
    checkKeys();

    expect(function() {
      membrane.modifyRules.filterOwnKeys("wet", wetDocument, DocBlacklistFilter);
    }).toThrow();
    checkKeys();

    expect(function() {
      membrane.modifyRules.filterOwnKeys("dry", dryDocument, DocBlacklistFilter);
    }).toThrow();
    checkKeys();
  });
});
"use strict"

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe(
  "storeUnknownAsLocal overrides filterOwnKeys for .defineProperty()",
  function() {
    function BlacklistFilter(name) {
      switch (name) {
        case "__events__":
        case "handleEventAtTarget":
        case "shouldNotBeAmongKeys":
        case "blacklisted":
          return false;
      }
      return true;
    }

    const desc1 = {
      value: 1,
      writable: true,
      enumerable: true,
      configurable: true
    };

    const desc2 = {
      value: 2,
      writable: true,
      enumerable: true,
      configurable: false
    };

    var parts, dryDocument, wetDocument, membrane;

    beforeEach(function() {
      parts = MembraneMocks(false);
      dryDocument  = parts.dry.doc;
      wetDocument  = parts.wet.doc;
      membrane     = parts.membrane;
    });

    afterEach(function() {
      dryDocument  = null;
      wetDocument  = null;

      membrane.getHandlerByName("dry").revokeEverything();
      membrane = null;
      parts    = null;
    });

    function runTest(propName, wetValue) {
      {
        let keys = Reflect.ownKeys(dryDocument);
        expect(keys.includes(propName)).toBe(true);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(dryDocument, propName);
        expect(desc).not.toBe(undefined);
        if (desc)
          expect(desc.value).toBe(1);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(wetDocument, propName);
        if (desc)
          desc = desc.value;
        expect(desc).toBe(wetValue);
      }
    }

    function buildTest(storeUnknown, filterKeys, propName) {
      return [
        // description
        [
          "with storeUnknownAsLocal on the " + storeUnknown + " graph",
          "filterOwnKeys on the " + filterKeys + " graph",
          "and the property name of " + propName
        ].join(", "),

        function() {
          membrane.modifyRules.filterOwnKeys(filterKeys, parts[filterKeys].doc, BlacklistFilter);
          membrane.modifyRules.storeUnknownAsLocal(storeUnknown, parts[storeUnknown].doc);

          /* Define the property on the dry graph.  It should appear on the dry graph
           * but not on the wet graph.
           */
          expect(
            Reflect.defineProperty(dryDocument, propName, desc1)
          ).toBe(true);

          runTest(propName, undefined);

          /* Define the property with a different value on the wet graph.  The dry
           * graph should be unaffected.
           */
          expect(
            Reflect.defineProperty(wetDocument, propName, desc2)
          ).toBe(true);

          runTest(propName, 2);
        }
      ];
    }

    /* Combinations:
       storeUnknownAsLocal: dry, wet
       filterOwnKeys: dry, wet
       property name: extra, blacklisted
    */
    ["dry", "wet"].forEach(function(storeUnknown) {
      ["dry", "wet"].forEach(function(filterOwn) {
        ["extra", "blacklisted"].forEach(function(propName) {
          var [desc, test] = buildTest(storeUnknown, filterOwn, propName);
          it(desc, test);
        });
      });
    });
  }
);

describe(
  "requireLocalDelete overrides filterOwnKeys for .deleteProperty()",
  function() {
    function BlacklistFilter(name) {
      switch (name) {
        case "__events__":
        case "handleEventAtTarget":
        case "shouldNotBeAmongKeys":
        case "blacklisted":
          return false;
      }
      return true;
    }

    const desc1 = {
      value: 1,
      writable: true,
      enumerable: true,
      configurable: true
    };

    const desc2 = {
      value: 2,
      writable: true,
      enumerable: true,
      configurable: false
    };

    var parts, dryDocument, wetDocument, membrane;

    beforeEach(function() {
      parts = MembraneMocks(false);
      dryDocument  = parts.dry.doc;
      wetDocument  = parts.wet.doc;
      membrane     = parts.membrane;
    });

    afterEach(function() {
      dryDocument  = null;
      wetDocument  = null;

      membrane.getHandlerByName("dry").revokeEverything();
      membrane = null;
      parts    = null;
    });

    function runTest(propName, wetValue) {
      {
        let keys = Reflect.ownKeys(dryDocument);
        expect(keys.includes(propName)).toBe(false);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(dryDocument, propName);
        expect(desc).toBe(undefined);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(wetDocument, propName);
        if (desc)
          desc = desc.value;
        expect(desc).toBe(wetValue);
      }
    }

    function buildTest(requireLocal, filterKeys, propName) {
      return [
        // description
        [
          "with requireLocalDelete on the " + requireLocal + " graph",
          "filterOwnKeys on the " + filterKeys + " graph",
          "and the property name of " + propName
        ].join(", "),

        function() {
          membrane.modifyRules.filterOwnKeys(filterKeys, parts[filterKeys].doc, BlacklistFilter);
          membrane.modifyRules.requireLocalDelete(requireLocal, parts[requireLocal].doc);

          var oldValue = Reflect.get(wetDocument, propName);

          /* Define the property on the dry graph.  It should appear on the dry graph
           * but not on the wet graph.
           */
          expect(
            Reflect.deleteProperty(dryDocument, propName)
          ).toBe(true);

          runTest(propName, oldValue);

          /* Define the property with a different value on the wet graph.  The dry
           * graph should be unaffected.
           */
          expect(
            Reflect.defineProperty(wetDocument, propName, desc2)
          ).toBe(true);

          runTest(propName, 2);
        }
      ];
    }

    /* Combinations:
       requireLocalDelete: dry, wet
       filterOwnKeys: dry, wet
       property name: nodeName, blacklisted
    */
    ["dry", "wet"].forEach(function(storeUnknown) {
      ["dry", "wet"].forEach(function(filterOwn) {
        ["nodeName", "blacklisted"].forEach(function(propName) {
          var [desc, test] = buildTest(storeUnknown, filterOwn, propName);
          it(desc, test);
        });
      });
    });
  }
);
if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Whitelisting object properties", function() {
  "use strict";
  var wetDocument, dryDocument;

  function HEAT() { return "handleEventAtTarget stub"; }
  function HEAT_NEW() { return "Hello World"; }

  /* These lists specify properties defined on the objects.  For instance,
   * childNodes is defined in NodeWhiteList because every parts.wet.Node object
   * has a childNodes property.
   */

  const EventListenerWetWhiteList = [
    "handleEvent",
  ];

  const EventTargetWhiteList = [
    "addEventListener",
    "dispatchEvent",
  ];

  const NodeWhiteList = [
    "childNodes",
    "parentNode",
  ];

  const NodeProtoWhiteList = [
    "insertBefore",
    "firstChild",
  ];

  const ElementWhiteList = [
    "nodeType",
    "nodeName",
  ];

  const docWhiteList = [
    "ownerDocument",
    "childNodes",
    "nodeType",
    "nodeName",
    "parentNode",
    "createElement",
    "insertBefore",
    "firstChild",
    "baseURL",
    "addEventListener",
    "dispatchEvent",
    "rootElement",
  ];

  function defineManualMockOptions() {
    function buildFilter(names, prevFilter) {
      return function(elem) {
        if (prevFilter && prevFilter(elem))
          return true;
        return names.includes(elem);
      };
    }

    const nameFilters = {};
    nameFilters.doc = buildFilter(docWhiteList);
    nameFilters.listener = buildFilter(EventListenerWetWhiteList);
    nameFilters.target = buildFilter(EventTargetWhiteList);
    nameFilters.node = buildFilter(NodeWhiteList, nameFilters.target);
    nameFilters.element = buildFilter(ElementWhiteList, nameFilters.node);

    nameFilters.proto = {};
    nameFilters.proto.node = buildFilter(NodeProtoWhiteList, nameFilters.target);
    nameFilters.proto.element = buildFilter([], nameFilters.proto.node);
    
    var parts, dryWetMB, EventListenerProto;
    const mockOptions = {
      checkEvent: null,

      whitelist: function(meta, filter, field = "wet") {
        dryWetMB.modifyRules.storeUnknownAsLocal(field, meta.target);
        dryWetMB.modifyRules.requireLocalDelete(field, meta.target);
        dryWetMB.modifyRules.filterOwnKeys(field, meta.target, filter);
        meta.stopIteration();
      },

      wetHandlerCreated: function(handler, Mocks) {
        parts = Mocks;
        dryWetMB = parts.membrane;
        EventListenerProto = Object.getPrototypeOf(parts.wet.Node.prototype);

        {
          let oldHandleEvent = EventListenerProto.handleEventAtTarget;
          EventListenerProto.handleEventAtTarget = function(/*event*/) {
            if (mockOptions.checkEvent)
              mockOptions.checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }

        /**
         * This is a proxy listener for protecting the listener argument of
         * EventTargetWet.prototype.addEventListener().
         */
        const listener = (function(meta) {
          if ((meta.callable !== EventListenerProto.addEventListener) ||
              (meta.trapName !== "apply") ||
              (meta.argIndex !== 1))
            return;

          if (typeof meta.target == "function")
            return;

          if ((typeof meta.target != "object") || (meta.target === null))
            meta.throwException(new Error(".addEventListener requires listener be an object or a function!"));

          try {
            this.whitelist(meta, nameFilters.listener, "dry");
          }
          catch (ex) {
            meta.throwException(ex);
          }
        }).bind(this);
        handler.addProxyListener(listener);
      },

      dryHandlerCreated: function(handler/*, Mocks */) {
        /**
         * This is a long sequence of tests, matching the constructed target
         * to the whitelist to apply.  It's a little more complicated than I
         * would like, but for a manual test, it works well enough.
         */
        var listener = (function(meta) {
          if (meta.target === parts.wet.doc) {
            // parts.dry.doc will be meta.proxy.
            this.whitelist(meta, nameFilters.doc);
            return;
          }
          if (meta.target instanceof parts.wet.Element) {
            // parts.dry.Element will be meta.proxy or in the prototype chain.
            this.whitelist(meta, nameFilters.element);
            return;
          }

          if (meta.target instanceof parts.wet.Node) {
            // parts.dry.Node will be meta.proxy.
            this.whitelist(meta, nameFilters.node);
            return;
          }

          if (meta.target === parts.wet.Element) {
            this.whitelist(meta, nameFilters.proto.element);
            return;
          }

          if (meta.target === parts.wet.Node) {
            this.whitelist(meta, nameFilters.proto.node);
            return;
          }

          if (meta.target === parts.wet.Node.prototype) {
            this.whitelist(meta, nameFilters.proto.node);
            return;
          }

          if (meta.target === EventListenerProto) {
            this.whitelist(meta, nameFilters.target);
            return;
          }
        }).bind(this);

        handler.addProxyListener(listener);
      },
    };

    return mockOptions;
  }
  
  function defineMockOptionsByDistortionsListener(mainIsWet = false) {
    var parts, dryWetMB, EventListenerProto;
    const mockOptions = {
      checkEvent: null,

      wetHandlerCreated: function(handler, Mocks) {
        parts = Mocks;
        dryWetMB = parts.membrane;
        EventListenerProto = Object.getPrototypeOf(parts.wet.Node.prototype);

        const distortions = dryWetMB.modifyRules.createDistortionsListener();
        {
          let oldHandleEvent = EventListenerProto.handleEventAtTarget;
          EventListenerProto.handleEventAtTarget = function(/*event*/) {
            if (mockOptions.checkEvent)
              mockOptions.checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }

        /**
         * This is a proxy listener for protecting the listener argument of
         * EventTargetWet.prototype.addEventListener().
         */

        const evLConfig = distortions.sampleConfig();
        evLConfig.filterOwnKeys = EventListenerWetWhiteList;
        evLConfig.storeUnknownAsLocal = true;
        evLConfig.requireLocalDelete = true;

        const evLFilter = function(meta) {
          if ((meta.callable !== EventListenerProto.addEventListener) ||
              (meta.trapName !== "apply") ||
              (meta.argIndex !== 1))
            return false;

          if (typeof meta.target == "function")
            return false;

          if ((typeof meta.target != "object") || (meta.target === null)) {
            meta.throwException(new Error(".addEventListener requires listener be an object or a function!"));
            return false;
          }

          return true;
        };

        distortions.addListener(evLFilter, "filter", evLConfig);

        if (mainIsWet)
          this.whitelistMain(distortions);

        distortions.bindToHandler(handler);
      },

      whitelist: function(distortions, value, filteredOwnKeys, category) {
        const config = distortions.sampleConfig();
        config.filterOwnKeys = filteredOwnKeys;
        config.storeUnknownAsLocal = true;
        config.requireLocalDelete = true;
        distortions.addListener(value, category, config);
      },

      dryHandlerCreated: function(handler/*, Mocks */) {
        if (mainIsWet)
          return;
        const distortions = dryWetMB.modifyRules.createDistortionsListener();
        this.whitelistMain(distortions);
        distortions.bindToHandler(handler);
      },

      whitelistMain: function(distortions) {
        this.whitelist(distortions, parts.wet.doc, docWhiteList, "value");
        this.whitelist(
          distortions, parts.wet.Element, ElementWhiteList, "instance"
        );
        this.whitelist(
          distortions, parts.wet.Node, NodeWhiteList, "instance"
        );
        this.whitelist(distortions, parts.wet.Element, [], "value");
        this.whitelist(
          distortions, parts.wet.Node, NodeProtoWhiteList, "value"
        );
        this.whitelist(
          distortions, parts.wet.Node, NodeProtoWhiteList, "prototype"
        );
        this.whitelist(
          distortions, EventListenerProto, EventTargetWhiteList, "value"
        );
      },
    };

    return mockOptions;
  }

  function defineWhitelistTests(mockDefine) {
    var parts, mockOptions;
    beforeEach(function() {
      mockOptions = mockDefine();
      parts = MembraneMocks(false, null, mockOptions);
      wetDocument = parts.wet.doc;
      dryDocument = parts.dry.doc;
    });

    afterEach(function() {
      dryDocument.dispatchEvent("unload");
      dryDocument = null;
      wetDocument = null;
      mockOptions.checkEvent = null;
      mockOptions = null;
    });

    it("exposes listed values.", function() {
      let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "nodeName");
      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "nodeName");
      expect(typeof descWet).not.toBe(undefined);
      expect(typeof descDry).not.toBe(undefined);
      if (descWet && descDry) {
        expect(descWet.value).toBe("#document");
        expect(descDry.value).toBe("#document");
      }
    });

    it("hides unlisted values.", function() {
      let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
      expect(descWet).not.toBe(undefined);
      expect(typeof descWet.value).toBe("function");
      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
      expect(descDry).toBe(undefined);
    });

    it(
      "and redefining a not-whitelisted property on the wet document has no effect on the dry document.",
      function() {
        let descWet = Reflect.getOwnPropertyDescriptor(
          wetDocument,
          "handleEventAtTarget"
        );

        Reflect.defineProperty(wetDocument, "handleEventAtTarget", {
          value: HEAT,
          writable: false,
          enumerable: true,
          configurable: true,
        });

        let descDry = Reflect.getOwnPropertyDescriptor(
          dryDocument,
          "handleEventAtTarget"
        );
        expect(descDry).toBe(undefined);

        Reflect.defineProperty(wetDocument, "handleEventAtTarget", descWet);
      }
    );

    it(
      "and defining a not-whitelisted property on the dry document has no effect on the wet document.",
      function () {
        var oldDescWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");

        const isDryExtensible = Reflect.isExtensible(dryDocument);
        var defined = Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
          value: HEAT_NEW,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(isDryExtensible);

        var descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
        expect(descWet).not.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(oldDescWet.value);

        var descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
        let expectation = expect(descDry);
        if (isDryExtensible)
          expectation = expectation.not;
        expectation.toBe(undefined);
        if (descDry)
          expect(descDry.value).toBe(HEAT_NEW);
      }
    );

    it(
      "and deleting a not-whitelisted property on the dry document has no effect on the wet document.",
      function() {
        var oldDescWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");

        Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
          value: HEAT_NEW,
          writable: false,
          enumerable: true,
          configurable: true
        });

        var deleted = Reflect.deleteProperty(dryDocument, "handleEventAtTarget");
        expect(deleted).toBe(true);

        var descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
        expect(descWet).not.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(oldDescWet.value);

        var descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
        expect(descDry).toBe(undefined);
      }
    );

    it(
      "and defining a new property on the dry document has no effect on the wet document.",
      function() {
        const isDryExtensible = Reflect.isExtensible(dryDocument);
        let defined = Reflect.defineProperty(dryDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(isDryExtensible);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        let expectation = expect(descDry);
        if (isDryExtensible)
          expectation = expectation.not;
        expectation.toBe(undefined);
        if (descDry)
          expect(descDry.value).toBe(2);
      }
    );

    it(
      "and deleting a new property on the dry document has no effect on the wet document.",
      function() {
        Reflect.defineProperty(dryDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        let deleted = Reflect.deleteProperty(dryDocument, "extra");
        expect(deleted).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).toBe(undefined);
      }
    );

    it(
      "and defining a new property on the wet document has no effect on the dry document.",
      function() {
        const isWetExtensible = Reflect.isExtensible(wetDocument);
        let defined = Reflect.defineProperty(wetDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(isWetExtensible);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        let expectation = expect(descWet);
        if (isWetExtensible)
          expectation = expectation.not;
        expectation.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(2);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).toBe(undefined);
      }
    );

    it(
      "and deleting a new property on the wet document has no effect on the dry document.",
      function() {
        Reflect.defineProperty(wetDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });

        let deleted = Reflect.deleteProperty(wetDocument, "extra");
        expect(deleted).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).toBe(undefined);
      }
    );

    it("applies similarly to inherited names.", function() {
      // Whitelisting applies similarly to inherited names.
      let dryRoot = dryDocument.rootElement;
      expect(dryRoot).not.toBe(wetDocument.rootElement);
      dryDocument.insertBefore(dryRoot, null);

      // ElementWet constructor tests.
      expect(dryRoot.nodeName).toBe("root");
      expect(dryRoot.nodeType).toBe(1);

      // NodeWet constructor tests.
      {
        let kids = dryRoot.childNodes;
        let isArray = Array.isArray(kids);
        if (isArray)
          expect(kids.length).toBe(0);
      }

      /* This doesn't appear because it's not whitelisted under the
       * "instanceof parts.wet.Element" test.  Specifically, it's not part of
       * NodeWhiteList or ElementWhiteList.
       */
      expect(dryRoot.ownerDocument).toBe(undefined);

      expect(dryRoot.parentNode).not.toBe(undefined);
      expect(typeof dryRoot.wetMarker).toBe("undefined");

      // NodeWet.prototype tests
      expect(typeof dryRoot.insertBefore).toBe("function");
      expect(typeof dryRoot.shouldNotBeAmongKeys).toBe("undefined");

      // EventListenerWet tests
      expect(typeof dryRoot.__events__).toBe("undefined");

      // EventListenerWet.prototype tests
      expect(typeof dryRoot.addEventListener).toBe("function");
      expect(typeof dryRoot.dispatchEvent).toBe("function");
      expect(typeof dryRoot.handleEventAtTarget).toBe("undefined");
    });

    it("of method arguments goes both ways.", function() {
      var event = null;

      /* Testing a handleEvent function added as a method.

         We're also testing the white-listing of method arguments by the
         checkEvent function, inspecting a proxied event listener object and
         verifying that basic whitelisting of the arguments, specified manually,
         also works.  The listener object, for instance, is supposed to have
         only one property, the handleEvent() function.  Anything else is
         foreign, and the "trusted" wet code should NOT be able to propagate
         setting or deleting properties to the dry listeners that were passed in.
      */
      let listener = {
        handleEvent: function (evt) {
          event = {};
          let keys = Reflect.ownKeys(evt);
          keys.forEach((key) => { event[key] = evt[key]; }, this);
          event.thisObj = this;
        },
        didFire: false,
      };
      dryDocument.addEventListener("asMethod", listener, false);
      dryDocument.insertBefore(dryDocument.rootElement, null);

      mockOptions.checkEvent = function(event) {
        let handlers = this.__events__.slice(0);
        let length = handlers.length;
        let desired = null;
        for (let i = 0; i < length; i++) {
          let h = handlers[i];
          if (h.type !== event.type)
            continue;
          let hCode = (h.isBubbling) ? 4 - event.currentPhase : event.currentPhase;
          if (hCode === 3)
            continue;

          expect(desired).toBe(null);
          desired = h.listener;
        }

        // desired should be a proxy to listener.
        expect(desired).not.toBe(listener);
        expect(desired).not.toBe(null);
        if (desired === null)
          return;

        let keys = Reflect.ownKeys(desired);

        expect(keys.includes("handleEvent")).toBe(true);
        expect(keys.includes("didFire")).toBe(false);

        desired.foo = 3;
        expect(typeof listener.foo).toBe("undefined");
        {
          let desc = Reflect.getOwnPropertyDescriptor(desired, "foo");
          expect(desc).not.toBe(undefined);
          if (desc) {
            expect(desc.value).toBe(3);
          }
        }

        desired.didFire = true;
        expect(listener.didFire).toBe(false);

        listener.didFire = true;
        mockOptions.checkEvent = null;
      };

      dryDocument.rootElement.dispatchEvent("asMethod");
      mockOptions.checkEvent = null;
      expect(listener.didFire).toBe(true);

      expect(event).not.toBe(null);
      if (event) {
        expect(event.type).toBe("asMethod");
        expect(event.currentPhase).toBe(1);
        expect(event.thisObj).toBe(listener);
      }
    });
  }

  function defineSealingTests(mockDefine) {
    describe("on unsealed objects", function() {
      defineWhitelistTests(mockDefine);
    });

    describe("on sealed dry objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.seal(dryDocument);
      });
    });

    describe("on sealed wet objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.seal(wetDocument);
      });
    });

    describe("on frozen dry objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.freeze(dryDocument);
      });
    });

    describe("on frozen wet objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.freeze(wetDocument);
      });
    });
  }

  describe("manually", function() {
    defineSealingTests(defineManualMockOptions);
  });

  describe("automatically using distortions listeners on two object graphs", function() {
    defineSealingTests(defineMockOptionsByDistortionsListener.bind(null, false));
  });

  describe("automatically using distortions listeners on one object graph", function() {
    defineSealingTests(defineMockOptionsByDistortionsListener.bind(null, true));
  });
  
  it(
    "and getting a handler from a protected membrane works correctly",
    function() {
      function voidFunc() {}

      const DogfoodLogger = {
        _errorList: [],
        error: function(e) {
          this._errorList.push(e);
        },
        warn: voidFunc,
        info: voidFunc,
        debug: voidFunc,
        trace: voidFunc,

        getFirstError: function() {
          return this._errorList.length ? this._errorList[0] : undefined;
        }
      };
      const Dogfood = new Membrane({logger: DogfoodLogger});

      const publicAPI   = Dogfood.getHandlerByName(
        "public", { mustCreate: true }
      );
      const internalAPI = Dogfood.getHandlerByName(
        "internal", { mustCreate: true }
      );

      // lockdown of the public API here
      const mbListener = {
        mustProxyMethods: new Set(),

        whitelist: function(meta, names, field="internal") {
          if (typeof meta.target === "function")
          {
            names = names.concat(["prototype", "length", "name"]);
          }

          names = new Set(names);
          Dogfood.modifyRules.storeUnknownAsLocal(field, meta.target);
          Dogfood.modifyRules.requireLocalDelete(field, meta.target);
          Dogfood.modifyRules.filterOwnKeys(
            field, meta.target, names.has.bind(names)
          );
          meta.stopIteration();
        },

        handleProxy: function(meta) {
          if (meta.target instanceof Membrane)
          {
            this.whitelist(meta, ["modifyRules", "logger"]);
          }
          else if (meta.target === Membrane)
          {
            this.whitelist(meta, []);
          }
          else if (meta.target === Membrane.prototype)
          {
            this.whitelist(meta, [
              "hasHandlerByField",
              "getHandlerByName",
              "convertArgumentToProxy",
              "warnOnce"
            ]);
          }
          else if (!this.mustProxyMethods.has(meta.target))
          {
            meta.proxy = meta.target;
          }
        }
      };

      {
        let keys = Reflect.ownKeys(Membrane.prototype);
        keys.forEach(function(propName) {
          let value = Membrane.prototype[propName];
          if (typeof value == "function")
            mbListener.mustProxyMethods.add(value);
        });
      }

      Object.freeze(mbListener);
      publicAPI.addProxyListener(mbListener.handleProxy.bind(mbListener));

      const DMembrane = Dogfood.convertArgumentToProxy(
        internalAPI, publicAPI, Membrane
      );
  
      expect(function() {
        const dryWetMB = new DMembrane();
        dryWetMB.getHandlerByName(
          "wet", { mustCreate: true }
        );
      }).not.toThrow();
      expect(DogfoodLogger.getFirstError()).toBe(undefined);
    }
  );
});
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("Truncation of argument lists", function() {
  "use strict";

  var wetDocument, dryDocument, membrane, parts;
  const arg0 = "arg0", arg1 = "arg1", arg2 = "arg2";

  var argCount, target, check, truncator;

  // a and b are here solely to check for function arity.
  function checkArgCount(a, b) {
    argCount = arguments.length;
    if (arguments.length > 0)
      expect(arguments[0]).toBe(arg0);
    if (arguments.length > 1)
      expect(arguments[1]).toBe(arg1);
    if (arguments.length > 2)
      expect(arguments[2]).toBe(arg2);
  }

  beforeEach(function() {
    parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
    membrane = parts.membrane;

    wetDocument.checkArgCount = checkArgCount;
    target = dryDocument.checkArgCount;

    argCount = NaN;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
    check = null;
  });

  function defineTests(fieldName) {
    it(
      "is disabled by default:  any number of arguments is allowed",
      function() {
        target(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "goes to the function's arity when truncateArgList is invoked with true",
      function() {
        truncator(true);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(2);
      }
    );

    it(
      "allows any number of arguments when truncateArgList is invoked with false",
      function() {
        truncator(false);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "goes to the specified length when truncateArgList is invoked with a positive number",
      function() {
        truncator(1);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(1);
      }
    );

    it(
      "goes to the specified length when truncateArgList is invoked with 0",
      function() {
        truncator(0);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(0);
      }
    );

    it(
      "does not add arguments when truncateArgList is invoked with a number greater than the functipn's arity",
      function() {
        truncator(100);
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with a non-integer number",
      function() {
        expect(function() {
          truncator(2.5);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with a negative number",
      function() {
        expect(function() {
          truncator(-1);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with an infinite number",
      function() {
        expect(function() {
          truncator(Infinity);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with NaN",
      function() {
        expect(function() {
          truncator(NaN);
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with a string",
      function() {
        expect(function() {
          truncator("foo");
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );

    it(
      "is rejected when truncateArgList is invoked with an object",
      function() {
        expect(function() {
          truncator({});
        }).toThrow();
        check(arg0, arg1, arg2);
        expect(argCount).toBe(3);
      }
    );
  }

  function defineGraphTests(fieldName) {
    beforeEach(function() {
      truncator = function(limit) {
        membrane.modifyRules.truncateArgList(
          fieldName, parts[fieldName].doc.checkArgCount, limit
        );
      };
    });

    describe("and the apply trap", function() {
      beforeEach(function() {
        check = dryDocument.checkArgCount;
      });
      defineTests(fieldName);
    });

    describe("and the construct trap", function() {
      beforeEach(function() {
        check = function(a0, a1, a2) {
          return new target(a0, a1, a2);
        };
      });
      defineTests(fieldName);
    });
  }

  describe("on the wet graph", function() {
    defineGraphTests("wet");
  });

  describe("on the dry graph", function() {
    defineGraphTests("dry");
  });

  describe("on both the wet and dry graphs, the lower non-negative integer applies", function() {
    beforeEach(function() {
      truncator = function(wetLimit, dryLimit) {
        membrane.modifyRules.truncateArgList(
          "wet", parts.wet.doc.checkArgCount, wetLimit
        );

        membrane.modifyRules.truncateArgList(
          "dry", parts.dry.doc.checkArgCount, dryLimit
        );

        check = dryDocument.checkArgCount;
      };
    });

    it("from the wet graph", function() {
      truncator(1, 3);
      check(arg0, arg1, arg2);
      expect(argCount).toBe(1);
    });

    it("from the dry graph", function() {
      truncator(3, 1);
      check(arg0, arg1, arg2);
      expect(argCount).toBe(1);
    });
  });
});
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("TC39 demonstrations of Array objects in membranes: ", function() {
  "use strict";
  let parts, logger;
  function buildElement(name) {
    let rv = {name};
    Object.freeze(rv);
    return rv;
  }

  beforeEach(function() {
    parts = {
      wet: {
        alpha: buildElement("alpha"),
        beta: buildElement("beta"),
        gamma: buildElement("gamma"),
        delta: buildElement("delta"),
        epsilon: buildElement("epsilon"),
        omega: buildElement("omega"),
        array: [],
      },
      dry: {},
      handlers: {},
      membrane: new Membrane(),
    };

    parts.wet.array.push(parts.wet.alpha);
    parts.wet.array.push(parts.wet.beta);
    parts.wet.array.push(parts.wet.gamma);

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
      "dry", { mustCreate: true }
    );
  });

  function populateDry() {
    Reflect.ownKeys(parts.wet).forEach(function(key) {
      parts.dry[key] = parts.membrane.convertArgumentToProxy(
        parts.handlers.wet,
        parts.handlers.dry,
        parts.wet[key]
      );
    });

    expect(parts.dry.array).toEqual([
      parts.dry.alpha,
      parts.dry.beta,
      parts.dry.gamma
    ]);
  }

  afterEach(function() {
    parts.handlers.dry.revokeEverything();
    parts.handlers.wet.revokeEverything();
    parts = null;
    logger = null;
  });
  
  it("Without distortions, mirroring functions normally", function() {
    populateDry();

    parts.dry.array.splice(1, 1, parts.dry.delta, parts.dry.epsilon);
    expect(parts.wet.array).toEqual([
      parts.wet.alpha,
      parts.wet.delta,
      parts.wet.epsilon,
      parts.wet.gamma
    ]);

    expect(parts.dry.array).toEqual([
      parts.dry.alpha,
      parts.dry.delta,
      parts.dry.epsilon,
      parts.dry.gamma
    ]);

    parts.wet.array.splice(0, 2, parts.wet.omega);
    expect(parts.wet.array).toEqual([
      parts.wet.omega,
      parts.wet.epsilon,
      parts.wet.gamma
    ]);

    expect(parts.dry.array).toEqual([
      parts.dry.omega,
      parts.dry.epsilon,
      parts.dry.gamma
    ]);
  });

  it(
    "A natural call to .splice operates on the native graph, but doesn't respect storeUnknownAsLocal",
    function() {
      parts.handlers.dry.addProxyListener(function(meta) {
        if (meta.target === parts.wet.array)
        {
          try {
            parts.membrane.modifyRules.storeUnknownAsLocal("dry", meta.proxy);
          }
          catch (e) {
            meta.throwException(e);
          }
        }
      });

      populateDry();

      /* At this point, parts.dry.array has never seen delta or epsilon.  The
       * proxy has explicitly been told that new properties should stay local to
       * the proxy and not propagate through... but the splice method belongs
       * to the wet object graph, so execution takes place there and the
       * membrane ignores the storeUnknownAsLocal setting for the array.
       */

      parts.dry.array.splice(1, 1, parts.dry.delta, parts.dry.epsilon);
      expect(parts.wet.array).toEqual([
        parts.wet.alpha,
        parts.wet.delta,
        parts.wet.epsilon,
        parts.wet.gamma
      ]);

      expect(parts.dry.array).toEqual([
        parts.dry.alpha,
        parts.dry.delta,
        parts.dry.epsilon,
        parts.dry.gamma
      ]);
    }
  );

  it(
    "Array.prototype.splice behaves oddly with storeUnknownAsLocal",
    function() {
      let appender, chain;

      // this is all boilerplate for internal debugging
      if (false) {
        logger = loggerLib.getLogger("test.membrane.tc39.arrays");
        appender = new loggerLib.Appender();
        logger.addAppender(appender);

        chain = parts.membrane.modifyRules.createChainHandler(
          parts.handlers.dry
        );
        parts.membrane.allTraps.forEach(function(trap) {
          chain[trap] = function() {
            logger.info(trap + " enter");
            const rv = this.nextHandler[trap].apply(this, arguments);
            logger.info(trap + " leave");
            return rv;
          };
        });

        ["get", "getOwnPropertyDescriptor"].forEach(function(trap) {
          chain[trap] = function(target, propertyName) {
            try {
              logger.info(trap + " enter " + propertyName);
            }
            catch (e) {
              logger.info(trap + " enter");
            }
            const rv = this.nextHandler[trap].apply(this, arguments);
            try {
              logger.info(trap + " leave " + propertyName);
            }
            catch (e) {
              logger.info(trap + " leave");
            }
            return rv;
          };
        });

        ["set", "defineProperty"].forEach(function(trap) {
          chain[trap] = function(target, propertyName) {
            const hasDesc = Boolean(
              this.nextHandler.getOwnPropertyDescriptor(target, propertyName)
            );
            try {
              logger.info(`${trap} enter ${propertyName} (has: ${hasDesc})`);
            }
            catch (e) {
              logger.info(`${trap} enter (has: ${hasDesc})`);
            }
            const rv = this.nextHandler[trap].apply(this, arguments);
            try {
              logger.info(trap + " leave " + propertyName);
            }
            catch (e) {
              logger.info(trap + " leave");
            }
            return rv;
          };
        });
      }

      parts.handlers.dry.addProxyListener(function(meta) {
        if (meta.target !== parts.wet.array)
          return;
        try {
          parts.membrane.modifyRules.storeUnknownAsLocal("dry", meta.proxy);
          if (chain)
            parts.membrane.modifyRules.replaceProxy(meta.proxy, chain);
        }
        catch (e) {
          meta.throwException(e);
        }
      });
      populateDry();

      // debugging
      if (appender)
        appender.clear();

      /* [ alpha, beta, gamma ] */

      /* At this point, parts.dry.array has never seen delta or epsilon.  The
       * proxy has explicitly been told that new properties should stay local to
       * the proxy and not propagate through...
       *
       * This time, we use splice.apply to simulate running splice in the dry
       * object graph, which is about to cause its own problems.
       */

      Array.prototype.splice.apply(parts.dry.array, [
        1, 1, parts.dry.delta, parts.dry.epsilon
      ]);

      expect(parts.dry.array.length).toBe(4);
      expect(parts.dry.array[0]).toBe(parts.dry.alpha);
      expect(parts.dry.array[1]).toBe(parts.dry.delta);
      expect(parts.dry.array[2]).toBe(parts.dry.epsilon);
      expect(parts.dry.array[3]).toBe(parts.dry.gamma);

      expect(parts.wet.array.length).toBe(4);
      expect(parts.wet.array[0]).toBe(parts.wet.alpha);

      expect(parts.wet.array.includes(parts.wet.gamma)).toBe(false);

      /* XXX ajvincent This is actually pretty bad.  The same operation on the
       * wet graph would have resulted in [ alpha, delta, epsilon, gamma ].
       *
       * At the same time, I don't believe this is, strictly speaking, a bug in
       * the membrane implementation.  Normally, when I have a test that shows
       * buggy behavior, I tend to think either the implementation is broken,
       * the test is broken, both, or that there's a flaw in the design.
       *
       * This shows something different:  I'm using an API in a way that it was
       * never designed to be used.  I'm performing a distortion on an array
       * (storeUnknownAsLocal), and then doing a simple splice on it.
       *
       * With a distortion on an array, typically there would be three desirable
       * outcomes to choose from:
       *
       * (1) Holes in the array, when we're hiding something
       * (2) Explicitly undefined spaces in the array, when we're hiding something
       * (3) A continuous list of elements, maintaining order and consistency.
       *
       * Here, we've violated that.  The gamma element was in the array before
       * the splice.  The splice shouldn't have removed it, but it did.
       *
       * This comes down to the algorithm of the splice method as it's
       * defined in the ECMAScript specification.  In particular, it does the
       * rearranging and insertion of elements in-place.  The "this" argument of
       * the splice method is a Proxy that moves the setting of unknown
       * properties to the proxy only - leaving them out of the unwrapped array.
       *
       * Specifically, `this[3] = parts.dry.gamma` is a step that happens inside
       * the splice algorithm here, but that means parts.wet.gamma[3] is not
       * correspondingly set.  Then later, when this[1] and this[2] are also set
       * using the Proxy API, the reference to parts.wet.gamma is permanently
       * lost from the wet array.
       *
       * So yes, we've created a hole in the wet array (which is acceptable, if
       * ugly), but we've also created data-loss (which is not acceptable).
       *
       * Individually though, each of the pieces is working as it was originally
       * intended:  splice is very specifically designed, as is the Proxy API,
       * and storeUnknownAsLocal is simply forcing the proxy to keep "new" values
       * private.  It's the combination that's flawed, and the combination that
       * needs special handling.
       */
    }
  );
});
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

it(
  "Map instances by default in a membrane work like they do without a membrane",
  function() {
    "use strict";
  
    let membrane, wetHandler, dryHandler, dampHandler, wetMap, dryMap, dampMap;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler  = membrane.getHandlerByName("dry", MUSTCREATE);
      dampHandler = membrane.getHandlerByName("dry", MUSTCREATE);
  
      wetMap  = new Map();
      dryMap  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetMap);
      // we rarely create proxies this way in our tests, so this'll be useful
      dampMap = membrane.convertArgumentToProxy(dryHandler, dampHandler, dryMap);
    }
  
    function expectSize(s) {
      expect(wetMap.size ).toBe(s);
      expect(dryMap.size ).toBe(s);
      expect(dampMap.size).toBe(s);
    }

    function checkMap(map, keys, values, shouldHave = true) {
      keys.forEach(function(key, index) {
        const value = values[index];
        expect(map.has(key)).toBe(shouldHave);
        expect(map.get(key)).toBe(shouldHave ? value : undefined);

        let items = new Set(map.keys());
        expect(items.has(key)).toBe(shouldHave);

        items = new Set(map.values());
        expect(items.has(value)).toBe(shouldHave);

        items = Array.from(map.entries());
        expect(items.some(function(item) {
          return (item[0] == key) && (item[1] == value);
        })).toBe(shouldHave);

        let foundValue = 0, foundKey = 0, foundAll = 0, thisArg = { isThis: true };
        map.forEach(function(v, k, m) {
          expect(this).toBe(thisArg);
          expect(m).toBe(map);

          if (v == value)
            foundValue++;
          if (k == key)
            foundKey++;
          if ((v == value) && (k == key))
            foundAll++;
        }, thisArg);
        expect(foundValue).toBe(shouldHave ? 1 : 0);
        expect(foundKey).toBe(shouldHave ? 1 : 0);
        expect(foundAll).toBe(shouldHave ? 1 : 0);
      });
    }
  
    const dryKey1 = {}, dryValue1 = {},
          dryKey2 = {}, dryValue2 = {};
    dryMap.set(dryKey1, dryValue1);
    expectSize(1);
    checkMap(dryMap, [dryKey1], [dryValue1], true);
    checkMap(dryMap, [dryKey2], [dryValue2], false);
  
    const wetKey1 = {}, wetValue1 = {};
    wetMap.set(wetKey1, wetValue1);
    expectSize(2);
    checkMap(dryMap, [dryKey1], [dryValue1], true);
    checkMap(dryMap, [dryKey2], [dryValue2], false);
    checkMap(wetMap, [wetKey1], [wetValue1], true);
  
    dryMap.set(dryKey2, dryValue2);
    expectSize(3);
    checkMap(dryMap, [dryKey1, dryKey2], [dryValue1, dryValue2], true);
    checkMap(wetMap, [wetKey1], [wetValue1], true);  

    // deleting a key it doesn't have
    dryMap.delete(dryValue1);
    expectSize(3);
    checkMap(dryMap, [dryKey1, dryKey2], [dryValue1, dryValue2], true);
    checkMap(wetMap, [wetKey1], [wetValue1], true);  

    dryMap.delete(dryKey1);
    expectSize(2);
    checkMap(dryMap, [dryKey1], [dryValue1], false);
    checkMap(dryMap, [dryKey2], [dryValue2], true);
    checkMap(wetMap, [wetKey1], [wetValue1], true);

    dryMap.clear();
    expectSize(0);
    checkMap(dryMap, [dryKey1, dryKey2], [dryValue1, dryValue2], false);
    checkMap(wetMap, [wetKey1], [wetValue1], false);
  }
);
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

it(
  "WeakMap instances by default in a membrane work like they do without a membrane",
  function() {
    "use strict";
  
    let membrane, wetHandler, dryHandler, dampHandler, wetMap, dryMap, dampMap;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler  = membrane.getHandlerByName("dry", MUSTCREATE);
      dampHandler = membrane.getHandlerByName("damp", MUSTCREATE);
  
      wetMap  = new WeakMap();
      dryMap  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetMap);
      // we rarely create proxies this way in our tests, so this'll be useful
      dampMap = membrane.convertArgumentToProxy(dryHandler, dampHandler, dryMap);
    }
  
    function checkMap(map, keys, values, shouldHave = true) {
      keys.forEach(function(key, index) {
        const value = values[index];
        expect(map.has(key)).toBe(shouldHave);
        expect(map.get(key)).toBe(shouldHave ? value : undefined);
      });
    }
  
    const dryKey1 = {}, dryValue1 = {},
          dryKey2 = {}, dryValue2 = {};
    dryMap.set(dryKey1, dryValue1);
    checkMap(dryMap, [dryKey1], [dryValue1], true);
    checkMap(dryMap, [dryKey2], [dryValue2], false);
  
    const wetKey1 = {}, wetValue1 = {};
    wetMap.set(wetKey1, wetValue1);
    checkMap(dryMap, [dryKey1], [dryValue1], true);
    checkMap(dryMap, [dryKey2], [dryValue2], false);
    checkMap(wetMap, [wetKey1], [wetValue1], true);
  
    dryMap.set(dryKey2, dryValue2);
    checkMap(dryMap, [dryKey1, dryKey2], [dryValue1, dryValue2], true);
    checkMap(wetMap, [wetKey1], [wetValue1], true);  

    // deleting a key it doesn't have
    dryMap.delete(dryValue1);
    checkMap(dryMap, [dryKey1, dryKey2], [dryValue1, dryValue2], true);
    checkMap(wetMap, [wetKey1], [wetValue1], true);  

    dryMap.delete(dryKey1);
    checkMap(dryMap, [dryKey1], [dryValue1], false);
    checkMap(dryMap, [dryKey2], [dryValue2], true);
    checkMap(wetMap, [wetKey1], [wetValue1], true);
  }
);
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

it(
  "Set instances by default in a membrane work like they do without a membrane",
  function() {
    "use strict";
  
    let membrane, wetHandler, dryHandler, dampHandler, wetSet, drySet, dampSet;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler  = membrane.getHandlerByName("dry", MUSTCREATE);
      dampHandler = membrane.getHandlerByName("damp", MUSTCREATE);
  
      wetSet  = new Set();
      drySet  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetSet);
      // we rarely create proxies this way in our tests, so this'll be useful
      dampSet = membrane.convertArgumentToProxy(dryHandler, dampHandler, drySet);
    }
  
    function expectSize(s) {
      expect(wetSet.size ).toBe(s);
      expect(drySet.size ).toBe(s);
      expect(dampSet.size).toBe(s);
    }

    function checkSet(set, values, shouldHave = true) {
      values.forEach(function(value) {
        expect(set.has(value)).toBe(shouldHave);

        let items = new Set(set.values());
        expect(items.has(value)).toBe(shouldHave);

        items = Array.from(set.entries());
        expect(items.some(function(item) {
          return (item[0] == value) && (item[1] == value);
        })).toBe(shouldHave);

        let foundValue = 0, foundKey = 0, foundAll = 0, thisArg = { isThis: true };
        set.forEach(function(v, k, s) {
          expect(this).toBe(thisArg);
          expect(s).toBe(s);

          if (v == value)
            foundValue++;
          if (k == value)
            foundKey++;
          if ((v == value) && (k == value))
            foundAll++;
        }, thisArg);
        expect(foundValue).toBe(shouldHave ? 1 : 0);
        expect(foundKey).toBe(shouldHave ? 1 : 0);
        expect(foundAll).toBe(shouldHave ? 1 : 0);
      });
    }
  
    const dryValue1 = {}, dryValue2 = {};
    drySet.add(dryValue1);
    expectSize(1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
  
    const wetValue1 = {};
    wetSet.add(wetValue1);
    expectSize(2);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
    checkSet(wetSet, [wetValue1], true);
  
    drySet.add(dryValue2);
    expectSize(3);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    // deleting a key it doesn't have
    drySet.delete({});
    expectSize(3);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    drySet.delete(dryValue1);
    expectSize(2);
    checkSet(drySet, [dryValue1], false);
    checkSet(drySet, [dryValue2], true);
    checkSet(wetSet, [wetValue1], true);

    drySet.clear();
    expectSize(0);
    checkSet(drySet, [dryValue1, dryValue2], false);
    checkSet(wetSet, [wetValue1], false);
  }
);
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

it(
  "Set instances by default in a membrane work like they do without a membrane",
  function() {
    "use strict";
  
    let membrane, wetHandler, dryHandler, dampHandler, wetSet, drySet, dampSet;
    {
      const MUSTCREATE = Object.freeze({ mustCreate: true });
      membrane = new Membrane();
      wetHandler  = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler  = membrane.getHandlerByName("dry", MUSTCREATE);
      dampHandler = membrane.getHandlerByName("damp", MUSTCREATE);
  
      wetSet  = new WeakSet();
      drySet  = membrane.convertArgumentToProxy(wetHandler, dryHandler,  wetSet);
      // we rarely create proxies this way in our tests, so this'll be useful
      dampSet = membrane.convertArgumentToProxy(dryHandler, dampHandler, drySet);
    }
  
    function checkSet(set, values, shouldHave = true) {
      values.forEach(function(value) {
        expect(set.has(value)).toBe(shouldHave);
      });
    }
  
    const dryValue1 = {}, dryValue2 = {};
    drySet.add(dryValue1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
  
    const wetValue1 = {};
    wetSet.add(wetValue1);
    checkSet(drySet, [dryValue1], true);
    checkSet(drySet, [dryValue2], false);
    checkSet(wetSet, [wetValue1], true);
  
    drySet.add(dryValue2);
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    // deleting a key it doesn't have
    drySet.delete({});
    checkSet(drySet, [dryValue1, dryValue2], true);
    checkSet(wetSet, [wetValue1], true);  

    drySet.delete(dryValue1);
    checkSet(drySet, [dryValue1], false);
    checkSet(drySet, [dryValue2], true);
    checkSet(wetSet, [wetValue1], true);
  }
);
"use strict"

/* Suppose I have a whole hierarchy of objects which I wish to expose
 * through the membrane, but I really don't want outsiders setting
 * properties willy-nilly on my code base.  I'm debugging, and all these
 * extra properties are just noise to my objects.
 *
 * The first step I can take to protect myself is to state I will not accept
 * properties I don't know about.  I do this by telling the membrane that I
 * want it to store any properties with an unknown name on the object graph
 * that requested it.
 *
 * I want to do this deep in the prototype chain.  Anything that inherits from
 * an object I control -- and the deepest such objects in my mocks which are
 * directly reachable are instances of NodeWet.  (Yes, there's
 * EventListenerWet... but let's not overcomplicate things.)
 *
 * I suppose if I'm really serious, I could call storeUnknownAsLocal on
 * Object.prototype... but that may be overkill, and whitelisting or
 * blacklisting of properties is probably a better solution anyway.
 */

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

{
  it("Use case:  membrane.modifyRules.storeUnknownAsLocal", function() {
    /* XXX ajvincent This is a hack, for a property that shouldn't be in the
       real membrane.
    */
    function fixKeys(keys) {
      if (keys.includes("membraneGraphName"))
        keys.splice(keys.indexOf("membraneGraphName"), 1);
    }

    var dryRoot, wetRoot, wetPropKeys;

    // Internal code, setting up the environment.
    {
      let parts = MembraneMocks();
      let dryWetMB = parts.membrane;
      parts.handlers.wet.ensureMapping(parts.wet.Node.prototype);
      dryWetMB.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node.prototype);

      wetRoot = parts.wet.doc.rootElement;
      wetPropKeys = Object.keys(wetRoot);
      fixKeys(wetPropKeys);

      dryRoot = parts.dry.doc.rootElement;
    }

    // External code, which this environment only partially controls.
    {
      let firstKeySet = Object.keys(dryRoot);
      fixKeys(firstKeySet);

      dryRoot.factoids = {
        statesInTheUSA: 50,
        baseballTeams: 30
      };
      dryRoot.timestamp = new Date();
      dryRoot.authorName = "John Doe";
      // and other miscellaneous crud

      let secondKeySet = Object.keys(dryRoot);
      fixKeys(secondKeySet);
      expect(secondKeySet.length).toBe(firstKeySet.length + 3);
      for (let i = 0; i < firstKeySet.length; i++) {
        expect(secondKeySet[i]).toBe(firstKeySet[i]);
      }
      secondKeySet = secondKeySet.slice(firstKeySet.length);
      expect(secondKeySet[0]).toBe("factoids");
      expect(secondKeySet[1]).toBe("timestamp");
      expect(secondKeySet[2]).toBe("authorName");
    }

    // Back to internal code, we should see NO changes whatsoever.
    // We check this with Object.keys().
    {
      let keys = Object.keys(wetRoot);
      fixKeys(keys);
      expect(keys.length).toBe(wetPropKeys.length);
      let length = Math.min(keys.length, wetPropKeys.length);
      for (let i = 0; i < length; i++)
        expect(keys[i]).toBe(wetPropKeys[i]);
    }
  });
}
"use strict"

/* In almost any JavaScript hierarchy of objects, there are certain properties
 * which the objects need to exist.  (Some turkey may try to redefine them by
 * .defineProperty, but that's a different story.)  The best way to protect your
 * required properties is to define them using Object.defineProperties(), with
 * each individual descriptor having its configurable flag set to false.  The
 * second best way is to use Object.seal() on the object holding those
 * properties.
 *
 * But if you need to be able to delete your properties, and you want to prevent
 * others from deleting them, the requireLocalDelete() method of the ModifyRules
 * API will do.
 */

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

let MockupsForThisTest = function() {
  // This function you're free to customize any way you want.
  let parts = MembraneMocks();
  return parts;
};

it("Use case:  membrane.modifyRules.requireLocalDelete", function() {
  // Customize this for whatever variables you need.
  var parts = MockupsForThisTest();
  parts.membrane.modifyRules.requireLocalDelete("wet", parts.wet.doc);

  delete parts.dry.doc.__events__;
  expect("__events__" in parts.dry.doc).toBe(false);

  expect("__events__" in parts.wet.doc).toBe(true);

  parts.dry.doc.dispatchEvent("unload");
  expect(function() {
    void(parts.dry.doc.nodeType); 
  }).toThrow();
});
"use strict";

/* An API often means to expose only a specific subset of properties.  Anything
 * else must be hidden as private.  By filtering the list of own keys, a
 * developer can hide private properties so that the end-user never sees them.
 *
 * This testcase should be rewritten when we support membrane.addProxyListener.
*/

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

{
  it("Use case:  Hiding properties of an object", function() {
    /* XXX ajvincent This is a hack, for a property that shouldn't be in the
       real membrane.
    */
    function fixKeys(keys) {
      if (keys.includes("membraneGraphName"))
        keys.splice(keys.indexOf("membraneGraphName"), 1);
    }

    var dryDocument, wetDocument;

    // Internal code, setting up the environment.
    {
      let parts = MembraneMocks();
      let dryWetMB = parts.membrane;
      wetDocument = parts.wet.doc;

      const whiteListedDocProps = new Set([
        "ownerDocument", "childNodes", "nodeType", "nodeName", "parentNode",
        "createElement", "insertBefore", "firstChild", "baseURL", "rootElement",
        "dispatchEvent", "addEventListener", "membraneGraphName"
      ]);
      let wetDocFilter = function(propName) {
        return whiteListedDocProps.has(propName);
      };

      dryWetMB.modifyRules.filterOwnKeys("wet", wetDocument, wetDocFilter);

      dryDocument = parts.dry.doc;
    }

    // External code, which this environment only partially controls.
    {
      let firstKeySet = Object.keys(dryDocument);
      fixKeys(firstKeySet);

      // Publicly defined property
      expect(firstKeySet.includes("nodeType")).toBe(true);
      expect(dryDocument.nodeType).toBe(9);

      // Hidden property
      expect(firstKeySet.includes("shouldNotBeAmongKeys")).toBe(false);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "shouldNotBeAmongKeys"))
            .toBe(undefined);

      // Hidden property modified
      wetDocument.shouldNotBeAmongKeys = true;

      // New property added on the wet side
      wetDocument.extra = 6;

      let secondKeySet = Object.keys(dryDocument);
      fixKeys(secondKeySet);
      expect(secondKeySet.length).toBe(firstKeySet.length);
      let count = Math.min(firstKeySet.length, secondKeySet.length);
      for (let i = 0; i < count; i++)
        expect(secondKeySet[i]).toBe(firstKeySet[i]);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "shouldNotBeAmongKeys"))
            .toBe(undefined);
      expect(Reflect.getOwnPropertyDescriptor(dryDocument, "extra"))
            .toBe(undefined);
    }
  });
}
/* The concept of whitelisting is pretty easy to explain, but hard to implement.
 * Basically, when you whitelist a set of properties, you are restricting what
 * other users can see of your property lists.  One good analogy is private
 * properties and methods in C++.  JavaScript technically doesn't have private
 * properties, only closures which attempt to emulate them, and proxies which
 * really can emulate them, with some difficulty.
 *
 * This use case is a demonstration of a practical whitelisting, protecting
 * certain properties from being accessed or overwritten incorrectly.  It relies
 * on four main features of the membrane:
 *
 * (1) storeUnknownAsLocal, which means that new properties do not propagate to
 * the underlying objects
 * (2) requireLocalDelete, which means that delete operations do not propagate.
 * (3) filterOwnKeys, which limits the list of properties that proxies do see
 * (4) Proxy listeners, which can apply the other three features to a proxy
 *     when the membrane first creates the proxy, and notably before the
 *     end-user ever sees that proxy.
 *
 * "trusted" code should never assume that "untrusted" code doesn't locally
 * define a property name that trusted code relies on.  The filterOwnKeys
 * feature hides a property, while storeUnknownAsLocal and requireLocalDelete
 * prevent the untrusted code from affecting the trusted property.
 *
 * It's important to note that the whitelisting has to work both ways:  an event
 * listener in the DOM, for instance, comes from "untrusted" code, and "trusted"
 * code must only see the .handleEvent() method of the untrusted event handler.
 * Otherwise, the trusted code could accidentally contaminate the event handler
 * with unexpected properties.
 */

if ((typeof MembraneMocks != "function") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, DAMP } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Use case:  The membrane can be used to safely whitelist properties", function() {
  function buildTests(shouldStop, secondWetListener, secondDryListener, extraTests) {
    function HEAT() { return descWet.value.apply(this, arguments); }
    function HEAT_NEW() { return "Hello World"; }

    const EventListenerWetWhiteList = [
      "handleEvent",
    ];

    const EventTargetWhiteList = [
      "addEventListener",
      "dispatchEvent",
    ];

    const NodeWhiteList = [
      "childNodes",
      "ownerDocument",
      "parentNode",
    ];

    const NodeProtoWhiteList = [
      "insertBefore",
      "firstChild",
    ];

    const ElementWhiteList = [
      "nodeType",
      "nodeName",
    ];

    const docWhiteList = [
      "ownerDocument",
      "childNodes",
      "nodeType",
      "nodeName",
      "parentNode",
      "createElement",
      "insertBefore",
      "firstChild",
      "baseURL",
      "addEventListener",
      "dispatchEvent",
      "rootElement",
    ];

    function buildFilter(names, prevFilter) {
      return function(elem) {
        if (prevFilter && prevFilter(elem))
          return true;
        return names.includes(elem);
      };
    }

    const nameFilters = {};
    nameFilters.doc = buildFilter(docWhiteList);
    nameFilters.listener = buildFilter(EventListenerWetWhiteList);
    nameFilters.target = buildFilter(EventTargetWhiteList);
    nameFilters.node = buildFilter(NodeWhiteList, nameFilters.target);
    nameFilters.element = buildFilter(ElementWhiteList, nameFilters.node);
    nameFilters.proto = {};
    nameFilters.proto.function = buildFilter(Reflect.ownKeys(function() {}));
    nameFilters.proto.node = buildFilter(NodeProtoWhiteList, nameFilters.proto.function);
    nameFilters.proto.element = buildFilter([], nameFilters.proto.node);
    
    var parts, dryWetMB, descWet;
    var EventListenerProto, checkEvent = null;
    var mockOptions = {
      whitelist: function(meta, filter, field = "wet") {
        dryWetMB.modifyRules.storeUnknownAsLocal(field, meta.target);
        dryWetMB.modifyRules.requireLocalDelete(field, meta.target);
        dryWetMB.modifyRules.filterOwnKeys(field, meta.target, filter);
        if (shouldStop)
          meta.stopIteration();
      },

      wetHandlerCreated: function(handler, Mocks) {
        parts = Mocks;
        dryWetMB = parts.membrane;
        EventListenerProto = Object.getPrototypeOf(parts.wet.Node.prototype);

        {
          let oldHandleEvent = EventListenerProto.handleEventAtTarget;
          EventListenerProto.handleEventAtTarget = function() {
            if (checkEvent)
              checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }


        var listener = (function(meta) {
          if ((meta.callable !== EventListenerProto.addEventListener) ||
              (meta.trapName !== "apply") ||
              (meta.argIndex !== 1))
            return;

          if (typeof meta.target == "function")
            return;

          if ((typeof meta.target != "object") || (meta.target === null))
            meta.throwException(new Error(".addEventListener requires listener be an object or a function!"));

          try {
            this.whitelist(meta, nameFilters.listener, "dry");
          }
          catch (ex) {
            meta.throwException(ex);
          }
        }).bind(this);

        handler.addProxyListener(listener);

        handler.addProxyListener(secondWetListener);
      },

      dryHandlerCreated: function(handler/*, Mocks */) {
        var listener = (function(meta) {
          if (meta.target === parts.wet.doc) {
            // parts.dry.doc will be meta.proxy.
            this.whitelist(meta, nameFilters.doc);
            return;
          }
          if (meta.target instanceof parts.wet.Element) {
            // parts.dry.Element will be meta.proxy.
            this.whitelist(meta, nameFilters.element);
            return;
          }
          if (meta.target instanceof parts.wet.Node) {
            // parts.dry.Node will be meta.proxy.
            this.whitelist(meta, nameFilters.node);
            return;
          }

          if (meta.target === parts.wet.Element) {
            this.whitelist(meta, nameFilters.proto.element);
            return;
          }

          if (meta.target === parts.wet.Node) {
            this.whitelist(meta, nameFilters.proto.node);
            return;
          }

          if (meta.target === parts.wet.Node.prototype) {
            this.whitelist(meta, nameFilters.proto.node);
            return;
          }

          if (meta.target === EventListenerProto) {
            this.whitelist(meta, nameFilters.target);
            return;
          }
        }).bind(this);

        handler.addProxyListener(listener);

        handler.addProxyListener(secondDryListener);
      },
    };
    mockOptions.dampHandlerCreated = mockOptions.dryHandlerCreated;

    parts = MembraneMocks(true, null, mockOptions);
    var wetDocument = parts.wet.doc, dryDocument = parts.dry.doc;

    {
      descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "nodeName");
      void(dryDocument.nodeName); // necessary to resolve lazy getter
      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "nodeName");
      expect(typeof descWet).not.toBe(undefined);
      expect(typeof descDry).not.toBe(undefined);
      if (descWet && descDry) {
        expect(descWet.value).toBe("#document");
        expect(descDry.value).toBe("#document");
      }
    }

    {
      descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
      expect(descWet).not.toBe(undefined);
      expect(typeof descWet.value).toBe("function");
      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
      expect(descDry).toBe(undefined);
    }

    {
      // Redefining a not-whitelisted property on the wet document has no effect on the dry document.
      descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
      Reflect.defineProperty(wetDocument, "handleEventAtTarget", {
        value: HEAT,
        writable: false,
        enumerable: true,
        configurable: true,
      });

      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
      expect(descDry).toBe(undefined);

      Reflect.defineProperty(wetDocument, "handleEventAtTarget", descWet);
    }

    {
      let oldDescWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
      // Defining a not-whitelisted property on the dry document has no effect on the wet document.
      let defined = Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
        value: HEAT_NEW,
        writable: false,
        enumerable: true,
        configurable: true
      });
      expect(defined).toBe(true);
      descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
      expect(descWet).not.toBe(undefined);
      if (descWet)
        expect(descWet.value).toBe(oldDescWet.value);

      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
      expect(descDry).not.toBe(undefined);
      if (descDry)
        expect(descDry.value).toBe(HEAT_NEW);
    }

    extraTests(parts);

    // Clean up.
    parts.dry.doc.dispatchEvent("unload");
  }

  function voidFunc() {}
  it(
    "manually without shadow targets",
    buildTests.bind(null, true, voidFunc, voidFunc, voidFunc)
  );

  it("manually with shadow targets", function() {
    /* DAMP represents the whitelist without calling on useShadowTarget.
     * "dry" represents the whitelist with useShadowTarget("prepared").
     * The idea is to demonstrate that using shadow targets is faster.
     */

    function secondDryListener(meta) {
      // dry and damp handler secondary listener
      if (meta.handler.fieldName === DAMP) {
        meta.handler.removeProxyListener(secondDryListener);
        return;
      }

      try {
        meta.useShadowTarget("prepared");
      }
      catch (ex) {
        meta.throwException(ex);
      }
    }

    function exerciseDoc(doc, limit) {
      for (let i = 0; i < limit; i++) {
        let elem = doc.createElement("foo");
        let root = doc.rootElement;
        let refChild = root.firstChild;
        root.insertBefore(elem, refChild);
      }
    }

    function extraTests(parts) {
      /* This is to make sure the parts actually work.  The first pass, there
       * will be lazy getters on the "dry" object graph.  The second pass, the
       * properties should be directly defined.
       */
      exerciseDoc(parts[DAMP].doc, 2);
      exerciseDoc(parts.dry.doc, 2);

      /* You would think that the shadow targets offer faster operation.
       * Experimentation, though, shows the difference to be negligible, or that
       * it is often slower.
       */
      /*
      if (typeof performance !== "object")
        return;

      let slow = 0, fast = 0;
      for (let i = 0; i < 100; i++) {
        performance.clearMarks();
        performance.clearMeasures();
        performance.mark("start");
        exerciseDoc(parts[DAMP].doc, 100);
        performance.mark("middle");
        exerciseDoc(parts.dry.doc, 100);
        performance.mark("end");

        performance.measure("timings", "start", "middle");
        performance.measure("timings", "middle", "end");

        let measures = performance.getEntriesByName("timings");
        slow += measures[0].duration;
        fast += measures[1].duration;
      }

      performance.clearMarks();
      performance.clearMeasures();

      console.log("slow path: " + (slow) + ", fast path: " + (fast));
      */
    }

    buildTests(false, voidFunc, secondDryListener, extraTests);
  });
});
if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

/* Sometimes, we just want a proxy trap to be dead and unavailable.  For
 * example, some functions should never be callable as constructors.  Others
 * should only be callable as constructors.  The .disableTraps() API allows us
 * to enforce this rule.
 */

describe(
  "Membrane.modifyRulesAPI.disableTraps() allows the user to prevent",
  function() {
    var membrane, wetHandler, dryHandler, dryVoid;
    function voidFunc() {}

    beforeEach(function() {
      membrane = new Membrane();
      wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
      dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });
      dryVoid = membrane.convertArgumentToProxy(
        wetHandler,
        dryHandler,
        voidFunc
      );
    });
    
    afterEach(function() {
      wetHandler.revokeEverything();
      dryHandler.revokeEverything();
      wetHandler = null;
      dryHandler = null;
      membrane = null;
    });

    it(
      "invoking a function via .apply from the wet object graph",
      function() {
        membrane.modifyRules.disableTraps("wet", voidFunc, ["apply"]);
        var message = null, x;
        try {
          x = dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The apply trap is not executable.");
      }
    );

    it(
      "invoking a function via .apply from the dry object graph",
      function() {
        membrane.modifyRules.disableTraps("dry", dryVoid, ["apply"]);
        var message = null, x;
        try {
          x = dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The apply trap is not executable.");
      }
    );

    it(
      "invoking a function via .construct from the wet object graph",
      function() {
        membrane.modifyRules.disableTraps("wet", voidFunc, ["construct"]);
        var message = null, x;
        try {
          x = new dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The construct trap is not executable.");
      }
    );

    it(
      "invoking a function via .construct from the dry object graph",
      function() {
        membrane.modifyRules.disableTraps("dry", dryVoid, ["construct"]);
        var message = null, x;
        try {
          x = new dryVoid(0);
        }
        catch (ex) {
          message = ex.message;
        }
        expect(message).toBe("The construct trap is not executable.");
      }
    );
  }
);
if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

/* XXX ajvincent This is very specifically testing internal API's.  Hence the
 * conditional block at the start of this auto-executing function.
 */
(function() {
{
  let parts = MembraneMocks(false);
  if (typeof parts.handlers.dry.defineLazyGetter === "undefined")
    return;
  parts = null;
}
describe("Internal API:  Defining a lazy getter", function() {
  "use strict";
  var parts, dryDocument, wetDocument, membrane, shadow;

  beforeEach(function() {
    parts = MembraneMocks(false);
    dryDocument  = parts.dry.doc;
    wetDocument  = parts.wet.doc;
    membrane     = parts.membrane;

    let mapping = membrane.map.get(dryDocument);
    shadow = mapping.getShadowTarget("dry");
  });

  it("by itself does not affect an original target or a proxy", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "parentNode");

    let wetDesc = Reflect.getOwnPropertyDescriptor(wetDocument, "parentNode");
    expect("value" in wetDesc).toBe(true);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "parentNode");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(false);
      expect("get" in shadowDesc).toBe(true);
      expect(shadowDesc.configurable).toBe(true);
    }
  });

  it("and then defining a value through the dry object sets the value on the wet object while removing the lazy getter", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    dryDocument.nodeType = 15;
    expect(wetDocument.nodeType).toBe(15);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
    expect(shadowDesc).toBe(undefined);
  });

  it("and then defining a value through the wet object ignores the lazy getter", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    wetDocument.nodeType = 15;
    expect(wetDocument.nodeType).toBe(15);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
    expect(shadowDesc).not.toBe(undefined);
    if (shadowDesc) {
      expect("value" in shadowDesc).toBe(false);
      expect("get" in shadowDesc).toBe(true);
      expect(shadowDesc.configurable).toBe(true);
    }
  });

  it("and then invoking the proxy's .get() returns an expected value while removing the lazy getter", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "rootElement");
    let dryRoot = dryDocument.rootElement;
    expect(dryRoot instanceof parts.dry.Element).toBe(true);

    let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "rootElement");
    expect(shadowDesc).toBe(undefined);
  });

  it(
    "and then invoking the lazy getter stores the first available property value on the shadow",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      expect(shadow.nodeType).toBe(9);
      wetDocument.nodeType = 15;

      expect(shadow.nodeType).toBe(9);
    }
  );

  it(
    "and then setting the named value on the shadow overrides the lazy getter but does not propagate the property to the underlying target",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      shadow.nodeType = 15;
      expect(wetDocument.nodeType).toBe(9);

      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(true);
        expect("get" in shadowDesc).toBe(false);
        expect(shadowDesc.configurable).toBe(true);
      }
    }
  );

  it(
    "and then sealing the dry value locks in the properties of the shadow target",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      Object.seal(dryDocument);

      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(true);
        expect("get" in shadowDesc).toBe(false);
        expect(shadowDesc.configurable).toBe(false);
      }
    }
  );

  it(
    "and then freezing the dry value locks in the properties of the shadow target",
    function() {
      parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
      Object.freeze(dryDocument);

      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(true);
        expect("get" in shadowDesc).toBe(false);
        expect(shadowDesc.configurable).toBe(false);
      }
    }
  );

  it("and then sealing the shadow target has bad side effects", function() {
    function checkShadowDesc() {
      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(false);
        expect("get" in shadowDesc).toBe(true);
        expect(shadowDesc.configurable).toBe(false);
      }
    }

    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    Object.seal(shadow);

    checkShadowDesc();

    expect(function() {
      void(shadow.nodeType);
    }).toThrow();
    checkShadowDesc();

    expect(function() {
      shadow.nodeType = 15;
    }).toThrow();
    checkShadowDesc();
  });

  it("and then freezing the shadow target has bad side effects", function() {
    function checkShadowDesc() {
      let shadowDesc = Reflect.getOwnPropertyDescriptor(shadow, "nodeType");
      expect(shadowDesc).not.toBe(undefined);
      if (shadowDesc) {
        expect("value" in shadowDesc).toBe(false);
        expect("get" in shadowDesc).toBe(true);
        expect(shadowDesc.configurable).toBe(false);
      }
    }

    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    Object.freeze(shadow);

    checkShadowDesc();

    expect(function() {
      void(shadow.nodeType);
    }).toThrow();
    checkShadowDesc();

    expect(function() {
      shadow.nodeType = 15;
    }).toThrow();
    checkShadowDesc();
  });

  it("ensures the object graph is alive", function() {
    parts.handlers.dry.defineLazyGetter(wetDocument, shadow, "nodeType");
    parts.handlers.dry.revokeEverything();

    let wetDesc = Reflect.getOwnPropertyDescriptor(wetDocument, "nodeType");
    expect("value" in wetDesc).toBe(true);

    expect(function() {
      void(shadow.nodeType);
    }).toThrow();
  });
});
})();
describe("Internal values are not exposed:  ", function() {
  const GLOBAL = (typeof global == "object") ? global : window;
  const PRIVATE_KEYS = 
  [
    // source/moduleUtilities.js
    "valueType",
    "ShadowKeyMap",
    "makeShadowTarget",
    "getRealTarget",
    "inGraphHandler",
    "NOT_YET_DETERMINED",
    "makeRevokeDeleteRefs",
    "MembraneMayLog",
    "AssertIsPropertyKey",
    "Constants",

    // source/ProxyMapping.js
    "ProxyMapping",

    // source/Membrane.js
    "MembraneInternal",

    // source/ObjectGraphHandler.js
    "ObjectGraphHandler",

    // source/ProxyNotify.js
    "ProxyNotify",

    // source/ModifyRulesAPI.js
    "ChainHandlers",
    "ChainHandlerProtection",
    "ModifyRulesAPI",

    // source/dogfood.js
    "DogfoodMembrane",
  ];
  PRIVATE_KEYS.forEach(function(name) {
    it(name, function() {
      expect(name in GLOBAL).toBe(false);
    });
  });
});
if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Security checks for object graph handlers", function() {
  "use strict";
  var membrane, dryHandler;
  beforeEach(function() {
    let parts = MembraneMocks();
    dryHandler  = parts.handlers.dry;
    membrane    = parts.membrane;
  });

  afterEach(function() {
    dryHandler  = null;
    membrane    = null;
  });

  /* spec/security/exports.js guarantees ObjectGraphHandler (the function) is
   * not exposed to users.
   */

  it("Setting the prototype of ObjectGraphHandler is disallowed", function() {
    const proto = Reflect.getPrototypeOf(dryHandler);
    expect(Reflect.ownKeys(proto).includes("ownKeys")).toBe(true);
    expect(Reflect.setPrototypeOf(proto, {})).toBe(false);

    // the prototype inherits only from Object
    expect(Reflect.getPrototypeOf(proto)).toBe(Object.prototype);
  });

  it("Setting the prototype of a ChainHandler is disallowed", function() {
    const chain1 = membrane.modifyRules.createChainHandler(dryHandler);
    expect(Reflect.setPrototypeOf(chain1, {})).toBe(false);
  });

  it("The object graph handler disallows setting its fieldName", function() {
    const desc = Reflect.getOwnPropertyDescriptor(dryHandler, "fieldName");
    expect(desc.writable).toBe(false);
    expect(desc.configurable).toBe(false);
  });

  it(
    "A chain handler disallows setting properties it inherits from ObjectGraphHandler",
    function() {
      const chain1 = membrane.modifyRules.createChainHandler(dryHandler);
      const keys = Reflect.ownKeys(dryHandler);

      const desc = {
        value: "hello",
        writable: true,
        enumerable: true,
        configurable: true
      };

      keys.forEach(function(key) {
        expect(Reflect.defineProperty(chain1, key, desc)).toBe(false);
      });
    }
  );

  /* spec/features/replaceProxies.js guarantees chain handlers can have
   * additional properties.  They just can't be of the reserved property names.
   *
   * The same spec guarantees we can override inherited traps.
   */
});
