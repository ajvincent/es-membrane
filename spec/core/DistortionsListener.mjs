import DistortionsListener from "../../source/core/DistortionsListener.mjs";
import ProxyMessage from "../../source/core/broadcasters/ProxyMessage.mjs";

import {
  allTraps,
  isDataDescriptor,
} from "../../source/core/sharedUtilities.mjs";

describe("DistortionsListener", () => {
  let listener, baseConfig, membrane;
  beforeEach(() => {
    membrane = {
      ownsHandler: jasmine.createSpy("ownsHandler"),
      modifyRules: {},
    };
    listener = new DistortionsListener(membrane);
    baseConfig = listener.sampleConfig();
  });

  afterEach(() => {
    membrane = null;
    listener = null;
    baseConfig = null;
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(DistortionsListener)).toBe(true);
    expect(Object.isFrozen(DistortionsListener.prototype)).toBe(true);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(listener)).toBe(true);
  });

  it(".sampleConfig() has some basic properties", () => {
    // isFunction = false
    expect(typeof baseConfig).toBe("object");
    expect(baseConfig.filterOwnKeys).toBe(false);
    expect(baseConfig.proxyTraps).toEqual(allTraps);
    expect(baseConfig.storeUnknownAsLocal).toBe(false);
    expect(baseConfig.requireLocalDelete).toBe(false);
    expect(baseConfig.useShadowTarget).toBe(false);

    let keys = Reflect.ownKeys(baseConfig);

    expect(keys).toEqual([
      "formatVersion",
      "dataVersion",
      "filterOwnKeys",
      "proxyTraps",
      "storeUnknownAsLocal",
      "requireLocalDelete",
      "useShadowTarget",
    ]);
    keys.forEach(key => {
      const desc = Reflect.getOwnPropertyDescriptor(baseConfig, key);
      expect(isDataDescriptor(desc)).toBe(true);
      expect(desc.writable).toBe(true);
      expect(desc.enumerable).toBe(true);
      expect(desc.configurable).toBe(true);
    });
    expect(Reflect.getPrototypeOf(baseConfig)).toBe(Object.prototype);
    expect(Reflect.isExtensible(baseConfig)).toBe(true);

    baseConfig = listener.sampleConfig(true);
    // isFunction = true
    expect(typeof baseConfig).toBe("object");
    expect(baseConfig.filterOwnKeys).toBe(false);
    expect(baseConfig.proxyTraps).toEqual(allTraps);
    expect(baseConfig.storeUnknownAsLocal).toBe(false);
    expect(baseConfig.requireLocalDelete).toBe(false);
    expect(baseConfig.useShadowTarget).toBe(false);
    expect(baseConfig.truncateArgList).toBe(false);

    expect(Reflect.ownKeys(baseConfig)).toEqual([
      "formatVersion",
      "dataVersion",
      "filterOwnKeys",
      "proxyTraps",
      "storeUnknownAsLocal",
      "requireLocalDelete",
      "useShadowTarget",
      "truncateArgList",
    ]);
    keys.forEach(key => {
      const desc = Reflect.getOwnPropertyDescriptor(baseConfig, key);
      expect(isDataDescriptor(desc)).toBe(true);
      expect(desc.writable).toBe(true);
      expect(desc.enumerable).toBe(true);
      expect(desc.configurable).toBe(true);
    });
    expect(Reflect.getPrototypeOf(baseConfig)).toBe(Object.prototype);
    expect(Reflect.isExtensible(baseConfig)).toBe(true);
  });

  xdescribe(".addListener()", () => {

  });

  xdescribe(".bindToHandler()", () => {
    it("", () => {

    });
  });

  xdescribe(".ignorePrimordials()", () => {

  });

  describe(".handleProxyMessage() with a non-origin graph", () => {
    let realTarget, proxy, graph, message;
    beforeEach(() => {
      realTarget = {};
      proxy = {};
      graph = {
        graphName: "dry",
      };
      message = new ProxyMessage(proxy, realTarget, graph, false);
    });

    // applyConfiguration tests
    it("calls modifyRulesAPI.filterOwnKeys() for a configuration with an array of keys", () => {
      const config = {
        filterOwnKeys: [ "foo" ],
      };

      membrane.modifyRules.filterOwnKeys = jasmine.createSpy("filterOwnKeys");

      listener.addListener(realTarget, "value", config);
      listener.handleProxyMessage(message);

      expect(membrane.modifyRules.filterOwnKeys).toHaveBeenCalledOnceWith(
        "dry", proxy, config.filterOwnKeys
      );

      expect(Reflect.isExtensible(proxy)).toBe(true);
    });

    it("prevents extensions for a non-extensible real target", () => {
      const config = {};

      Reflect.preventExtensions(realTarget);

      listener.addListener(realTarget, "value", config);
      listener.handleProxyMessage(message);

      expect(Reflect.isExtensible(proxy)).toBe(false);
    });

    it("calls modifyRulesAPI.disableTraps() for a configuration with proxyTraps", () => {
      const config = {
        proxyTraps: allTraps.slice(0),
      };
      config.proxyTraps.splice(config.proxyTraps.indexOf("getOwnPropertyDescriptor"), 1);
      membrane.modifyRules.disableTraps = jasmine.createSpy("disableTraps");

      listener.addListener(realTarget, "value", config);
      listener.handleProxyMessage(message);

      expect(membrane.modifyRules.disableTraps).toHaveBeenCalledTimes(1);
      const calls = membrane.modifyRules.disableTraps.calls;
      if (calls.count() !== 1)
        return;
      expect(calls.first().args).toEqual([
        "dry", proxy, [ "getOwnPropertyDescriptor" ]
      ]);
    });

    it("calls modifyRulesAPI.storeUnknownAsLocal() for a configuration having that as truthy", () => {
      const config = {
        storeUnknownAsLocal: true
      };
      membrane.modifyRules.storeUnknownAsLocal = jasmine.createSpy("storeUnknownAsLocal");

      listener.addListener(realTarget, "value", config);
      listener.handleProxyMessage(message);

      expect(membrane.modifyRules.storeUnknownAsLocal).toHaveBeenCalledOnceWith(
        "dry", proxy
      );
    });

    it("calls modifyRulesAPI.requireLocalDelete() for a configuration having that as truthy", () => {
      const config = {
        requireLocalDelete: true
      };
      membrane.modifyRules.requireLocalDelete = jasmine.createSpy("requireLocalDelete");

      listener.addListener(realTarget, "value", config);
      listener.handleProxyMessage(message);

      expect(membrane.modifyRules.requireLocalDelete).toHaveBeenCalledOnceWith(
        "dry", proxy
      );
    });

    describe("calls modifyRules.truncateArgList()", () => {
      beforeEach(() => {
        proxy = () => {};
        realTarget = () => {};
        message = new ProxyMessage(proxy, realTarget, graph, false);

        membrane.modifyRules.truncateArgList = jasmine.createSpy("truncateArgList");
      });

      it("for a configuration with truncateArgList as true", () => {
        const config = {
          truncateArgList: true
        };

        listener.addListener(realTarget, "value", config);
        listener.handleProxyMessage(message);

        expect(membrane.modifyRules.truncateArgList).toHaveBeenCalledOnceWith(
          "dry", proxy, true
        );
      });

      it("for a configuration with truncateArgList as a number", () => {
        const config = {
          truncateArgList: 4
        };

        listener.addListener(realTarget, "value", config);
        listener.handleProxyMessage(message);

        expect(membrane.modifyRules.truncateArgList).toHaveBeenCalledOnceWith(
          "dry", proxy, 4
        );
      });

      it("except for a configuration with truncateArgList as false", () => {
        const config = {
          truncateArgList: false
        };

        listener.addListener(realTarget, "value", config);
        listener.handleProxyMessage(message);

        expect(membrane.modifyRules.truncateArgList).toHaveBeenCalledTimes(0);
      });
    });

    // getConfigurationForListener tests (besides "value", which we've covered above)
    it("supports the 'prototype' category for a non-extensible real prototype", () => {
      const config = {};

      function proxySubclass() {}
      proxySubclass.prototype = proxy;

      function targetSubclass() {}
      targetSubclass.prototype = realTarget;

      Reflect.preventExtensions(realTarget);

      listener.addListener(targetSubclass, "prototype", config);
      listener.handleProxyMessage(message);

      expect(Reflect.isExtensible(proxy)).toBe(false);
    });

    it("supports the 'instance' category for a direct instance of a constructor", () => {
      const config = {};

      proxy = function() {}
      realTarget = function() {}

      const proxyInstance = new proxy();
      const targetInstance = new realTarget();

      message = new ProxyMessage(proxyInstance, targetInstance, graph, false);

      Reflect.preventExtensions(targetInstance);

      listener.addListener(realTarget, "instance", config);
      listener.handleProxyMessage(message);

      expect(Reflect.isExtensible(proxyInstance)).toBe(false);
    });

    it("does not support the 'instance' category for an indirect instance of a constructor", () => {
      const config = {};

      proxy = function() {}
      realTarget = function() {}

      function proxySubclass() {}
      proxySubclass.prototype = new proxy();

      function targetSubclass() {}
      targetSubclass.prototype = new realTarget();

      const proxyInstance = new proxySubclass();
      const targetInstance = new targetSubclass();

      message = new ProxyMessage(proxyInstance, targetInstance, graph, false);

      Reflect.preventExtensions(targetInstance);

      listener.addListener(realTarget, "instance", config);
      listener.handleProxyMessage(message);

      expect(Reflect.isExtensible(proxyInstance)).toBe(true);
    });

    it("supports the 'iterable' category for a list of values", () => {
      const config = {};

      Reflect.preventExtensions(realTarget);

      listener.addListener([{}, realTarget, {}], "iterable", config);
      listener.handleProxyMessage(message);

      expect(Reflect.isExtensible(proxy)).toBe(false);
    });

    it("supports the 'filter' category for a filtering function", () => {
      const config = {};

      Reflect.preventExtensions(realTarget);

      listener.addListener(
        m => m.realTarget === realTarget,
        "filter",
        config
      );
      listener.handleProxyMessage(message);

      expect(Reflect.isExtensible(proxy)).toBe(false);
    });
  });

  // modifyTarget is different, but that's all
  it(".handleProxyMessage() with an origin graph uses the realTarget (not the proxy) for modifyRules calls", () => {
    let realTarget, proxy, graph, message;
    realTarget = {};
    proxy = {};
    graph = {
      graphName: "dry",
    };
    message = new ProxyMessage(proxy, realTarget, graph, true);

    const config = {
      filterOwnKeys: [ "foo" ],
    };

    membrane.modifyRules.filterOwnKeys = jasmine.createSpy("filterOwnKeys");

    listener.addListener(realTarget, "value", config);
    listener.handleProxyMessage(message);

    expect(membrane.modifyRules.filterOwnKeys).toHaveBeenCalledOnceWith(
      "dry", realTarget, config.filterOwnKeys
    );

    expect(Reflect.isExtensible(proxy)).toBe(true);
  });
});
