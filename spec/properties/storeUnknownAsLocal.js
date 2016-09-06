"use strict"

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../dist/node/mocks.js");
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
    dampRoot = parts.damp.doc.rootElement;
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
          let np = parts.damp.Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(false);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).toBe(undefined);
          expect(Reflect.has(np, "extra")).toBe(false);
          expect(Reflect.get(np, "extra")).toBe(undefined);
          let root = parts.damp.doc.rootElement;
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
          let np = parts.damp.Node.prototype;
          expect(Reflect.ownKeys(np).includes("extra")).toBe(false);
          let desc = Reflect.getOwnPropertyDescriptor(np, "extra");
          expect(desc).toBe(undefined);
          expect(Reflect.has(np, "extra")).toBe(false);
          expect(Reflect.get(np, "extra")).toBe(undefined);
          let root = parts.damp.doc.rootElement;
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

    xit(
      "defineProperty will not mask existing properties of the wet object graph",
      function() {
      }
    );

    xdescribe(
      "defineProperty works correctly with previously defined accessor descriptors",
      function() {
        xit("on the wet object graph", function() {
        });
        xit("on the dry object graph", function() {
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
    xit(
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

    xit(
      "defineProperty called on the wet graph for the same name does not override the dry graph",
      function() {
        // XXX ajvincent Duplicate names in the wet graph mustn't reorder Reflect.ownKeys().
      }
    );

    xit(
      "defineProperty called on the damp graph for the same name does not override the dry graph",
      function() {
      }
    );

    xit(
      "deleteProperty on the dry graph deletes from both the dry graph and the wet graph",
      function() {
        // XXX ajvincent Test that ownKeys preserves ordering of keys.
      }
    );

    xit(
      "deleteProperty called on the wet graph does not override the dry graph",
      function() {
      }
    );

    xit(
      "deleteProperty called on the damp graph does not override the dry graph",
      function() {
      }
    );

    xdescribe(
      "deleteProperty works correctly with previously defined accessor descriptors",
      function() {
        xit("on the wet object graph", function() {
        });
        xit("on the dry object graph", function() {
        });
      }
    );

    xdescribe(
      "set stores unknown properties locally on the dry graph, unwrapped",
      function() {
        xit(
          "when the object doesn't have a descriptor with that name",
          function() {
          }
        );

        xit(
          "when the object has a direct data descriptor with that name",
          function() {
          }
        );

        xit(
          "when the object has a direct accessor descriptor with that name",
          function() {
          }
        );

        xit(
          "when the object has an inherited data descriptor with that name",
          function() {
          }
        );

        xit(
          "when the object has an inherited accessor descriptor with that name",
          function() {
          }
        );
      }
    );

    xit(
      "deleteProperty followed by .defineProperty is consistent for local properties",
      function() {
        // mask a property 
        // delete the property on the dry graph
        // define the property on the dry graph
        // define the property on the wet graph
        // ensure the property on the dry graph takes precedence

        // repeat all steps with an accessor descriptor on the wet object graph
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

  xdescribe(
    "when required by the damp object graph (neither wet nor dry, should behave normally), ObjectGraphHandler(dry).",
    function() {
    }
  );

  xdescribe(
    "when required by both the wet and the dry object graphs, ObjectGraphHandler(dry).",
    function() {
    }
  );

  xit("requires a value or proxy already known to the membrane", function() {
    expect(function() {
      membrane.modifyRules.storeUnknownAsLocal("wet", {});
    }).toThrow();
    expect(function() {
      membrane.modifyRules.storeUnknownAsLocal("dry", {});
    }).toThrow();
  });
});
