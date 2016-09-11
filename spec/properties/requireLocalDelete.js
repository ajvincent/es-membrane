"use strict"

if (typeof MembraneMocks != "function") {
  if (typeof require == "function") {
    var { MembraneMocks } = require("../../dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Deleting properties locally", function() {
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

      {
        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("extra")).toBe(false);
      }

      {
        let keys = Reflect.ownKeys(wetRoot);
        expect(keys.includes("extra")).toBe(true);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(dryRoot, "extra");
        expect(desc).toBe(undefined);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(wetRoot, "extra");
        expect(desc).not.toBe(undefined);
        expect(desc.value).toBe(1);
      }

      {
        let val = Reflect.get(dryRoot, "extra");
        expect(val).toBe(undefined);
      }

      {
        let val = Reflect.get(wetRoot, "extra");
        expect(val).toBe(1);
      }
    });

    xit("deleteProperty() does not remove a non-configurable property", function() {
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

      {
        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("extra")).toBe(true);
      }

      {
        let keys = Reflect.ownKeys(wetRoot);
        expect(keys.includes("extra")).toBe(true);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(dryRoot, "extra");
        expect(desc).not.toBe(undefined);
        expect(desc.value).toBe(1);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(wetRoot, "extra");
        expect(desc).not.toBe(undefined);
        expect(desc.value).toBe(1);
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

    xit("deleteProperty() does not remove an inherited property", function() {
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
        let deleted = Reflect.deleteProperty(dryRoot, "extra");
        expect(deleted).toBe(true);
      }

      {
        let keys = Reflect.ownKeys(dryRoot);
        expect(keys.includes("extra")).toBe(true);
      }

      {
        let keys = Reflect.ownKeys(wetRoot);
        expect(keys.includes("extra")).toBe(true);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(dryRoot, "extra");
        expect(desc).not.toBe(undefined);
        expect(desc.value).toBe(1);
      }

      {
        let desc = Reflect.getOwnPropertyDescriptor(wetRoot, "extra");
        expect(desc).not.toBe(undefined);
        expect(desc.value).toBe(1);
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

  xdescribe("when required by the damp object graph, ObjectGraphHandler(dry).", function() {
    beforeEach(function() {
      membrane.modifyRules.requireLocalDelete("damp", parts.damp.Node.prototype);
    });
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
