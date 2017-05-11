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
"use strict"
/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof MembraneMocks != "function") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, DAMP } = require("../docs/dist/node/mocks.js");
  }
}

if (typeof MembraneMocks != "function") {
  throw new Error("Unable to run tests");
}

describe("basic concepts: ", function() {
  var wetDocument, dryDocument;
  
  beforeEach(function() {
    let parts = MembraneMocks();
    wetDocument = parts.wet.doc;
    dryDocument = parts.dry.doc;
  });

  afterEach(function() {
    wetDocument = null;
    dryDocument = null;
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
    "Looking up a non-configurable, non-writable property twice returns the same property, unprotected",
    function() {
      const obj = {};
      Reflect.defineProperty(wetDocument, "extra", {
        value: obj,
        writable: false,
        enumerable: true,
        configurable: false
      });
  
      var lookup1 = dryDocument.extra;
      var lookup2 = dryDocument.extra;
      expect(lookup1 === lookup2).toBe(true);
      expect(lookup1 === obj).toBe(true);
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
     * But we're not testing that yet, nor (at the time of this writing) have we
     * implemented that proxy handler trap.
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
    let wetRoot, ElementWet, NodeWet;
    let dryRoot, ElementDry, NodeDry;

    let parts = MembraneMocks();
    wetRoot     = parts.wet.doc.rootElement;
    ElementWet  = parts.wet.Element;
    NodeWet     = parts.wet.Node;

    dryRoot     = parts.dry.doc.rootElement;
    ElementDry  = parts.dry.Element;
    NodeDry     = parts.dry.Node;

    let XHTMLElementDryProto = {
      namespaceURI: "http://www.w3.org/1999/xhtml"
    };
    let eProto = ElementDry.prototype;
    Object.setPrototypeOf(XHTMLElementDryProto, eProto);
    Object.setPrototypeOf(dryRoot, XHTMLElementDryProto);

    expect(dryRoot.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);
    expect(dryRoot.membraneGraphName).toBe("dry");
    expect(dryRoot instanceof ElementDry).toBe(true);
    expect(dryRoot instanceof NodeDry).toBe(true);

    expect(wetRoot.namespaceURI).toBe(XHTMLElementDryProto.namespaceURI);

    /* This is because wetRoot inherits for Wet(XHTMLDryElementProto),
     * which automatically is a proxy in the "wet" object graph.
     */
    expect(wetRoot.membraneGraphName).toBe("wet");
    expect(wetRoot instanceof ElementWet).toBe(true);
    expect(wetRoot instanceof NodeWet).toBe(true);

    let XHTMLElementDry = function(ownerDoc, name) {
      // this takes care of ownerDoc, name
      ElementDry.apply(this, [ownerDoc, name]);
    };
    XHTMLElementDry.prototype = XHTMLElementDryProto;

    let x = new XHTMLElementDry(dryDocument, "test");
    expect(x instanceof XHTMLElementDry).toBe(true);
    expect(x instanceof ElementDry).toBe(true);
    expect(x instanceof NodeDry).toBe(true);
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
    "MembraneHandler.revokeEverything() breaks all proxy access on an object graph",
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

"use strict"

/*
import "../docs/dist/es6-modules/Membrane.js";
import "../docs/dist/es6-modules/MembraneMocks.js";
*/

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../docs/dist/node/es7-membrane.js");
    var { MembraneMocks } = require("../docs/dist/node/mocks.js");
  }
}

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  throw new Error("Unable to run tests");
}

describe("replacing proxies tests: ", function() {
  let parts, membrane, dryHandler, replacedProxy;
  beforeEach(function() {
    parts = MembraneMocks();
    membrane = parts.membrane;
    dryHandler = membrane.getHandlerByField("dry");
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
        let wetHandler = membrane.getHandlerByField("wet");
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
/* XXX ajvincent I'm not going to use the MembraneMocks in these tests, because
 * the mocks create proxies to objects before any listeners can be registered.
 * I could modify the mocks to take listeners through an options object, but
 * that is just going to make the mocks code more complicated than necessary.
 *
 * Similarly, the logger we create will not be attached to the membrane.
 */

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../docs/dist/node/es7-membrane.js");
  }
}

describe("An object graph handler's proxy listeners", function() {
  var membrane, wetHandler, dryHandler, appender;
  const logger = loggerLib.getLogger("membrane.test.defineProperty");

  function ctor1(arg1) {
    this.label = "ctor1 instance";
    this.arg1 = arg1;
  }
  ctor1.prototype.label = "ctor1 prototype";
  ctor1.prototype.number = 2;

  function getMessageProp(event) { return event.message; }
  function getMessages() {
    return this.events.map(getMessageProp);
  }

  beforeEach(function() {
    membrane = new Membrane({logger: logger});
    wetHandler = membrane.getHandlerByField("wet", true);
    dryHandler = membrane.getHandlerByField("dry", true);

    appender = new loggerLib.Appender();
    logger.addAppender(appender);
    appender.getMessages = getMessages;
    appender.setThreshold("INFO");
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
      meta1 = meta;
      logger.info("listener1");
    }
    function listener2(meta) {
      meta2 = meta;
      logger.info("listener2");
    }
    function listener0(meta) {
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
      expect(messages.length).toBe(4);
      expect(messages[0]).toBe("x created");
      expect(messages[1]).toBe("listener1");
      expect(messages[2]).toBe("listener2");
      expect(messages[3]).toBe("dry(x) created");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).toBe(undefined);
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
      expect(messages.length).toBe(4);
      expect(messages[0]).toBe("X.y retrieval start");
      expect(messages[1]).toBe("listener1");
      expect(messages[2]).toBe("listener2");
      expect(messages[3]).toBe("X.y retrieval end");

      expect(meta2).toBe(meta1);
      expect(typeof meta2).toBe("object");
      expect(meta0).toBe(undefined);
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
      expect(messages.length).toBe(10);
      expect(messages[0]).toBe("Calling X.arg1 start");
      // for argument 0
      expect(messages[1]).toBe("listener0");
      expect(messages[2]).toBe("listener2");

      // for argument 1
      expect(messages[3]).toBe("listener0");
      expect(messages[4]).toBe("listener2");

      // executing the method
      expect(messages[5]).toBe("Entering callback");
      expect(messages[6]).toBe("Exiting callback");

      // for return value
      expect(messages[7]).toBe("listener1");
      expect(messages[8]).toBe("listener2");

      expect(messages[9]).toBe("Calling X.arg1 end");

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
  });

  describe("can stop iteration to further listeners", function() {
    var meta1, meta2;
    beforeEach(function() {
      meta1 = undefined;
      meta2 = undefined;
    });

    it("by invoking meta.stopIteration();", function() {
      function listener1(meta) {
        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        logger.info("listener1: calling meta.stopIteration();");
        meta.stopIteration();
        logger.info("listener1: stopped = " + meta.stopped);
      }

      function listener2(meta) {
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
        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        logger.info("listener1: calling meta.throwException(exn1);");
        meta.throwException(dummyExn);
        logger.info("listener1: stopped = " + meta.stopped);
      }

      function listener2(meta) {
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
        meta1 = meta;
        logger.info("listener1: stopped = " + meta.stopped);
        throw dummyExn; // this is supposed to be an accident
      }

      function listener2(meta) {
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

        // Ensure Reflect.ownKeys puts the inserted values at the end.
        let keySet = Reflect.ownKeys(dryRoot);
        fixKeys(keySet);
        expect(keySet.length).toBe(firstKeySet.length + 3);
        for (let i = 0; i < firstKeySet.length; i++) {
          expect(keySet[i]).toBe(firstKeySet[i]);
        }
        keySet = keySet.slice(firstKeySet.length);
        expect(keySet[0]).toBe("factoids");
        expect(keySet[1]).toBe("timestamp");
        expect(keySet[2]).toBe("authorName");

        // Insert a value on the wet graph.
        Object.defineProperty(wetRoot, "extra", {
          value: { isExtra: true },
          writable: true,
          enumerable: true,
          configurable: true
        });

        // Ensure the new wet graph's key precedes the dry graph keys.
        keySet = Reflect.ownKeys(dryRoot);
        fixKeys(keySet);
        expect(keySet.length).toBe(firstKeySet.length + 4);
        for (let i = 0; i < firstKeySet.length; i++) {
          expect(keySet[i]).toBe(firstKeySet[i]);
        }
        keySet = keySet.slice(firstKeySet.length);
        expect(keySet[0]).toBe("extra");
        expect(keySet[1]).toBe("factoids");
        expect(keySet[2]).toBe("timestamp");
        expect(keySet[3]).toBe("authorName");
      }
    );

    it(
      "defineProperty will not mask existing properties of the wet object graph",
      function() {
        Reflect.defineProperty(dryRoot, "nodeType", {
          value: 0,
          enumerable: true,
          writable: false,
          configurable: true
        });
        expect(wetRoot.nodeType).toBe(0);
        Reflect.defineProperty(wetRoot, "nodeType", {
          value: 15,
          enumerable: true,
          writable: false,
          configurable: true
        });
        expect(dryRoot.nodeType).toBe(15);
      }
    );

    it(
      "defineProperty works when the property is not configurable",
      function() {
        Object.defineProperty(dryRoot, "extra", {
          value: 1,
          writable: true,
          enumerable: false,
          configurable: false
        });
        let extra = dryRoot.extra;
        expect(extra).toBe(1);
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
          expect(dryRoot.localProp).toBe("one");

          // extra test:  did localProp make it to wetRoot?
          expect(Reflect.getOwnPropertyDescriptor(wetRoot, "localProp"))
                .toBe(undefined);

          // This is what we're really testing.
          Reflect.defineProperty(dryRoot, "localProp", {
            value: "two",
            writable: true,
            enumerable: false,
            configurable: true
          });
          expect(dryRoot.localProp).toBe("two");
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

        expect(dryRoot.firstExtra).toBe(1);
        expect(dryRoot.secondExtra).toBe(2);

        Reflect.defineProperty(wetRoot, "secondExtra", {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(dryRoot.firstExtra).toBe(1);
        expect(dryRoot.secondExtra).toBe(2);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(true);
        expect(keys.includes("secondExtra")).toBe(true);
      }
    );

    it(
      "defineProperty called on the damp graph for the same name does not override the dry graph",
      function() {
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

        expect(dryRoot.firstExtra).toBe(1);
        expect(dryRoot.secondExtra).toBe(2);

        Reflect.defineProperty(dampRoot, "secondExtra", {
          value: 0,
          writable: true,
          enumerable: true,
          configurable: true
        });

        expect(dryRoot.firstExtra).toBe(1);
        expect(dryRoot.secondExtra).toBe(2);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(true);
        expect(keys.includes("secondExtra")).toBe(true);
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

        expect(wetRoot.firstExtra).toBe(2);
        expect(dryRoot.firstExtra).toBe(1);

        Reflect.deleteProperty(wetRoot, "firstExtra");
        expect(typeof wetRoot.firstExtra).toBe("undefined");
        expect(dryRoot.firstExtra).toBe(1);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(true);
      }
    );

    it(
      "deleteProperty called on the damp graph does not override the dry graph",
      function() {
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

        expect(dampRoot.firstExtra).toBe(2);
        expect(dryRoot.firstExtra).toBe(1);

        Reflect.deleteProperty(dampRoot, "firstExtra");
        expect(typeof dampRoot.firstExtra).toBe("undefined");
        expect(dryRoot.firstExtra).toBe(1);

        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("firstExtra")).toBe(true);
      }
    );

    describe(
      "deleteProperty works correctly with previously defined accessor descriptors",
      function() {

        it("on the wet object graph", function() {
          delete parts.dry.doc.baseURL;
          expect(parts.wet.doc.baseURL).toBe(undefined);
        });

        it("on the dry object graph", function() {
          var local = "one";
          // This isn't the test.
          Reflect.defineProperty(wetRoot, "localProp", {
            get: function() { return local; },
            set: function(val) { local = val; },
            enumerable: true,
            configurable: true
          });
          expect(dryRoot.localProp).toBe("one");

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
        it(
          "when the object doesn't have a descriptor with that name",
          function() {
            let x = { isExtra: true };
            dryRoot.extra = x;
            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );

        it(
          "when the object has a direct data descriptor with that name",
          function() {
            Reflect.defineProperty(dryRoot, "extra", {
              value: { isExtra: 1 },
              writable: true,
              enumerable: true,
              configurable: true
            });

            let x = { isExtra: true };
            dryRoot.extra = x;

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );

        it(
          "when the object has a direct accessor descriptor with that name",
          function() {
            let extraValue = 1;
            Reflect.defineProperty(dryRoot, "extra", {
              get: function() { return extraValue; },
              set: function(val) { extraValue = val; },
              enumerable: true,
              configurable: true
            });

            let x = { isExtra: true };
            dryRoot.extra = x;

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );

        it(
          "when the object has a locally inherited data descriptor with that name",
          function() {
            Reflect.defineProperty(parts.dry.Node.prototype, "extra", {
              value: { isExtra: 1 },
              writable: true,
              enumerable: true,
              configurable: true
            });

            let x = { isExtra: true };
            dryRoot.extra = x;

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );

        it(
          "when the object has a proxied inherited data descriptor with that name",
          function() {
            let y = { isExtra: 1 };
            Reflect.defineProperty(parts.wet.Node.prototype, "extra", {
              value: y,
              writable: true,
              enumerable: true,
              configurable: true
            });

            let x = { isExtra: true };
            dryRoot.extra = x;

            let wetGetExtra = Reflect.get(wetRoot, "extra");
            expect(wetGetExtra === y).toBe(true);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );


        it(
          "when the object has a locally inherited accessor descriptor with that name",
          function() {
            let extraValue = 1;
            Reflect.defineProperty(parts.dry.Node.prototype, "extra", {
              get: function() { return extraValue; },
              set: function(val) { extraValue = val; },
              enumerable: true,
              configurable: true
            });

            let x = { isExtra: true };
            dryRoot.extra = x;

            expect(Reflect.has(wetRoot, "extra")).toBe(false);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );

        it(
          "when the object has a proxied inherited accessor descriptor with that name",
          function() {
            let extraValue = 1;
            Reflect.defineProperty(parts.wet.Node.prototype, "extra", {
              get: function() { return extraValue; },
              set: function(val) { extraValue = val; },
              enumerable: true,
              configurable: true
            });

            let x = { isExtra: true };
            dryRoot.extra = x;

            let wetGetExtra = Reflect.get(wetRoot, "extra");
            expect(wetGetExtra === 1).toBe(true);
            let dryGetExtra = Reflect.get(dryRoot, "extra");
            expect(dryGetExtra === x).toBe(true);
          }
        );
      }
    );

    it(
      "deleteProperty followed by .defineProperty is consistent",
      function() {
        // delete the property on the dry graph
        Reflect.deleteProperty(dryRoot, "nodeType");

        // define the property on the dry graph
        Reflect.defineProperty(dryRoot, "nodeType", {
          value: 0,
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
        expect(dryRoot.nodeType).toBe(0);
      }
    );
  }

  describe("when required by the dry object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.modifyRules.storeUnknownAsLocal("dry", parts.dry.Node.prototype);
    });

    addUnknownPropertySpecs();
  });

  describe("when required by the wet object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.buildMapping("wet", parts.wet.Node.prototype);
      membrane.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node.prototype);
    });
    
    addUnknownPropertySpecs();
  });

  describe(
    "when required by both the wet and the dry object graphs, ObjectGraphHandler(dry).",
    function() {
      beforeEach(function() {
        membrane.buildMapping("wet", parts.wet.Node.prototype);
        membrane.modifyRules.storeUnknownAsLocal("wet", parts.wet.Node.prototype);
        membrane.modifyRules.storeUnknownAsLocal("dry", parts.dry.Node.prototype);
      });

      addUnknownPropertySpecs();
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

      checkProperties(undefined);
    });

    it("deleteProperty() does not remove a non-configurable property", function() {
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

      checkProperties(1);
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

        checkProperties(undefined);
      }
    );
    
    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the wet graph, does not expose the property again",
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

        checkProperties(undefined);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the damp graph, does not expose the property again",
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

        checkProperties(undefined);
      }
    );

    it(
      "deleteProperty() on the dry graph, followed by defineProperty() on the dry graph, re-exposes the property",
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

        checkProperties(1);
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

        checkProperties(undefined);
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

        checkProperties(undefined);
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

        checkProperties(undefined);
      }
    );
  }

  describe("when required by the dry object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
    });

    requireLocalDeleteSpecs();
  });

  describe("when required by the wet object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.buildMapping("wet", parts.wet.Node.prototype);
      membrane.modifyRules.requireLocalDelete("wet", parts.wet.Node.prototype);
    });
    
    requireLocalDeleteSpecs();
  });

  describe(
    "when required by both the wet and the dry object graphs, ObjectGraphHandler(dry).",
    function() {
      beforeEach(function() {
        membrane.buildMapping("wet", parts.wet.Node.prototype);
        membrane.modifyRules.requireLocalDelete("wet", parts.wet.Node.prototype);
        membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
      });

      requireLocalDeleteSpecs();
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
});
"use strict"

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
  function fixKeys(keys) {
    if (keys.includes("membraneGraphName"))
      keys.splice(keys.indexOf("membraneGraphName"), 1);
  }

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

  var extraDesc = new DataDescriptor(3, true, true, true);
  var extraDesc2 = new DataDescriptor(4, true, true, true);

  // Customize this for whatever variables you need.
  var parts, membrane, dryDocument, wetDocument, dampDocument;
  const logger = loggerLib.getLogger("membrane.test.defineProperty");
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

    membrane.getHandlerByField("dry").revokeEverything();
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

  function checkAppenderForWarning() {
    expect(appender.events.length).toBe(1);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("WARN");
      expect(event.message).toBe(
        membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL
      );
    }
  }

  function defineFilteredTests(filterWet = false, filterDry = false) {
    beforeEach(function() {
      if (filterWet)
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
      if (filterDry)
        membrane.modifyRules.filterOwnKeys("dry", dryDocument, BlacklistFilter);
    });

    function rebuildMocksWithLogger() {
      clearParts();
      appender.clear();
      parts = MembraneMocks(true, logger);
      setParts();
      if (filterWet)
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
      if (filterDry)
        membrane.modifyRules.filterOwnKeys("dry", dryDocument, BlacklistFilter);
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

          checkAppenderForWarning();
        });
  
        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(Reflect.defineProperty(
            dryDocument, "blacklisted", desc
          )).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);

          checkAppenderForWarning();
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
    
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).not.toBe(undefined);
            if (desc) {
              expect(desc.value).toBe(3);
            }
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
            ).toBe(true);
            checkDeleted();
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).not.toBe(undefined);
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
          checkAppenderForWarning();
        });

        it(
          "when the property was previously defined on the wet graph as configurable",
          function() {
            // Set extra initially to 3.
            Reflect.defineProperty(wetDocument, "blacklisted", extraDesc);
            appender.clear();
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
            checkAppenderForWarning();
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).not.toBe(undefined);
            if (desc) {
              expect(desc.value).toBe(3);
            }
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
            appender.clear();
            expect(
              Reflect.deleteProperty(dryDocument, "blacklisted")
            ).toBe(true);
            checkDeleted();
            checkAppenderForWarning();
  
            // Test that the delete didn't propagate through.
            let desc = Reflect.getOwnPropertyDescriptor(
              wetDocument, "blacklisted"
            );
            expect(desc).not.toBe(undefined);
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

  describe("with the wet object graph:", function() {
    defineFilteredTests(true, false);
  });

  describe("with the dry object graph:", function() {
    defineFilteredTests(false, true);
  });

  describe("with the wet and dry object graphs", function() {
    defineFilteredTests(true, true);
  });

  describe("with the damp object graph (not affecting dry or wet)", function() {
    beforeEach(function() {
      membrane.modifyRules.filterOwnKeys(DAMP, dampDocument, BlacklistFilter);
    });

    function rebuildMocksWithLogger() {
      clearParts();
      appender.clear();
      parts = MembraneMocks(true, logger);
      setParts();
      membrane.modifyRules.filterOwnKeys(DAMP, dampDocument, BlacklistFilter);
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

      membrane.getHandlerByField("dry").revokeEverything();
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

      membrane.getHandlerByField("dry").revokeEverything();
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
"use strict";

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es7-membrane.js");
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Whitelisting object properties", function() {
  describe("manually", function() {
    //{ Setting up environment values.
    function HEAT() { return "handleEventAtTarget stub" }
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
    nameFilters.proto.node = buildFilter(NodeProtoWhiteList, nameFilters.target);
    nameFilters.proto.element = buildFilter([], nameFilters.proto.node);
    
    var parts, dryWetMB, EventListenerProto, checkEvent = null;
    const mockOptions = {
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
          EventListenerProto.handleEventAtTarget = function(event) {
            if (checkEvent)
              checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }

        /**
         * This is a proxy listener for protecting the listener argument of
         * EventTargetWet.prototype.addEventListener().
         */
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
      },
    };
    //}

    var wetDocument, dryDocument;
    beforeEach(function() {
      parts = MembraneMocks(false, null, mockOptions);
      wetDocument = parts.wet.doc;
      dryDocument = parts.dry.doc;
      checkEvent = null;
    });

    afterEach(function() {
      dryDocument.dispatchEvent("unload");
      dryDocument = null;
      wetDocument = null;
      dryWetMB = null;
      checkEvent = null;
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

        var defined = Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
          value: HEAT_NEW,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(true);

        var descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
        expect(descWet).not.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(oldDescWet.value);

        var descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
        expect(descDry).not.toBe(undefined);
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
        let defined = Reflect.defineProperty(dryDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).not.toBe(undefined);
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
        let defined = Reflect.defineProperty(wetDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).not.toBe(undefined);
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
      expect(dryRoot.ownerDocument).toBe(dryDocument);
      expect(dryRoot.parentNode).toBe(dryDocument);
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

      checkEvent = function(event) {
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
        checkEvent = null;
      };

      dryDocument.rootElement.dispatchEvent("asMethod");
      checkEvent = null;
      expect(listener.didFire).toBe(true);

      expect(event).not.toBe(null);
      if (event) {
        expect(event.type).toBe("asMethod");
        expect(event.currentPhase).toBe(1);
        expect(event.thisObj).toBe(listener);
      }
    });
  });

  it(
    "and getting a handler from a protected membrane works correctly",
    function() {
      const Dogfood = new Membrane();

      const publicAPI   = Dogfood.getHandlerByField("public", true);
      const internalAPI = Dogfood.getHandlerByField("internal", true);

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
              "getHandlerByField",
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
        const wetHandler = dryWetMB.getHandlerByField("wet", true);
      }).not.toThrow();
    }
  );
});
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
      dryWetMB.buildMapping("wet", parts.wet.Node.prototype);
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
      //dryWetMB.buildMapping("wet", wetDocument);

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
"use strict";

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

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Use case:  The membrane can be used to safely whitelist properties", function() {
  it("manually", function() {
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
    nameFilters.proto.node = buildFilter(NodeProtoWhiteList, nameFilters.target);
    nameFilters.proto.element = buildFilter([], nameFilters.proto.node);
    
    var parts, dryWetMB, descWet;
    var EventListenerProto, checkEvent = null;
    var mockOptions = {
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
      },
    };

    parts = MembraneMocks(false, null, mockOptions);
    var wetDocument = parts.wet.doc, dryDocument = parts.dry.doc;

    {
      descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "nodeName");
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

    // Clean up.
    parts.dry.doc.dispatchEvent("unload");
  });
});
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
