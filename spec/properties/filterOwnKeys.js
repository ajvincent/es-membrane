"use strict"

if ((typeof MembraneMocks != "function") ||
    (typeof loggerLib != "object")) {
  if (typeof require == "function") {
    var { MembraneMocks, loggerLib } = require("../../dist/node/mocks.js");
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
    } = require("../../dist/node/utilities.js");
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

  function setParts() {
    dryDocument  = parts.dry.doc;
    wetDocument  = parts.wet.doc;
    dampDocument = parts.damp.doc;
    membrane     = parts.membrane;
  }

  beforeEach(function() {
    parts = MembraneMocks(true);
    setParts();
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

  function defineFilteredTests(filterWet = false, filterDry = false) {
    beforeEach(function() {
      if (filterWet)
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
      if (filterDry)
        membrane.modifyRules.filterOwnKeys("dry", dryDocument, BlacklistFilter);
    });

    it(
      "hides defined properties from getters via the wet object graph",
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
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
  
        // Set extra initially to 3.
        Reflect.defineProperty(dryDocument, "extra", extraDesc);
  
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
        Reflect.defineProperty(dryDocument, "extra", extraDesc2);
  
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
          expect(Reflect.defineProperty(
            dryDocument, "blacklisted", desc
          )).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);
        });
  
        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(Reflect.defineProperty(
            dryDocument, "blacklisted", desc
          )).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);
        });
      }
    );

    describe(
      ".defineProperty(dryDocument, 'blacklisted', desc) triggers a membrane logger warning",
      function() {
        var desc, appender;
        const logger = loggerLib.getLogger("membrane.test.defineProperty");
        beforeEach(function() {
          clearParts();
          appender = new loggerLib.Appender();
          appender.setThreshold("WARN");
          logger.addAppender(appender);
          parts = MembraneMocks(true, logger);
          setParts();
          if (filterWet)
            membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
          if (filterDry)
            membrane.modifyRules.filterOwnKeys("dry", dryDocument, BlacklistFilter);

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

          expect(appender.events.length).toBe(1);
          if (appender.events.length > 0) {
            let event = appender.events[0];
            expect(event.level).toBe("WARN");
            expect(event.message).toBe(membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
          }
        });
  
        it("where desc.configurable is true,", function() {
          desc.configurable = true;
          expect(Reflect.defineProperty(
            dryDocument, "blacklisted", desc
          )).toBe(false);
          expect(dryDocument.blacklisted).toBe(undefined);
          expect(wetDocument.blacklisted).toBe(undefined);

          expect(appender.events.length).toBe(1);
          if (appender.events.length > 0) {
            let event = appender.events[0];
            expect(event.level).toBe("WARN");
            expect(event.message).toBe(membrane.constants.warnings.FILTERED_KEYS_WITHOUT_LOCAL);
          }
        });
      }
    );

    it(
      "Deleting a blacklisted property works locally",
      function() {
        var keys;
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
  
        // Set extra initially to 3.
        Reflect.defineProperty(dryDocument, "blacklisted", extraDesc);
  
        // Delete extra.
        expect(Reflect.deleteProperty(dryDocument, "blacklisted")).toBe(true);
        keys = Reflect.ownKeys(dryDocument);
        fixKeys(keys);
        expect(keys.includes("blacklisted")).toBe(false);
        expect(Reflect.has(dryDocument, "blacklisted")).toBe(false);
        {
          let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "blacklisted");
          expect(extra).toBe(undefined);
        }
        expect(Reflect.get(dryDocument, "blacklisted")).toBe(undefined);
      }
    );

    it(
      "Deleting a blacklisted property defined on the original target via the dry graph",
      function() {
        var keys, didDelete;
        membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
  
        // Set extra initially to 3.
        Reflect.defineProperty(dryDocument, "blacklisted", extraDesc);
  
        /* XXX ajvincent This behavior is not defined, because it is not obvious
         * at this time what we should do.
         * http://www.ecma-international.org/ecma-262/7.0/#sec-ordinary-object-internal-methods-and-internal-slots-delete-p
         *
         * The algorithm for DeleteProperty states that if [[GetOwnProperty]]
         * returns undefined, the delete operation should return true and do nothing.
         * But here we have allowed the defineProperty to succeed in propagating
         * the blacklisted property through, before we called Reflect.deleteProperty.
         *
         * So technically we don't have an inconsistency, from the perspective of
         * the dry proxy to the wet object.  But we can't guarantee that the
         * deletion command will or will not propagate through to the wet object
         * graph.
         *
         * This merely emphasizes even more why users of the filterOwnKeys() code
         * should probably consider requiring "storeUnknownAsLocal" and
         * "requireLocalDelete" first!
         */
        
        didDelete = Reflect.deleteProperty(dryDocument, "blacklisted");
        expect(didDelete).toBe(true);
        pending("undefined behavior");
  
        keys = Reflect.ownKeys(wetDocument);
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

  xdescribe("with the damp object graph (not affecting dry or wet)", function() {
    
  });
});
