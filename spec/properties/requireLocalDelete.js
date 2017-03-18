"use strict"

if ((typeof MembraneMocks != "function") ||
    (typeof DAMP != "symbol")) {
  if (typeof require == "function") {
    var { MembraneMocks, DAMP } = require("../../dist/node/mocks.js");
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
