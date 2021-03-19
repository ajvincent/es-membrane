import ModifyRulesAPI from "../../source/core/ModifyRulesAPI.mjs";
import DistortionsListener from "../../source/core/DistortionsListener.mjs";

describe("ModifyRulesAPI", () => {
  let membrane, cylinder, rules, proxy;
  beforeEach(() => {
    cylinder = {};
    proxy = {};

    membrane = {
      getMembraneProxy: jasmine.createSpy("getMembraneProxy"),
      cylinderMap: jasmine.createSpyObj("cylinderMap", ["get"])
    };

    membrane.cylinderMap.get.and.returnValue(cylinder);

    rules = new ModifyRulesAPI(membrane);
  });

  afterEach(() => {
    membrane = null;
    cylinder = null;
    rules = null;
    proxy = {};
  });

  it("instances are sealed at construction", () => {
    expect(Object.isSealed(rules)).toBe(true);
  });

  describe(".storeUnknownAsLocal()", () => {
    beforeEach(() => cylinder.setLocalFlag = jasmine.createSpy("storeUnknownAsLocal"));

    it("sets the right flag on the ProxyCylinder", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      rules.storeUnknownAsLocal("wet", proxy);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).toHaveBeenCalledOnceWith("wet", "storeUnknownAsLocal", true);
    });

    it("throws for a non-existent proxy", () => {
      membrane.getMembraneProxy.and.returnValue([false]);
      expect(
        () => rules.storeUnknownAsLocal("wet", proxy)
      ).toThrowError("storeUnknownAsLocal requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).not.toHaveBeenCalled();
    });

    it("throws for a non-matching proxy", () => {
      membrane.getMembraneProxy.and.returnValue([true, {}]);
      expect(
        () => rules.storeUnknownAsLocal("wet", proxy)
      ).toThrowError("storeUnknownAsLocal requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).not.toHaveBeenCalled();
    });
  });

  describe(".requireLocalDelete()", () => {
    beforeEach(() => cylinder.setLocalFlag = jasmine.createSpy("requireLocalDelete"));

    it("sets the right flag on the ProxyCylinder", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      rules.requireLocalDelete("wet", proxy);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).toHaveBeenCalledOnceWith("wet", "requireLocalDelete", true);
    });

    it("throws for a non-existent proxy", () => {
      membrane.getMembraneProxy.and.returnValue([false]);
      expect(
        () => rules.requireLocalDelete("wet", proxy)
      ).toThrowError("requireLocalDelete requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).not.toHaveBeenCalled();
    });

    it("throws for a non-matching proxy", () => {
      membrane.getMembraneProxy.and.returnValue([true, {}]);
      expect(
        () => rules.requireLocalDelete("wet", proxy)
      ).toThrowError("requireLocalDelete requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).not.toHaveBeenCalled();
    });
  });

  describe(".filterOwnKeys()", () => {
    beforeEach(() => {
      cylinder.originGraph = "wet";
      cylinder.proxyDataByGraph = new Map([
        ["wet", {}],
        ["dry", {}],
        ["damp", {}]
      ]);
      cylinder.getShadowTarget  = jasmine.createSpy("getShadowTarget");
      cylinder.setOwnKeysFilter = jasmine.createSpy("setOwnKeysFilter");
    });

    it("accepts a filter function", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      const filterFunc = jasmine.createSpy("filter");
      const obj1 = {};
      const obj2 = {};
      cylinder.getShadowTarget.and.returnValues(obj1, obj2);

      rules.filterOwnKeys("wet", proxy, filterFunc);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).toHaveBeenCalledOnceWith("wet", filterFunc);
      expect(filterFunc).toHaveBeenCalledTimes(0);
      expect(cylinder.getShadowTarget).toHaveBeenCalledTimes(2);
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("dry");
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("damp");
    });

    it("converts a filter set into a filter function", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      const filterSet = new Set(["acceptKey"]);

      const methodList = [ "has", "add", "clear", "delete", "entries", "forEach", "values" ];
      methodList.forEach(key => {
        filterSet[key] = jasmine.createSpy(key, filterSet[key]);
        filterSet[key].and.callThrough();
      });

      const obj1 = {};
      const obj2 = {};
      cylinder.getShadowTarget.and.returnValues(obj1, obj2);

      rules.filterOwnKeys("wet", proxy, filterSet);

      methodList.forEach(key => {
        expect(filterSet[key]).toHaveBeenCalledTimes(0);
      });

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).toHaveBeenCalledTimes(1);
      expect(cylinder.getShadowTarget).toHaveBeenCalledTimes(2);
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("dry");
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("damp");

      const [graphName, filterFunc] = cylinder.setOwnKeysFilter.calls.first().args;
      expect(graphName).toBe("wet");
      expect(typeof filterFunc).toBe("function");

      let maybeValue = "rejectKey";
      expect(filterFunc(maybeValue)).toBe(false);
      expect(filterSet.has).toHaveBeenCalledOnceWith(maybeValue);

      filterSet.has.calls.reset();

      maybeValue = "acceptKey";
      expect(filterFunc(maybeValue)).toBe(true);
      expect(filterSet.has).toHaveBeenCalledOnceWith(maybeValue);

      methodList.shift(); // drop "has"
      methodList.forEach(key => {
        expect(filterSet[key]).toHaveBeenCalledTimes(0);
      });
    });

    it("converts a filter array into a filter function", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      const filterArray = ["acceptKey"];

      const obj1 = {};
      const obj2 = {};
      cylinder.getShadowTarget.and.returnValues(obj1, obj2);

      rules.filterOwnKeys("wet", proxy, filterArray);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).toHaveBeenCalledTimes(1);
      expect(cylinder.getShadowTarget).toHaveBeenCalledTimes(2);
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("dry");
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("damp");

      const [graphName, filterFunc] = cylinder.setOwnKeysFilter.calls.first().args;
      expect(graphName).toBe("wet");
      expect(typeof filterFunc).toBe("function");

      let maybeValue = "rejectKey";
      expect(filterFunc(maybeValue)).toBe(false);

      maybeValue = "acceptKey";
      expect(filterFunc(maybeValue)).toBe(true);
    });

    it("allows clearing a filter by setting the filter to null", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      const obj1 = {};
      const obj2 = {};
      cylinder.getShadowTarget.and.returnValues(obj1, obj2);

      rules.filterOwnKeys("wet", proxy, null);
      expect(cylinder.getShadowTarget).toHaveBeenCalledTimes(2);
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("dry");
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("damp");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).toHaveBeenCalledOnceWith("wet", null);
    });

    it("only checks the passed-in graph's shadow target when it isn't the origin graph", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      const filterFunc = jasmine.createSpy("filter");
      const obj1 = {};
      const obj2 = {};
      cylinder.getShadowTarget.and.returnValues(obj1, obj2);

      rules.filterOwnKeys("damp", proxy, filterFunc);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("damp", proxy);
      expect(cylinder.setOwnKeysFilter).toHaveBeenCalledOnceWith("damp", filterFunc);
      expect(filterFunc).toHaveBeenCalledTimes(0);
      expect(cylinder.getShadowTarget).toHaveBeenCalledTimes(1);
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("damp");
    });

    it("throws for a non-usable filter", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(() => {
        rules.filterOwnKeys("wet", proxy, {})
      }).toThrowError("filter must be a function, array or Set!");
      expect(() => {
        rules.filterOwnKeys("wet", proxy)
      }).toThrowError("filter must be a function, array or Set!");
      expect(() => {
        rules.filterOwnKeys("wet", proxy, true)
      }).toThrowError("filter must be a function, array or Set!");
      expect(() => {
        rules.filterOwnKeys("wet", proxy, 3)
      }).toThrowError("filter must be a function, array or Set!");
    });

    it("throws for a non-existent proxy", () => {
      membrane.getMembraneProxy.and.returnValue([false]);
      expect(
        () => rules.filterOwnKeys("wet", proxy, new Set)
      ).toThrowError("filterOwnKeys requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).not.toHaveBeenCalled();
    });

    it("throws for a non-matching proxy", () => {
      membrane.getMembraneProxy.and.returnValue([true, {}]);
      expect(
        () => rules.filterOwnKeys("wet", proxy, new Set)
      ).toThrowError("filterOwnKeys requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).not.toHaveBeenCalled();
    });

    it("throws for a non-extensible object in the cylinder", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);
      const filterFunc = jasmine.createSpy("filter");
      const obj1 = {};
      const obj2 = {};
      cylinder.getShadowTarget.and.returnValues(obj1, obj2);

      Reflect.preventExtensions(obj1);

      expect(
        () => rules.filterOwnKeys("wet", proxy, filterFunc)
      ).toThrowError("filterOwnKeys cannot apply to a non-extensible proxy");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setOwnKeysFilter).toHaveBeenCalledTimes(0);
      expect(filterFunc).toHaveBeenCalledTimes(0);
      expect(cylinder.getShadowTarget).toHaveBeenCalledTimes(1);
      expect(cylinder.getShadowTarget).toHaveBeenCalledWith("dry");
    });
  });

  describe(".truncateArgList()", () => {
    beforeEach(() => {
      proxy = function() {};

      cylinder.setTruncateArgList = jasmine.createSpy("setTruncateArgList");
    });

    it("passes through a true value for requiring truncation to function arity", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      rules.truncateArgList("wet", proxy, true);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).toHaveBeenCalledOnceWith("wet", true);
    });

    it("passes through a false value for requiring truncation to function arity", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      rules.truncateArgList("wet", proxy, false);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).toHaveBeenCalledOnceWith("wet", false);
    });

    it("passes through a positive integer value for requiring truncation to function arity", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      rules.truncateArgList("wet", proxy, 4);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).toHaveBeenCalledOnceWith("wet", 4);
    });

    it("passes through zero as the value for requiring truncation to function arity", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      rules.truncateArgList("wet", proxy, 0);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).toHaveBeenCalledOnceWith("wet", 0);
    });

    it("throws for a non-existent proxy", () => {
      membrane.getMembraneProxy.and.returnValue([false]);
      expect(
        () => rules.truncateArgList("wet", proxy, true)
      ).toThrowError("truncateArgList requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });

    it("throws for a non-matching proxy", () => {
      membrane.getMembraneProxy.and.returnValue([true, {}]);
      expect(
        () => rules.truncateArgList("wet", proxy, false)
      ).toThrowError("truncateArgList requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });

    it("throws if the proxy is not a function", () => {
      proxy = {};
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(
        () => rules.truncateArgList("wet", proxy, true)
      ).toThrowError("proxy must be a function!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });

    it("throws if the value is a decimal number", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(
        () => rules.truncateArgList("wet", proxy, Math.PI)
      ).toThrowError("value must be a non-negative integer or a boolean!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });

    it("throws if the value is a negative number", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(
        () => rules.truncateArgList("wet", proxy, -1)
      ).toThrowError("value must be a non-negative integer or a boolean!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });

    it("throws if the value is an infinite number", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(
        () => rules.truncateArgList("wet", proxy, Infinity)
      ).toThrowError("value must be a non-negative integer or a boolean!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });

    it("throws if the value is not a number or a boolean", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(
        () => rules.truncateArgList("wet", proxy, null)
      ).toThrowError("value must be a non-negative integer or a boolean!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setTruncateArgList).not.toHaveBeenCalled();
    });
  });

  describe(".disableTraps()", () => {
    beforeEach(() => {
      cylinder.setLocalFlag = jasmine.createSpy("disableTraps");
    });

    it("uses cylinder.setLocalFlag to mark traps disabled", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      rules.disableTraps("wet", proxy, ["apply", "construct"]);

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).toHaveBeenCalledTimes(2);
      expect(cylinder.setLocalFlag).toHaveBeenCalledWith("wet", `disableTrap(apply)`, true);
      expect(cylinder.setLocalFlag).toHaveBeenCalledWith("wet", `disableTrap(construct)`, true);
    });

    it("throws for a non-existent proxy", () => {
      membrane.getMembraneProxy.and.returnValue([false]);
      expect(
        () => rules.disableTraps("wet", proxy)
      ).toThrowError("disableTraps requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).not.toHaveBeenCalled();
    });

    it("throws for a non-matching proxy", () => {
      membrane.getMembraneProxy.and.returnValue([true, {}]);
      expect(
        () => rules.disableTraps("wet", proxy)
      ).toThrowError("disableTraps requires a known proxy!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).not.toHaveBeenCalled();
    });

    it("throws for unknown trap names", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(() => {
        rules.disableTraps("wet", proxy, ["apply", "construct", "foo"])
      }).toThrowError("Unknown trap name: foo");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).toHaveBeenCalledTimes(0);
    });

    it("throws for a non-array trapList argument", () => {
      membrane.getMembraneProxy.and.returnValue([true, proxy]);

      expect(() => {
        rules.disableTraps("wet", proxy, new Set([
          "apply", "construct"
        ]))
      }).toThrowError("Trap list must be an array of strings!");

      expect(membrane.getMembraneProxy).toHaveBeenCalledOnceWith("wet", proxy);
      expect(cylinder.setLocalFlag).toHaveBeenCalledTimes(0);
    });
  });

  it(".createDistortionsListener() does exactly what it says", () => {
    expect(rules.createDistortionsListener() instanceof DistortionsListener).toBe(true);
  });
});
