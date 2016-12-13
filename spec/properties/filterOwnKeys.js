//{
    // (1) Hide foo property in wet graph
    // (2) Reflect.ownKeys(dry) doesn't contain foo
    // (3) Reflect.get(dry.foo) is undefined
    // (4) Set, then delete dry.foo
    // (5) Neither operation affected wet.foo
    // (6) Test for inherited from parent, grandparent prototypes as well as direct.

    // XXX ajvincent Test:
    // (1) Define dry.foo
    // (2) filterOwnKeys(wet, foo)
    // (3) what happens?  what should happen?

    // (1) Define dry.foo
    // (2) filterOwnKeys(dry, foo)
    // (3) dry.foo should be gone

    // (1) filterOwnKeys(wet, foo)
    // (2) Define dry.foo
    // (3) what happens?  what should happen?

    // (1) filterOwnKeys(dry, foo)
    // (2) Define dry.foo
    // (3) ownKeys(dry) should include foo
//}

"use strict"

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../dist/node/mocks.js");
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

describe("Filtering own keys: ", function() {
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
  beforeEach(function() {
    parts = MembraneMocks(true);
    dryDocument  = parts.dry.doc;
    wetDocument  = parts.wet.doc;
    dampDocument = parts.damp.doc;
    membrane     = parts.membrane;
  });
  afterEach(function() {
    dryDocument  = null;
    wetDocument  = null;
    dampDocument = null;

    membrane = null;
    parts    = null;
  });

  it(
    "hides defined properties from getters via the wet object graph",
    function() {
      membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);
      let keys = Reflect.ownKeys(dryDocument);
      fixKeys(keys);
      expect(keys.includes("nodeType")).toBe(true);
      expect(keys.includes("__events__")).toBe(false);
      expect(Reflect.has(dryDocument, "__events__")).toBe(false);
      {
        let events = Reflect.getOwnPropertyDescriptor(dryDocument, "__events__");
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
        let events = Reflect.getOwnPropertyDescriptor(wetDocument, "__events__");
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
    "does not affect setting or deleting a property that isn't blacklisted",
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

  it(
    "allows defining a property which is blacklisted on the wet graph",
    function() {
      /* You may wonder why this is useful.  In truth, I cannot think of a good
       * use-case.  But this test drives home a very important point:  the
       * filtering of properties is separate from local properties.
       *
       * So a proper whitelisting or blacklisting combines three traits:
       * (1) local property definitions
       * (2) local property deletions
       * (3) filtering own keys appropriately
       */
      var keys;
      membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);

      // Set extra initially to 3.
      Reflect.defineProperty(dryDocument, "blacklisted", extraDesc);

      keys = Reflect.ownKeys(dryDocument);
      fixKeys(keys);
      expect(keys.includes("blacklisted")).toBe(false);
      expect(Reflect.has(dryDocument, "blacklisted")).toBe(false);
      {
        let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "blacklisted");
        expect(extra).toBe(undefined);
      }
      expect(Reflect.get(dryDocument, "blacklisted")).toBe(undefined);

      keys = Reflect.ownKeys(wetDocument);
      fixKeys(keys);
      expect(keys.includes("blacklisted")).toBe(true);
      expect(Reflect.has(wetDocument, "blacklisted")).toBe(true);
      {
        let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "blacklisted");
        expect(isDataDescriptor(extra)).toBe(true);
        expect(extra.value).toBe(3);
      }
      expect(Reflect.get(wetDocument, "blacklisted")).toBe(3);


      // Set extra again, to 4.
      Reflect.defineProperty(dryDocument, "blacklisted", extraDesc2);

      keys = Reflect.ownKeys(dryDocument);
      fixKeys(keys);
      expect(keys.includes("blacklisted")).toBe(false);
      expect(Reflect.has(dryDocument, "blacklisted")).toBe(false);
      {
        let extra = Reflect.getOwnPropertyDescriptor(dryDocument, "blacklisted");
        expect(extra).toBe(undefined);
      }
      expect(Reflect.get(dryDocument, "blacklisted")).toBe(undefined);

      keys = Reflect.ownKeys(wetDocument);
      fixKeys(keys);
      expect(keys.includes("blacklisted")).toBe(true);
      expect(Reflect.has(wetDocument, "blacklisted")).toBe(true);
      {
        let extra = Reflect.getOwnPropertyDescriptor(wetDocument, "blacklisted");
        expect(isDataDescriptor(extra)).toBe(true);
        expect(extra.value).toBe(4);
      }
      expect(Reflect.get(wetDocument, "blacklisted")).toBe(4);
    }
  );

  it(
    "Reflect.defineOwnProperty(dry, 'blacklisted', desc) should return what?",
    function() {
      var keys, didSet;
      membrane.modifyRules.filterOwnKeys("wet", wetDocument, BlacklistFilter);

      // Set extra initially to 3.
      didSet = Reflect.defineProperty(dryDocument, "blacklisted", extraDesc);
      /* Correct behavior here is unclear.  We did succeed in setting the value
       * on the wet object via this proxy, but ownKeys will show the property
       * doesn't exist, as the previous test shows.  So technically we failed to
       * set the property on the dryDocument object.
       *
       * In other words, should didSet be true because we set a value on the
       * wet object graph, or false because we failed to set a value on the
       * dry object graph?
       *
       * This merely emphasizes even more why users of the filterOwnKeys() code
       * should probably consider requiring "storeUnknownAsLocal" and
       * "requireLocalDelete" first!
       */
      expect(didSet).toBe(true);
      pending("undefined behavior");

      didSet = Reflect.defineProperty(dryDocument, "blacklisted", extraDesc2);
      expect(didSet).toBe(true);
      pending("undefined behavior");
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
});
