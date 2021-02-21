import {
  DeadProxyKey,
  /*
  makeShadowTarget,
  */
} from "../../source/core/sharedUtilities.mjs";
import ProxyCylinder from "../../source/core/ProxyCylinder.mjs";
import WeakMapOfProxyCylinders from "../../source/core/WeakMapOfProxyCylinders.mjs";

describe("ProxyCylinder", () => {
  let cylinder = null;
  beforeEach(() => {
    cylinder = new ProxyCylinder("wet");
  });

  const flagSymbol = Symbol("generic flag");

  it("initial conditions", () => {
    const unknownWet = `unknown graph "wet"`;

    expect(cylinder.originGraph).toBe("wet");
    expect(() => cylinder.getOriginal()).toThrowError("getOriginal called but the original value hasn't been set!");
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
    expect(() => cylinder.getOwnKeysFilter("wet")).toThrowError(unknownWet);
    expect(() => cylinder.getTruncateArgList("wet")).toThrowError(unknownWet);
  });

  describe("with wet metadata", () => {
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
      membrane.revokeMapping.and.callThrough();
      WeakMapOfProxyCylinders(membrane.map);

      wetParts = { value: {} };

      cylinder.set(membrane, "wet", wetParts);
    });

    afterEach(() => {
      wetParts = null;
    });

    it(".set() initializes an origin graph's proxy data correctly", () => {
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
      expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
      expect(cylinder.getTruncateArgList("wet")).toBe(false);

      expect(membrane.map.get(wetParts.value)).toBe(cylinder);
      expect(membrane.revokeMapping).not.toHaveBeenCalled();
    });

    it(".remove() clears the reference to the original value", () => {
      cylinder.remove("wet");

      const deadWet = `dead object graph "wet"`;

      expect(cylinder.originGraph).toBe("wet");
      expect(() => cylinder.getOriginal()).toThrowError(deadWet);
      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(() => cylinder.getValue("wet")).toThrowError(deadWet);
      expect(() => cylinder.getProxy("wet")).toThrowError(deadWet);
      expect(() => cylinder.getShadowTarget("wet")).toThrowError(deadWet);
      expect(cylinder.isShadowTarget({})).toBe(false);
      expect(() => cylinder.getLocalFlag("wet", "foo")).toThrowError(deadWet);
      expect(() => cylinder.getLocalFlag("wet", flagSymbol)).toThrowError(deadWet);
      expect(() => cylinder.getLocalDescriptor("wet", "towel")).toThrowError(deadWet);
      expect(() => cylinder.cachedOwnKeys("wet")).toThrowError(deadWet);
      expect(() => cylinder.localOwnKeys("wet")).toThrowError(deadWet);
      expect(() => cylinder.getOwnKeysFilter("wet")).toThrowError(deadWet);
      expect(() => cylinder.getTruncateArgList("wet")).toThrowError(deadWet);

      expect(membrane.map.get(wetParts.value)).toBe(cylinder);
      expect(membrane.revokeMapping).not.toHaveBeenCalled();
    });

    it(".selfDestruct() clears the reference to the original value", () => {
      cylinder.selfDestruct(membrane);

      const deadWet = `dead object graph "wet"`;

      expect(cylinder.originGraph).toBe("wet");
      expect(() => cylinder.getOriginal()).toThrowError(deadWet);
      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(() => cylinder.getValue("wet")).toThrowError(deadWet);
      expect(() => cylinder.getProxy("wet")).toThrowError(deadWet);
      expect(() => cylinder.getShadowTarget("wet")).toThrowError(deadWet);
      expect(cylinder.isShadowTarget({})).toBe(false);
      expect(() => cylinder.getLocalFlag("wet", "foo")).toThrowError(deadWet);
      expect(() => cylinder.getLocalFlag("wet", flagSymbol)).toThrowError(deadWet);
      expect(() => cylinder.getLocalDescriptor("wet", "towel")).toThrowError(deadWet);
      expect(() => cylinder.cachedOwnKeys("wet")).toThrowError(deadWet);
      expect(() => cylinder.localOwnKeys("wet")).toThrowError(deadWet);
      expect(() => cylinder.getOwnKeysFilter("wet")).toThrowError(deadWet);
      expect(() => cylinder.getTruncateArgList("wet")).toThrowError(deadWet);

      expect(membrane.map.get(wetParts.value)).toBe(undefined);
      expect(membrane.revokeMapping).not.toHaveBeenCalled();
    });

    it(".revoke() clears the reference to the original value", () => {
      cylinder.revoke(membrane);

      const deadWet = `dead object graph "wet"`;

      expect(cylinder.originGraph).toBe("wet");
      expect(() => cylinder.getOriginal()).toThrowError(deadWet);
      expect(cylinder.hasGraph("wet")).toBe(true);
      expect(cylinder.hasGraph("dry")).toBe(false);
      expect(() => cylinder.getValue("wet")).toThrowError(deadWet);
      expect(() => cylinder.getProxy("wet")).toThrowError(deadWet);
      expect(() => cylinder.getShadowTarget("wet")).toThrowError(deadWet);
      expect(cylinder.isShadowTarget({})).toBe(false);
      expect(() => cylinder.getLocalFlag("wet", "foo")).toThrowError(deadWet);
      expect(() => cylinder.getLocalFlag("wet", flagSymbol)).toThrowError(deadWet);
      expect(() => cylinder.getLocalDescriptor("wet", "towel")).toThrowError(deadWet);
      expect(() => cylinder.cachedOwnKeys("wet")).toThrowError(deadWet);
      expect(() => cylinder.localOwnKeys("wet")).toThrowError(deadWet);
      expect(() => cylinder.getOwnKeysFilter("wet")).toThrowError(deadWet);
      expect(() => cylinder.getTruncateArgList("wet")).toThrowError(deadWet);

      expect(membrane.map.get(wetParts.value)).toBe(DeadProxyKey);
      expect(membrane.revokeMapping).toHaveBeenCalledWith(wetParts.value);
      expect(membrane.revokeMapping).toHaveBeenCalledTimes(1);
    });
  });
});
