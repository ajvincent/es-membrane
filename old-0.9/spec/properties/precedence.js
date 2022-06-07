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
