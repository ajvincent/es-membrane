import {
  DeadProxyKey,
  /*
  makeShadowTarget,
  */
} from "../../source/core/sharedUtilities.mjs";
import ProxyCylinder from "../../source/core/ProxyCylinder.mjs";
import WeakMapOfProxyCylinders from "../../source/core/WeakMapOfProxyCylinders.mjs";
import { NWNCDataDescriptor } from "../../source/core/sharedUtilities.mjs";

describe("ProxyCylinder", () => {
  let cylinder = null;
  beforeEach(() => {
    cylinder = new ProxyCylinder("wet");
  });

  const flagSymbol = Symbol("generic flag");

  function expectUnknownGraphGetters(graphName) {
    const errorMessage = `unknown graph "${graphName}"`
    expect(cylinder.hasGraph(graphName)).toBe(false);
    expect(() => cylinder.getValue(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getProxy(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getShadowTarget(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getLocalFlag(graphName, "foo")).toThrowError(errorMessage);
    expect(() => cylinder.getLocalFlag(graphName, flagSymbol)).toThrowError(errorMessage);
    expect(() => cylinder.getLocalDescriptor(graphName, "towel")).toThrowError(errorMessage);
    expect(() => cylinder.cachedOwnKeys(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.localOwnKeys(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.wasDeletedLocally(graphName, "foo")).toThrowError(errorMessage);
    expect(() => cylinder.getOwnKeysFilter(graphName)).toThrowError(errorMessage);
    expect(() => cylinder.getTruncateArgList(graphName)).toThrowError(errorMessage);
  }

  function expectDeadGraphGetters(graphName) {
    const deadMessage = `dead object graph "${graphName}"`;

    expect(cylinder.hasGraph(graphName)).toBe(true);
    expect(() => cylinder.getValue(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getProxy(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getShadowTarget(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getLocalFlag(graphName, "foo")).toThrowError(deadMessage);
    expect(() => cylinder.getLocalFlag(graphName, flagSymbol)).toThrowError(deadMessage);
    expect(() => cylinder.getLocalDescriptor(graphName, "towel")).toThrowError(deadMessage);
    expect(() => cylinder.cachedOwnKeys(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.localOwnKeys(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getOwnKeysFilter(graphName)).toThrowError(deadMessage);
    expect(() => cylinder.getTruncateArgList(graphName)).toThrowError(deadMessage);

    return deadMessage;
  }

  function describeUnknownGraphSetters(graphName) {
    it("remove()", () => {
      expect(() => cylinder.remove(graphName)).toThrowError(`unknown graph "${graphName}"`);
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

  function describeDeadGraphSetters(graphName, membrane) {
    it(".setMetadata()", () => {
      expect(() => cylinder.setMetadata({}, "wet", { value: { dead: true }}))
            .toThrowError(`set called for previously defined graph "${graphName}"`);
      expect(() => cylinder.setMetadata({}, "wet", { value: { dead: true}, override: true }))
            .toThrowError(`dead object graph "${graphName}"`);
    });

    it(".remove()", () => {
      expect(() => cylinder.remove("wet")).toThrowError(`dead object graph "${graphName}"`);
    });

    it("allows calling .selfDestruct()", () => {
      expect(() => cylinder.selfDestruct(membrane)).not.toThrow();
    });

    it("allows calling .revokeAll()", () => {
      expect(() => cylinder.revokeAll(membrane)).not.toThrow();
    });

    it(".setLocalFlag()", () => {
      expect(() => cylinder.remove("wet", "foo", true)).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".setLocalDescriptor()", () => {
      expect(() => cylinder.setLocalDescriptor(
        "wet", "foo", new NWNCDataDescriptor({}))
      ).toThrowError(`dead object graph "${graphName}"`);
    });

    it(".deleteLocalDescriptor()", () => {
      expect(() => cylinder.deleteLocalDescriptor(
        "wet", "foo", false
      )).toThrowError(`dead object graph "${graphName}"`);

      expect(() => cylinder.deleteLocalDescriptor(
        "wet", "foo", true
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

  describe("with no object graphs and", () => {
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
      it("disallows setting non-origin graph data first", () => {
        const membrane = { map: new WeakMap };
        const metadata = {};
        expect(() => cylinder.setMetadata(membrane, "dry", metadata)).toThrowError("original value has not been set");
      });

      it("disallows setting invalid graph metadata", () => {
        expect(() => cylinder.setMetadata(null, "wet", null )).toThrowError("metadata argument must be an object");
        expect(() => cylinder.setMetadata(null, "wet", 0    )).toThrowError("metadata argument must be an object");
        expect(() => cylinder.setMetadata(null, "wet", "wet")).toThrowError("metadata argument must be an object");
      });

      it("accepts undefined value properties in graph metadata", () => {
        const membrane = { map: new WeakMap };
        const metadata = {};
        cylinder.setMetadata(membrane, "wet", metadata);
        expect(membrane.map.has(metadata.value)).toBe(false);
      });

      it("accepts number value properties in graph metadata", () => {
        const membrane = { map: new WeakMap };
        const metadata = {value: 3};
        cylinder.setMetadata(membrane, "wet", metadata);
        expect(membrane.map.has(metadata.value)).toBe(false);
      });
    });

    it("allows calling selfDestruct() (really a no-op, but still worth checking)", () => {
      const membrane = { map: new WeakMap };
      expect(() => cylinder.selfDestruct(membrane)).not.toThrow();
    });

    describe("disallows setters other than (and before) setMetadata(): ", () => {
      it("disallows calling revokeAll()", () => {
        const membrane = {
          map: new WeakMap(),
          revokeMapping: jasmine.createSpy(
            "revokeMapping", function(value) {
              this.map.revoke(value);
            }
          ),
        };
        WeakMapOfProxyCylinders(membrane.map);
        membrane.revokeMapping.and.callThrough();

        expect(() => cylinder.revokeAll(membrane)).toThrowError("the original value hasn't been set");
      });

      describeUnknownGraphSetters("wet");
    });
  });

  describe("with wet metadata and", () => {
    let membrane, wetParts;

    beforeEach(() => {
      membrane = {
        map: new WeakMap(),
        revokeMapping: jasmine.createSpy(
          "revokeMapping", function(value) {
            this.map.revoke(value);
          }
        ),
      };
      WeakMapOfProxyCylinders(membrane.map);
      membrane.revokeMapping.and.callThrough();

      wetParts = { value: { isWet: true } };

      cylinder.setMetadata(membrane, "wet", wetParts);
    });

    afterEach(() => {
      membrane = null;
      wetParts = null;
    });

    describe("calling .setMetadata()", () => {
      it("initializes an origin graph's proxy data correctly", () => {
        expect(cylinder.originGraph).toBe("wet");
        expect(cylinder.getOriginal()).toBe(wetParts.value);
        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.getValue("wet")).toBe(wetParts.value);
        expect(cylinder.getProxy("wet")).toBe(wetParts.value);
        expect(cylinder.getShadowTarget("wet")).toBe(undefined);
        expect(cylinder.isShadowTarget({})).toBe(false);
        expect(cylinder.getLocalFlag("wet", "foo")).toBe(false);
        expect(cylinder.getLocalFlag("wet", flagSymbol)).toBe(false);
        expect(cylinder.getLocalDescriptor("wet", "towel")).toBe(undefined);
        expect(cylinder.cachedOwnKeys("wet")).toBe(null);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
        expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);

        expect(membrane.map.get(wetParts.value)).toBe(cylinder);
        expect(membrane.revokeMapping).not.toHaveBeenCalled();
      });

      it("disallows setting on the same graph twice without override", () => {
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
        expect(cylinder.getValue("wet")).toBe(newParts.value);
        expect(cylinder.getProxy("wet")).toBe(newParts.value);
        expect(cylinder.getShadowTarget("wet")).toBe(undefined);
        expect(cylinder.isShadowTarget({})).toBe(false);
        expect(cylinder.getLocalFlag("wet", "foo")).toBe(false);
        expect(cylinder.getLocalFlag("wet", flagSymbol)).toBe(false);
        expect(cylinder.getLocalDescriptor("wet", "towel")).toBe(undefined);
        expect(cylinder.cachedOwnKeys("wet")).toBe(null);
        expect(cylinder.localOwnKeys("wet")).toEqual([]);
        expect(cylinder.wasDeletedLocally("wet", "foo")).toBe(false);
        expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
        expect(cylinder.getTruncateArgList("wet")).toBe(false);

        expect(membrane.map.get(newParts.value)).toBe(cylinder);
        expect(membrane.revokeMapping).not.toHaveBeenCalled();
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
    });

    describe("calling .remove()", () => {
      beforeEach(() => cylinder.remove("wet"));

      it("clears the reference to the original value", () => {
        expect(cylinder.originGraph).toBe("wet");
        expect(() => cylinder.getOriginal()).toThrowError(`dead object graph "wet"`);

        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.isShadowTarget({})).toBe(false);

        expect(membrane.map.get(wetParts.value)).toBe(cylinder);
        expect(membrane.revokeMapping).not.toHaveBeenCalled();
      });

      describe("doesn't support a dead object graph", () => {
        it("(getters)", () => expectDeadGraphGetters("wet"));
        describe("(setters)", () => describeDeadGraphSetters("wet", membrane));
      });
    });

    describe(".selfDestruct()", () => {
      beforeEach(() => cylinder.selfDestruct(membrane));

      it("clears the reference to the original value", () => {

        const deadMessage = expectDeadGraphGetters("wet");
  
        expect(cylinder.originGraph).toBe("wet");
        expect(() => cylinder.getOriginal()).toThrowError(deadMessage);
  
        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.isShadowTarget({})).toBe(false);
  
        expect(membrane.map.get(wetParts.value)).toBe(undefined);
        expect(membrane.revokeMapping).not.toHaveBeenCalled();
      });

      describe("doesn't support a dead object graph", () => {
        it("(getters)", () => expectDeadGraphGetters("wet"));
        describe("(setters)", () => describeDeadGraphSetters("wet", membrane));
      });
    });

    describe(".revokeAll()", () => {
      beforeEach(() => cylinder.revokeAll(membrane));

      it("clears the reference to the original value", () => {
        const deadMessage = expectDeadGraphGetters("wet");
  
        expect(cylinder.originGraph).toBe("wet");
        expect(() => cylinder.getOriginal()).toThrowError(deadMessage);
        expect(cylinder.hasGraph("wet")).toBe(true);
        expect(cylinder.hasGraph("dry")).toBe(false);
        expect(cylinder.isShadowTarget({})).toBe(false);
  
        expect(membrane.map.get(wetParts.value)).toBe(DeadProxyKey);
        expect(membrane.revokeMapping).toHaveBeenCalledWith(wetParts.value);
        expect(membrane.revokeMapping).toHaveBeenCalledTimes(1);
      });

      describe("doesn't support a dead object graph", () => {
        it("(getters)", () => expectDeadGraphGetters("wet"));
        describe("(setters)", () => describeDeadGraphSetters("wet", membrane));
      });
    });
  });
});
