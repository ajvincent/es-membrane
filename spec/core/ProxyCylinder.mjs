import {
  makeShadowTarget,
} from "../../source/core/sharedUtilities.mjs";

import {
  ProxyCylinder,
  ProxyCylinderMap,
} from "../../source/core/ProxyCylinder.mjs";

import { NWNCDataDescriptor } from "../../source/core/sharedUtilities.mjs";

describe("ProxyCylinder", () => {
  let cylinder = null, membrane;
  beforeEach(() => {
    cylinder = new ProxyCylinder("wet");
  });
  afterEach(() => {
    membrane = null;
    cylinder = null;
  })

  const flagSymbol = Symbol("generic flag");

  function expectUnknownGraphGetters(graphName) {
    const errorMessage = `unknown graph "${graphName}"`
    expect(cylinder.hasGraph(graphName)).toBe(false);
    expect(() => cylinder.getProxy(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getShadowTarget(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getLocalFlag(graphName, "foo")).toThrowError(errorMessage);
    expect(() => cylinder.getLocalFlag(graphName, flagSymbol)).toThrowError(errorMessage);
    expect(() => cylinder.localOwnKeys(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getLocalDescriptor(graphName, "towel")).toThrowError(errorMessage);
    expect(() => cylinder.cachedOwnKeys(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.wasDeletedLocally(graphName, "foo")).toThrowError(errorMessage);
    expect(() => cylinder.getOwnKeysFilter(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getTruncateArgList(graphName)).toThrowError(errorMessage);
  }

  function expectDeadGraphGetters(graphName) {
    const deadMessage = `dead object graph "${graphName}"`;

    expect(cylinder.hasGraph(graphName)).toBe(true);
    expect(() => cylinder.getProxy(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getShadowTarget(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getLocalFlag(graphName, "foo")).toThrowError(deadMessage);
    expect(() => cylinder.getLocalFlag(graphName, flagSymbol)).toThrowError(deadMessage);
    expect(() => cylinder.localOwnKeys(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getLocalDescriptor(graphName, "towel")).toThrowError(deadMessage);
    expect(() => cylinder.cachedOwnKeys(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getOwnKeysFilter(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getTruncateArgList(graphName)).toThrowError(deadMessage);

    return deadMessage;
  }

  function describeUnknownGraphSetters(graphName) {
    it("remove()", () => {
      expect(() => cylinder.removeGraph(graphName)).toThrowError(`unknown graph "${graphName}"`);
    });

    it("setLocalFlag()", () => {
      expect(() => cylinder.setLocalFlag(graphName, "foo", true)).toThrowError(`unknown graph "${graphName}"`);
    });

    it("setLocalDescriptor()", () => {
      expect(() => cylinder.setLocalDescriptor(
        graphName, "foo", new NWNCDataDescriptor()
      )).toThrowError(`unknown graph "${graphName}"`);
    });

    it("deleteLocalDescriptor()", () => {
      expect(() => cylinder.deleteLocalDescriptor(
        graphName, "foo", false
      )).toThrowError(`unknown graph "${graphName}"`);

      expect(() => cylinder.deleteLocalDescriptor(
        graphName, "foo", true
      )).toThrowError(`unknown graph "${graphName}"`);
    });

    it("setCachedOwnKeys()", () => {
      expect(() => cylinder.setCachedOwnKeys(
        graphName, [], []
      )).toThrowError(`unknown graph "${graphName}"`);
    });

    it("appendDeletedNames()", () => {
      expect(() => cylinder.appendDeletedNames(
        graphName, new Set()
      )).toThrowError(`unknown graph "${graphName}"`);
    });

    it("unmaskDeletion()", () => {
      expect(() => cylinder.unmaskDeletion(graphName, "foo")).toThrowError(`unknown graph "${graphName}"`);
    });

    it("setOwnKeysFilter()", () => {
      expect(() => cylinder.setOwnKeysFilter(graphName, () => true)).toThrowError(`unknown graph "${graphName}"`);
    });

    it("setTruncateArgList()", () => {
      expect(() => cylinder.setTruncateArgList(graphName, 0)).toThrowError(`unknown graph "${graphName}"`);
    });
  }

  function describeDeadGraphSetters(graphName) {
    it(".setMetadata()", () => {
      expect(() => cylinder.setMetadata({}, graphName, { value: { dead: true }}))
            .toThrowError(`set called for previously defined graph "${graphName}"`);
      expect(() => cylinder.setMetadata({}, graphName, { value: { dead: true}, override: true }))
            .toThrowError(`dead object graph "${graphName}"`);
    });

    it(".removeGraph()", () => {
      expect(() => cylinder.removeGraph(graphName)).toThrowError(`dead object graph "${graphName}"`);
    });

    it("allows calling .clearAllGraphs()", () => {
      expect(() => cylinder.clearAllGraphs(membrane)).not.toThrow();
    });

    it(".setLocalFlag()", () => {
      expect(() => cylinder.removeGraph(graphName, "foo", true)).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".setLocalDescriptor()", () => {
      expect(() => cylinder.setLocalDescriptor(
        graphName, "foo", new NWNCDataDescriptor({}))
      ).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".deleteLocalDescriptor()", () => {
      expect(() => cylinder.deleteLocalDescriptor(
        graphName, "foo", false
      )).toThrowError(`dead object graph "${graphName}"`);

      expect(() => cylinder.deleteLocalDescriptor(
        graphName, "foo", true
      )).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".setCachedOwnKeys()", () => {
      expect(() => cylinder.setCachedOwnKeys(
        graphName, [], []
      )).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".appendDeletedNames()", () => {
      expect(() => cylinder.appendDeletedNames(
        graphName, new Set()
      )).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".unmaskDeletion()", () => {
      expect(() => cylinder.unmaskDeletion(graphName, "foo")).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".setOwnKeysFilter()", () => {
      expect(() => cylinder.setOwnKeysFilter(graphName, () => true)).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".setTruncateArgList()", () => {
      expect(() => cylinder.setTruncateArgList(graphName, 0)).toThrowError(`dead object graph "${graphName}"`);
    });
  }

  describe("with no metadata and", () => {
    it("initial conditions (disallows most getters)", () => {
      // originGraph
      {
        const desc = Reflect.getOwnPropertyDescriptor(cylinder, "originGraph");
        expect(desc.value).toBe("wet");
        expect(desc.writable).toBe(false);
        expect(desc.configurable).toBe(false);
      }

      expect(() => cylinder.getOriginal()).toThrowError("the original value hasn't been set");
      expect(cylinder.hasGraph("wet")).toBe(false);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(cylinder.isShadowTarget({})).toBe(false);

      expectUnknownGraphGetters("wet");

      // Properties of the cylinder
      expect(Reflect.isExtensible(cylinder)).toBe(false);
      expect(Object.isFrozen(ProxyCylinder)).toBe(true);
      expect(Object.isFrozen(ProxyCylinder.prototype)).toBe(true);
    });

    describe("calling setMetadata()", () => {
      beforeEach(() => {
        membrane = {
          cylinderMap: new WeakMap,
        };
      });

      it("disallows setting non-origin graph data first", () => {
        const metadata = {};
        expect(() => cylinder.setMetadata(membrane, "dry", metadata)).toThrowError("original value has not been set");
      });

      it("disallows setting invalid graph metadata", () => {
        expect(() => cylinder.setMetadata(null, "wet", null )).toThrowError("metadata argument must be an object");
        expect(() => cylinder.setMetadata(null, "wet", 0    )).toThrowError("metadata argument must be an object");
        expect(() => cylinder.setMetadata(null, "wet", "wet")).toThrowError("metadata argument must be an object");
      });

      it("accepts undefined value properties in graph metadata", () => {
        const metadata = { value: undefined };
        cylinder.setMetadata(membrane, "wet", metadata);
        expect(membrane.cylinderMap.has(metadata.value)).toBe(false);
      });

      it("accepts number value properties in graph metadata", () => {
        const metadata = { value: 3 };
        cylinder.setMetadata(membrane, "wet", metadata);
        expect(membrane.cylinderMap.has(metadata.value)).toBe(false);
      });

      it("requires a value property on an origin graph", () => {
        const metadata = {};
        expect(() => cylinder.setMetadata(membrane, "wet", metadata))
              .toThrowError("metadata must include an original value");
      });

      it("disallows metadata with a proxy property on an origin graph", () => {
        const metadata = { value: {}, proxy: {} };
        expect(() => cylinder.setMetadata(membrane, "wet", metadata))
              .toThrowError("metadata must not include a proxy");
      });
      it("disallows metadata with a shadow target on an origin graph", () => {
        const metadata = { value: {}, shadowTarget: {} };
        expect(() => cylinder.setMetadata(membrane, "wet", metadata))
              .toThrowError("metadata must not include a shadow target");
      });
    });

    it("allows calling clearAllGraphs() (really a no-op, but still worth checking)", () => {
      membrane = { map: new WeakMap };
      expect(() => cylinder.clearAllGraphs(membrane)).not.toThrow();
    });

    describe("disallows setters other than (and before) setMetadata(): ", () => {
      describeUnknownGraphSetters("wet");
    });
  });

  describe("with wet metadata, and", () => {
    let wetParts;

    beforeEach(() => {
      membrane = {
        cylinderMap: new ProxyCylinderMap(),
      };

      wetParts = { value: { isWet: true } };

      cylinder.setMetadata(membrane, "wet", wetParts);
    });

    afterEach(() => {
      membrane = null;
      wetParts = null;
    });

    describe("checking current state", () => {
      it("has no dry graph data", () => {
        expect(cylinder.hasGraph("dry")).toBe(false);
      });

      it("initializes an origin graph's proxy data correctly", () => {
        expect(cylinder.originGraph).toBe("wet");
        expect(cylinder.getOriginal()).toBe(wetParts.value);
        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.getProxy("wet")).toBe(wetParts.value);
        expect(cylinder.getShadowTarget("wet")).toBe(undefined);
        expect(cylinder.isShadowTarget({})).toBe(false);
        expect(cylinder.getLocalFlag("wet", "foo")).toBe(false);
        expect(cylinder.getLocalFlag("wet", flagSymbol)).toBe(false);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(cylinder.getLocalDescriptor("wet", "towel")).toBe(undefined);
        expect(cylinder.cachedOwnKeys("wet")).toBe(null);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
        expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);

        expect(membrane.cylinderMap.get(wetParts.value)).toBe(cylinder);
      });

      it("disallows setting on the same graph twice without an override", () => {
        expect(() => cylinder.setMetadata(membrane, "wet", wetParts))
              .toThrowError(`set called for previously defined graph "wet"`);
        expect(() => cylinder.setMetadata(membrane, "wet", {}))
              .toThrowError(`set called for previously defined graph "wet"`);
      });

      it("allows setting on the same graph twice with an override", () => {
        const newParts = { value: { isNew: true }, override: true};
        cylinder.setMetadata(membrane, "wet", newParts);

        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.getProxy("wet")).toBe(newParts.value);
        expect(cylinder.getShadowTarget("wet")).toBe(undefined);
        expect(cylinder.isShadowTarget({})).toBe(false);
        expect(cylinder.getLocalFlag("wet", "foo")).toBe(false);
        expect(cylinder.getLocalFlag("wet", flagSymbol)).toBe(false);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(cylinder.getLocalDescriptor("wet", "towel")).toBe(undefined);
        expect(cylinder.cachedOwnKeys("wet")).toBe(null);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
        expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);

        expect(membrane.cylinderMap.get(newParts.value)).toBe(cylinder);
      });

      describe("doesn't recognize an unset object graph", () => {
        it("(getters)", () => expectUnknownGraphGetters("dry"));
        describe("(setters)", () => describeUnknownGraphSetters("dry"));
      });

      it("disallows invalid graph names", () => {
        expect(() => cylinder.setMetadata(null, null, {})).toThrowError("graphName is neither a symbol nor a string!");
        expect(() => cylinder.setMetadata(null, 0,    {})).toThrowError("graphName is neither a symbol nor a string!");
        expect(() => cylinder.setMetadata(null, {},   {})).toThrowError("graphName is neither a symbol nor a string!");
      });

      it("disallows a value property on a non-origin graph", () => {
        membrane = { cylinderMap: new WeakMap };
        const metadata = { value: {} };
        expect(() => cylinder.setMetadata(membrane, "dry", metadata))
              .toThrowError("metadata must not include a value");
      });

      it("disallows metadata with a proxy property on a non-origin graph", () => {
        membrane = { cylinderMap: new WeakMap };
        const metadata = { shadowTarget: {} };
        expect(() => cylinder.setMetadata(membrane, "dry", metadata))
              .toThrowError("metadata must include a proxy");
      });

      it("disallows metadata with a shadow target on a non-origin graph", () => {
        membrane = { cylinderMap: new WeakMap };
        const metadata = { proxy: {} };
        expect(() => cylinder.setMetadata(membrane, "dry", metadata))
              .toThrowError("metadata must include a shadow target");
      });
    });

    describe("calling .removeGraph()", () => {
      beforeEach(() => cylinder.removeGraph("wet"));

      it("clears the reference to the original value", () => {
        expect(cylinder.originGraph).toBe("wet");
        expect(() => cylinder.getOriginal()).toThrowError(`dead object graph "wet"`);

        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.isShadowTarget({})).toBe(false);

        expect(membrane.cylinderMap.get(wetParts.value)).toBe(cylinder);
      });

      describe("doesn't support a dead object graph", () => {
        it("(getters)", () => expectDeadGraphGetters("wet"));
        describe("(setters)", () => describeDeadGraphSetters("wet", membrane));

        it(".setMetadata with a new object graph", () => {
          expect(() => cylinder.setMetadata({}, Symbol("hidden"), { value: { dead: true }}))
                .toThrowError(`dead origin object graph "wet"`);
        });
      });
    });

    describe("calling .clearAllGraphs()", () => {
      beforeEach(() => cylinder.clearAllGraphs(membrane));

      it("clears all references", () => {
      // originGraph
        {
          const desc = Reflect.getOwnPropertyDescriptor(cylinder, "originGraph");
          expect(desc.value).toBe("wet");
          expect(desc.writable).toBe(false);
          expect(desc.configurable).toBe(false);
        }

        expect(() => cylinder.getOriginal()).toThrowError("the original value hasn't been set");
        expect(cylinder.hasGraph("wet")).toBe(false);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.isShadowTarget({})).toBe(false);

        expectUnknownGraphGetters("wet");

        // Properties of the cylinder
        expect(Reflect.isExtensible(cylinder)).toBe(false);
        expect(Object.isFrozen(ProxyCylinder)).toBe(true);
        expect(Object.isFrozen(ProxyCylinder.prototype)).toBe(true);
      });
    });

    describe("setting various local flags:", () => {
      it("setLocalFlag() to true", () => {
        cylinder.setLocalFlag("wet", "foo", true);
        expect(cylinder.getLocalFlag("wet", "foo")).toBe(true);
      });

      it("setLocalFlag() to false", () => {
        cylinder.setLocalFlag("wet", "foo", false);
        expect(cylinder.getLocalFlag("wet", "foo")).toBe(false);
      });
    });

    describe("interacting with local descriptors:", () => {
      const symbolKey = Symbol("symbol key");
      const fooSymbol = Symbol("foo");

      it("setLocalDescriptor() with a string key", () => {
        const desc = new NWNCDataDescriptor({});
        cylinder.setLocalDescriptor("wet", "foo", desc);
        expect(cylinder.getLocalDescriptor("wet", "foo")).toBe(desc);
        expect(cylinder.localOwnKeys("wet")).toEqual(["foo"]);
        expect(wetParts.value.foo).toBe(undefined);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
      });

      it("deleteLocalDescriptor() on a local value with a string key", () => {
        const desc = new NWNCDataDescriptor({});
        cylinder.setLocalDescriptor("wet", "foo", desc);
        cylinder.deleteLocalDescriptor("wet", "foo", true);

        expect(cylinder.getLocalDescriptor("wet", "foo")).toBe(undefined);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(wetParts.value.foo).toBe(undefined);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(true);
      });

      it("deleteLocalDescriptor() on a global value with a string key", () => {
        wetParts.value.foo = fooSymbol;

        cylinder.deleteLocalDescriptor("wet", "foo", false);

        expect(cylinder.getLocalDescriptor("wet", "foo")).toBe(undefined);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(wetParts.value.foo).toBe(fooSymbol);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
      });

      it("deleteLocalDescriptor() on a global value with a string key, set locally as well", () => {
        const desc = new NWNCDataDescriptor({});
        wetParts.value.foo = fooSymbol;

        cylinder.setLocalDescriptor("wet", "foo", desc);
        cylinder.deleteLocalDescriptor("wet", "foo", false);

        expect(cylinder.getLocalDescriptor("wet", "foo")).toBe(undefined);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(wetParts.value.foo).toBe(fooSymbol);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
      });

      it("unmaskDeletion() on a locally deleted global value", () => {
        wetParts.value.foo = fooSymbol;

        cylinder.deleteLocalDescriptor("wet", "foo", true);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(true);
      });

      it("unmaskDeletion() on a locally deleted value", () => {
        wetParts.value.foo = fooSymbol;

        cylinder.deleteLocalDescriptor("wet", "foo", true);
        cylinder.unmaskDeletion("wet", "foo");
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
      });

      it("setLocalDescriptor() with a symbol key", () => {
        const desc = new NWNCDataDescriptor({});
        cylinder.setLocalDescriptor("wet", symbolKey, desc);
        expect(cylinder.getLocalDescriptor("wet", symbolKey)).toBe(desc);
        expect(cylinder.localOwnKeys("wet")).toEqual([symbolKey]);
        expect(wetParts.value[symbolKey]).toBe(undefined);
        expect(cylinder.wasDeletedLocally("wet", symbolKey)).toBe(false);
      });

      it("deleteLocalDescriptor() on a local value with a symbol key", () => {
        const desc = new NWNCDataDescriptor({});
        cylinder.setLocalDescriptor("wet", symbolKey, desc);
        cylinder.deleteLocalDescriptor("wet", symbolKey, true);
        expect(cylinder.getLocalDescriptor("wet", symbolKey)).toBe(undefined);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(cylinder.wasDeletedLocally("wet", symbolKey)).toBe(true);
      });

      it("deleteLocalDescriptor() on a global value with a symbol key", () => {
        wetParts.value[symbolKey] = fooSymbol;

        cylinder.deleteLocalDescriptor("wet", symbolKey, false);

        expect(cylinder.getLocalDescriptor("wet", symbolKey)).toBe(undefined);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(wetParts.value[symbolKey]).toBe(fooSymbol);
        expect(cylinder.wasDeletedLocally("wet", symbolKey)).toBe(false);
      });

      it("deleteLocalDescriptor() on a global value with a symbol key, set locally as well", () => {
        const desc = new NWNCDataDescriptor({});
        wetParts.value[symbolKey] = fooSymbol;

        cylinder.setLocalDescriptor("wet", symbolKey, desc);
        cylinder.deleteLocalDescriptor("wet", symbolKey, false);

        expect(cylinder.getLocalDescriptor("wet", symbolKey)).toBe(undefined);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(wetParts.value[symbolKey]).toBe(fooSymbol);
        expect(cylinder.wasDeletedLocally("wet", symbolKey)).toBe(false);
      });

      it("setLocalDescriptor() with a string key and a symbol key", () => {
        const desc1 = new NWNCDataDescriptor(true);
        const desc2 = new NWNCDataDescriptor(fooSymbol);
        cylinder.setLocalDescriptor("wet", "foo", desc1);
        cylinder.setLocalDescriptor("wet", symbolKey, desc2);
        expect(cylinder.getLocalDescriptor("wet", "foo")).toBe(desc1);
        expect(cylinder.getLocalDescriptor("wet", symbolKey)).toBe(desc2);
        expect(cylinder.localOwnKeys("wet")).toEqual(["foo", symbolKey]);
      });
    });

    it(".setCachedOwnKeys()", () => {
      const keys = [ "foo", "bar" ];
      const original = [ "baz", "wop" ];
      cylinder.setCachedOwnKeys("wet", keys, original);
      expect(cylinder.cachedOwnKeys("wet")).toEqual({original, keys});
      // ordering doesn't matter
    });

    describe(".setOwnKeysFilter()", () => {
      it("with a valid filter", () => {
        const callback = () => false;
        cylinder.setOwnKeysFilter("wet", callback);

        expect(cylinder.getOwnKeysFilter("wet")).toBe(callback);
      });

      it("with an invalid filter", () => {
        cylinder.setOwnKeysFilter("wet", false);

        expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
      });

      it("to clear the filter", () => {
        cylinder.setOwnKeysFilter("wet", () => false);
        cylinder.setOwnKeysFilter("wet", null);

        expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
      });
    });

    describe(".setTruncateArgList()", () => {
      it("with a finite positive integer of arguments", () => {
        cylinder.setTruncateArgList("wet", 3);
        expect(cylinder.getTruncateArgList("wet")).toBe(3);
      });

      it("with zero arguments", () => {
        cylinder.setTruncateArgList("wet", 0);
        expect(cylinder.getTruncateArgList("wet")).toBe(0);
      });

      it("with an infinite number of arguments", () => {
        cylinder.setTruncateArgList("wet", Infinity);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);
      });

      it("with a negative number of arguments", () => {
        cylinder.setTruncateArgList("wet", -1);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);
      });

      it("with a decimal (not whole) number of arguments", () => {
        cylinder.setTruncateArgList("wet", Math.PI);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);
      });

      it("with NaN arguments", () => {
        cylinder.setTruncateArgList("wet", NaN);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);
      });

      it("with no number of arguments specified", () => {
        cylinder.setTruncateArgList("wet");
        expect(cylinder.getTruncateArgList("wet")).toBe(false);
      });

      it("with a string argument", () => {
        cylinder.setTruncateArgList("wet", "foo");
        expect(cylinder.getTruncateArgList("wet")).toBe(false);
      });
    });
  });

  describe("with wet and dry metadata, and", () => {
    let wetParts, dryParts;
    beforeEach(() => {
      membrane = {
        cylinderMap: new ProxyCylinderMap(),
      };

      wetParts = { value: { isWet: true } };

      cylinder.setMetadata(membrane, "wet", wetParts);

      const shadowTarget = makeShadowTarget(wetParts.value);
      dryParts = Proxy.revocable(shadowTarget, Reflect);
      dryParts.shadowTarget = shadowTarget;

      cylinder.setMetadata(membrane, "dry", dryParts);
    });

    afterEach(() => {
      wetParts = null;
      dryParts = null;
    });
  
    /* I could laboriously recreate all the tests that I applied to the wet data to
    the dry data, but most of the public API's rely on getMetadata() or setMetadataInternal(),
    both of which reduce the effects to choose a sub-object specific to an object graph.
  
    So it's pointless.  If we reduced to the wet object graph and everything works for just
    that graph, there's no point duplicating the tests for the dry graph.

    These tests cover the specific differences.
    */

    it("has correct read-only answers for the wet and dry graph data", () => {
      expect(cylinder.originGraph).toBe("wet");
      expect(cylinder.getOriginal()).toBe(wetParts.value);
      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.getProxy("wet")).toBe(wetParts.value);
      expect(cylinder.getShadowTarget("wet")).toBe(undefined);
      expect(cylinder.isShadowTarget({})).toBe(false);
      expect(cylinder.getLocalFlag("wet", "foo")).toBe(false);
      expect(cylinder.getLocalFlag("wet", flagSymbol)).toBe(false);
      expect(cylinder.localOwnKeys("wet")).toEqual([]);
      expect(cylinder.getLocalDescriptor("wet", "towel")).toBe(undefined);
      expect(cylinder.cachedOwnKeys("wet")).toBe(null);
      expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
      expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
      expect(cylinder.getTruncateArgList("wet")).toBe(false);

      expect(cylinder.hasGraph("dry")).toBe(true);
      expect(cylinder.getProxy("dry")).toBe(dryParts.proxy);
      expect(cylinder.getShadowTarget("dry")).toBe(dryParts.shadowTarget);
      expect(cylinder.isShadowTarget(dryParts.shadowTarget)).toBe(true);
      expect(cylinder.getLocalFlag("dry", "foo")).toBe(false);
      expect(cylinder.getLocalFlag("dry", flagSymbol)).toBe(false);
      expect(cylinder.localOwnKeys("dry")).toEqual([]);
      expect(cylinder.getLocalDescriptor("dry", "towel")).toBe(undefined);
      expect(cylinder.cachedOwnKeys("dry")).toBe(null);
      expect(cylinder.wasDeletedLocally("dry", "foo")).toBe(false);
      expect(cylinder.getOwnKeysFilter("dry")).toBe(null);
      expect(cylinder.getTruncateArgList("dry")).toBe(false);
  
      expect(membrane.cylinderMap.get(wetParts.value)).toBe(cylinder);
      expect(membrane.cylinderMap.get(dryParts.proxy)).toBe(cylinder);
    });

    it("requires the origin graph remain alive while another graph lives", () => {
      expect(() => cylinder.removeGraph("wet"))
            .toThrowError("Cannot remove the origin graph with another graph referring to it");
    });

    it("allows calling .clearAllGraphs()", () => {
      expect(() => cylinder.clearAllGraphs(membrane)).not.toThrow();
    });
  });
});

describe("ProxyCylinderMap", () => {
  let map;
  beforeEach(() => {
    map = new ProxyCylinderMap;
  });

  it("is itself frozen", () => {
    expect(Object.isFrozen(ProxyCylinderMap)).toBe(true);
  });

  it("inherits from WeakMap", () => {
    expect(map instanceof WeakMap).toBe(true);
  });


  it("disallows setting an ordinary value", () => {
    const key = {};
    const value = {};
    expect(() => map.set(key, value)).toThrowError("Value must be a ProxyCylinder, or DeadProxyKey");
    expect(map.has(key)).toBe(false);
  });
});
