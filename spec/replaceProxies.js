/*
import "../dist/es6-modules/Membrane.js";
import "../dist/es6-modules/MembraneMocks.js";
*/

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../dist/node/es7-membrane.js");
    var { MembraneMocks } = require("../dist/node/mocks.js");
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
