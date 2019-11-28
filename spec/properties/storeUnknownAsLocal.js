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
