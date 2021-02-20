import ProxyCylinder from "../../source/core/ProxyCylinder.mjs";

describe("ProxyCylinder", () => {
  let cylinder = null;
  beforeEach(() => cylinder = new ProxyCylinder("wet"));

  it("initial conditions", () => {
    expect(cylinder.originGraph).toBe("wet");
    expect(() => cylinder.getOriginal()).toThrowError("getOriginal called but the original value hasn't been set!");
    expect(cylinder.hasGraph("wet")).toBe(false);
    expect(() => cylinder.getValue("wet")).toThrowError("getValue called for unknown graph!");
    expect(() => cylinder.getProxy("wet")).toThrowError("getProxy called for unknown graph!");
    expect(() => cylinder.getShadowTarget("wet")).toThrowError("getShadowTarget called for unknown graph!");
    expect(cylinder.isShadowTarget({})).toBe(false);
    expect(cylinder.getLocalDescriptor("wet", "towel")).toBe(undefined);
    expect(cylinder.cachedOwnKeys("wet")).toBe(null);
    expect(cylinder.localOwnKeys("wet")).toEqual([]);
    expect(cylinder.getOwnKeysFilter("wet")).toBe(null);
    expect(cylinder.getTruncateArgList("wet")).toBe(false);
  });
});
