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

import {
  DataDescriptor,
  isDataDescriptor
} from "../../source/core/sharedUtilities.mjs";

import loggerLib from "../helpers/logger.mjs";
import DAMP from "../helpers/dampSymbol.mjs";
import MembraneMocks from "../helpers/mocks.mjs";

describe("Filtering own keys", function() {
  "use strict";
  /* XXX ajvincent These tests have grown very complex, even for me.

  Use DebugConditionsSet from ../helpers/DebugConditionsSet.mjs to set
  forced debugger statements based on the nested conditions of your test.
  */

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
    parts = MembraneMocks({includeDamp: true});
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
      parts = MembraneMocks({includeDamp: true, logger});
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
      parts = MembraneMocks({includeDamp: true, logger});
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
