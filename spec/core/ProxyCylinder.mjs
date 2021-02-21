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

  describe("with no object graphs and", () => {
    it("initial conditions (disallows most getters)", () => {
      const unknownWet = `unknown graph "wet"`;
  
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
      expect(() => cylinder.getValue("wet")).toThrowError(unknownWet);
      expect(() => cylinder.getProxy("wet")).toThrowError(unknownWet);
      expect(() => cylinder.getShadowTarget("wet")).toThrowError(unknownWet);
      expect(() => cylinder.getLocalFlag("wet", "foo")).toThrowError(unknownWet);
      expect(() => cylinder.getLocalFlag("wet", flagSymbol)).toThrowError(unknownWet);
      expect(cylinder.isShadowTarget({})).toBe(false);
      expect(() => cylinder.getLocalDescriptor("wet", "towel")).toThrowError(unknownWet);
      expect(() => cylinder.cachedOwnKeys("wet")).toThrowError(unknownWet);
      expect(() => cylinder.localOwnKeys("wet")).toThrowError(unknownWet);
      expect(() => cylinder.wasDeletedLocally("wet", "foo")).toThrowError(unknownWet);
      expect(() => cylinder.getOwnKeysFilter("wet")).toThrowError(unknownWet);
      expect(() => cylinder.getTruncateArgList("wet")).toThrowError(unknownWet);
  
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

      /*
      it("disallows setting invalid graph names", () => {
        expect(() => cylinder.setMetadata(null, null, {})).toThrowError("graphName is neither a symbol nor a string!");
        expect(() => cylinder.setMetadata(null, 0,    {})).toThrowError("graphName is neither a symbol nor a string!");
        expect(() => cylinder.setMetadata(null, {},   {})).toThrowError("graphName is neither a symbol nor a string!");
      });
      */

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

    it("disallows calling remove()", () => {
      expect(() => cylinder.remove("wet")).toThrowError(`unknown graph "wet"`);
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

      it("setLocalFlag()", () => {
        expect(() => cylinder.setLocalFlag("wet", "foo", true)).toThrowError(`unknown graph "wet"`);
      });

      it("setLocalDescriptor()", () => {
        expect(() => cylinder.setLocalDescriptor(
          "wet", "foo", new NWNCDataDescriptor()
        )).toThrowError(`unknown graph "wet"`);
      });

      it("deleteLocalDescriptor()", () => {
        expect(() => cylinder.deleteLocalDescriptor(
          "wet", "foo", false
        )).toThrowError(`unknown graph "wet"`);

        expect(() => cylinder.deleteLocalDescriptor(
          "wet", "foo", true
        )).toThrowError(`unknown graph "wet"`);
      });

      it("setCachedOwnKeys()", () => {
        expect(() => cylinder.setCachedOwnKeys(
          "wet", [], []
        )).toThrowError(`unknown graph "wet"`);
      });

      it("appendDeletedNames()", () => {
        expect(() => cylinder.appendDeletedNames(
          "wet", new Set()
        )).toThrowError(`unknown graph "wet"`);
      });

      it("unmaskDeletion()", () => {
        expect(() => cylinder.unmaskDeletion("wet", "foo")).toThrowError(`unknown graph "wet"`);
      });

      it("setOwnKeysFilter()", () => {
        expect(() => cylinder.setOwnKeysFilter("wet", () => true)).toThrowError(`unknown graph "wet"`);
      });

      it("setTruncateArgList()", () => {
        expect(() => cylinder.setTruncateArgList("wet", 0)).toThrowError(`unknown graph "wet"`);
      });
    });
  });

  function expectDeadGraph(graphName) {
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

      wetParts = { value: {} };

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
    });

    it(".remove() clears the reference to the original value", () => {
      cylinder.remove("wet");

      const deadMessage = expectDeadGraph("wet");

      expect(cylinder.originGraph).toBe("wet");
      expect(() => cylinder.getOriginal()).toThrowError(deadMessage);

      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(cylinder.isShadowTarget({})).toBe(false);

      expect(membrane.map.get(wetParts.value)).toBe(cylinder);
      expect(membrane.revokeMapping).not.toHaveBeenCalled();
    });

    it(".selfDestruct() clears the reference to the original value", () => {
      cylinder.selfDestruct(membrane);

      const deadMessage = expectDeadGraph("wet");

      expect(cylinder.originGraph).toBe("wet");
      expect(() => cylinder.getOriginal()).toThrowError(deadMessage);

      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(cylinder.isShadowTarget({})).toBe(false);

      expect(membrane.map.get(wetParts.value)).toBe(undefined);
      expect(membrane.revokeMapping).not.toHaveBeenCalled();
    });

    it(".revokeAll() clears the reference to the original value", () => {
      cylinder.revokeAll(membrane);

      const deadMessage = expectDeadGraph("wet");

      expect(cylinder.originGraph).toBe("wet");
      expect(() => cylinder.getOriginal()).toThrowError(deadMessage);
      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(cylinder.isShadowTarget({})).toBe(false);

      expect(membrane.map.get(wetParts.value)).toBe(DeadProxyKey);
      expect(membrane.revokeMapping).toHaveBeenCalledWith(wetParts.value);
      expect(membrane.revokeMapping).toHaveBeenCalledTimes(1);
    });
  });
});
