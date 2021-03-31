import DAMP from "../helpers/dampSymbol.mjs";
import MembraneMocks from "../helpers/mocks.mjs";

describe("Deleting properties locally", function() {
  // Customize this for whatever variables you need.
  var parts, membrane, dryRoot, wetRoot, dampRoot;
  beforeEach(function() {
    parts = MembraneMocks({includeDamp: true});
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
  
  describe("when required by the dry object graph,", function() {
    beforeEach(function() {
      membrane.modifyRules.requireLocalDelete("dry", parts.dry.Node.prototype);
    });

    specsWithSealAndFreezeOptions();
  });

  describe("when required by the wet object graph,", function() {
    beforeEach(function() {
      membrane.convertArgumentToProxy(
        parts.handlers.wet,
        parts.handlers.dry,
        parts.wet.Node.prototype
      );
      membrane.modifyRules.requireLocalDelete("wet", parts.wet.Node.prototype);
    });
    
    specsWithSealAndFreezeOptions();
  });

  describe(
    "when required by both the wet and the dry object graphs,",
    function() {
      beforeEach(function() {
        membrane.convertArgumentToProxy(
          parts.handlers.wet,
          parts.handlers.dry,
          parts.wet.Node.prototype
        );
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
