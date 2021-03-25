import DistortionsListener from "../../source/core/DistortionsListener.mjs";
import ProxyMessage from "../../source/core/broadcasters/ProxyMessage.mjs";

import {
  NWNCDataDescriptor,
  Primordials,
  allTraps,
  isDataDescriptor,
  returnFalse,
} from "../../source/core/utilities/shared.mjs";

describe("DistortionsListener", () => {
  let listener, membrane;
  beforeEach(() => {
    membrane = {
      ownsGraph: jasmine.createSpy("ownsGraph"),
      modifyRules: {},
    };
    listener = new DistortionsListener(membrane);
  });

  afterEach(() => {
    membrane = null;
    listener = null;
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(DistortionsListener)).toBe(true);
    expect(Object.isFrozen(DistortionsListener.prototype)).toBe(true);
  });

  it(".sampleConfig() has some basic properties", () => {
    let baseConfig = listener.sampleConfig();

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

  describe(".addListener()", () => {
    it("throws for calling for the same value and category twice", () => {
      const config = {};
      const realTarget = {};
      listener.addListener(realTarget, "value", config);
      expect(() => listener.addListener(realTarget, "value", config))
            .toThrowError("Value has already been defined!");

      expect(() => listener.addListener(realTarget, "value", {}))
            .toThrowError("Value has already been defined!");
    });

    it("accepts value, prototype and instance categories for functions as the value", () => {
      class realTarget {}
      expect(() => {
        listener.addListener(realTarget, "value", {});
        listener.addListener(realTarget, "prototype", {});
        listener.addListener(realTarget, "instance", {});
      }).not.toThrow();
    });

    it("throws for calling with a category of 'prototype' and a non-function value", () => {
      expect(() => {
        listener.addListener({}, "prototype", {});
      }).toThrowError("The prototype category requires a function value!");
    });

    it("throws for calling for the category 'prototype' and a function, then for the category 'value' and the function's prototype", () => {
      class realTarget {}
      listener.addListener(realTarget, "prototype", {});
      expect(() => {
        listener.addListener(realTarget.prototype, "value", {});
      }).toThrowError("Value has already been defined!");
    });

    it("throws for calling for the category 'value' and a function's prototype, then for the category 'prototype and the function", () => {
      class realTarget {}
      listener.addListener(realTarget.prototype, "value", {});
      expect(() => {
        listener.addListener(realTarget, "prototype", {});
      }).toThrowError("Value has already been defined!");
    });

    it("throws for calling with a category of 'iterable' and repeated values", () => {
      const value = {};
      expect(
        () => listener.addListener([value, value], "iterable", {})
      ).toThrowError("Value has already been defined!");
    });

    it("throws for calling with a category of 'instance' and a non-function value", () => {
      expect(() => {
        listener.addListener({}, "instance", {});
      }).toThrowError("The instance category requires a function value!");
    });

    it("throws for calling with a category of 'filter' and a non-function value", () => {
      expect(() => {
        listener.addListener({}, "filter", {});
      }).toThrowError("The filter category requires a function value!");
    });

    it("throws for calling for the category 'filter' twice with the same value", () => {
      listener.addListener(returnFalse, "filter", {});
      expect(
        () => listener.addListener(returnFalse, "filter", {})
      ).toThrowError("Value has already been defined!");
    });

    it("throws for an unknown category", () => {
      expect(
        () => listener.addListener({}, "foo", {})
      ).toThrowError("Unsupported category 'foo' for value!")
    });
  });

  it(".addIgnorable() marks an object as ignorable", () => {
    membrane.ownsGraph.and.returnValue(true);
    const handler = {
      addProxyListener: () => {},
      mayReplacePassThrough: true,
      passThroughFilter: returnFalse,
    };

    listener.bindToHandler(handler);

    const ignorable = {};
    listener.addIgnorable(ignorable);
    listener.addIgnorable(true);

    expect(handler.passThroughFilter(ignorable)).toBe(true);
    expect(handler.passThroughFilter({})).toBe(false);
    expect(handler.passThroughFilter(true)).toBe(false);
  });

  it(".ignorePrimordials() calls .addIgnorable() once for each primordial", () => {
    expect(Reflect.defineProperty(
      listener,
      "addIgnorable",
      new NWNCDataDescriptor(jasmine.createSpy("addIgnorable"), true)
    )).toBe(true);

    listener.ignorePrimordials();

    Primordials.forEach(p => expect(listener.addIgnorable).toHaveBeenCalledWith(p));
    expect(listener.addIgnorable).toHaveBeenCalledTimes(Primordials.length);
  });

  describe(".bindToHandler()", () => {
    it("adds itself as a ProxyListener to an ObjectGraph whose mayReplacePassThrough is false", () => {
      membrane.ownsGraph.and.returnValue(true);

      const handler = jasmine.createSpyObj(
        "handler",
        [ "addProxyListener" ],
        [ "passThroughFilter", "mayReplacePassThrough" ]
      );
      const mayReplace = Reflect.getOwnPropertyDescriptor(handler, "mayReplacePassThrough").get
      mayReplace.and.returnValue(false);

      expect(Reflect.defineProperty(
        listener,
        "handleProxyMessage",
        new NWNCDataDescriptor(jasmine.createSpy("handleProxyMessage"), true)
      )).toBe(true);

      listener.bindToHandler(handler);
      expect(membrane.ownsGraph).toHaveBeenCalledOnceWith(handler);
      expect(listener.handleProxyMessage).toHaveBeenCalledTimes(0);

      expect(handler.addProxyListener).toHaveBeenCalledTimes(1);
      if (handler.addProxyListener.calls.count() === 1) {
        const first = handler.addProxyListener.calls.first();
        expect(first.args.length).toBe(1);
        const callback = first.args[0];
        const message = {};
        callback(message);

        expect(listener.handleProxyMessage).toHaveBeenCalledOnceWith(message);
      }

      const passThroughDesc = Reflect.getOwnPropertyDescriptor(handler, "passThroughFilter");
      expect(passThroughDesc.set).toHaveBeenCalledTimes(0);
      expect(passThroughDesc.get).toHaveBeenCalledTimes(0);
    });

    it("adds itself as a ProxyListener to an ObjectGraph whose mayReplacePassThrough is true", () => {
      membrane.ownsGraph.and.returnValue(true);

      const handler = jasmine.createSpyObj(
        "handler",
        [ "addProxyListener" ],
        [ "passThroughFilter", "mayReplacePassThrough" ]
      );
      const mayReplace = Reflect.getOwnPropertyDescriptor(handler, "mayReplacePassThrough").get
      mayReplace.and.returnValue(true);

      expect(Reflect.defineProperty(
        listener,
        "handleProxyMessage",
        new NWNCDataDescriptor(jasmine.createSpy("handleProxyMessage"), true)
      )).toBe(true);

      listener.bindToHandler(handler);
      expect(membrane.ownsGraph).toHaveBeenCalledOnceWith(handler);
      expect(listener.handleProxyMessage).toHaveBeenCalledTimes(0);

      expect(handler.addProxyListener).toHaveBeenCalledTimes(1);
      if (handler.addProxyListener.calls.count() === 1) {
        const first = handler.addProxyListener.calls.first();
        expect(first.args.length).toBe(1);
        const callback = first.args[0];
        const message = {};
        callback(message);

        expect(listener.handleProxyMessage).toHaveBeenCalledOnceWith(message);
      }

      const passThroughDesc = Reflect.getOwnPropertyDescriptor(handler, "passThroughFilter");
      expect(passThroughDesc.set).toHaveBeenCalledTimes(1);
      expect(passThroughDesc.get).toHaveBeenCalledTimes(0);
    });

    it("throws when the membrane doesn't own the handler", () => {
      membrane.ownsGraph.and.returnValue(false);
      expect(() => {
        listener.bindToHandler({})
      }).toThrowError("Membrane must own the first argument as an object graph handler!");
    });
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
