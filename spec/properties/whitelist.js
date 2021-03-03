if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Whitelisting object properties", function() {
  "use strict";
  var wetDocument, dryDocument;

  function HEAT() { return "handleEventAtTarget stub"; }
  function HEAT_NEW() { return "Hello World"; }

  /* These lists specify properties defined on the objects.  For instance,
   * childNodes is defined in NodeWhiteList because every parts.wet.Node object
   * has a childNodes property.
   */

  const EventListenerWetWhiteList = [
    "handleEvent",
  ];

  const EventTargetWhiteList = [
    "addEventListener",
    "dispatchEvent",
  ];

  const NodeWhiteList = [
    "childNodes",
    "parentNode",
  ];

  const NodeProtoWhiteList = [
    "insertBefore",
    "firstChild",
  ];

  const ElementWhiteList = [
    "nodeType",
    "nodeName",
  ];

  const docWhiteList = [
    "ownerDocument",
    "childNodes",
    "nodeType",
    "nodeName",
    "parentNode",
    "createElement",
    "insertBefore",
    "firstChild",
    "baseURL",
    "addEventListener",
    "dispatchEvent",
    "rootElement",
  ];

  function defineManualMockOptions() {
    function buildFilter(names, prevFilter) {
      return function(elem) {
        if (prevFilter && prevFilter(elem))
          return true;
        return names.includes(elem);
      };
    }

    const nameFilters = {};
    nameFilters.doc = buildFilter(docWhiteList);
    nameFilters.listener = buildFilter(EventListenerWetWhiteList);
    nameFilters.target = buildFilter(EventTargetWhiteList);
    nameFilters.node = buildFilter(NodeWhiteList, nameFilters.target);
    nameFilters.element = buildFilter(ElementWhiteList, nameFilters.node);

    nameFilters.proto = {};
    nameFilters.proto.node = buildFilter(NodeProtoWhiteList, nameFilters.target);
    nameFilters.proto.element = buildFilter([], nameFilters.proto.node);

    var parts, dryWetMB, EventListenerProto;
    const mockOptions = {
      includeDamp: false,
      logger: null,
      checkEvent: null,

      whitelist: function(meta, filter, graphName = "wet") {
        dryWetMB.modifyRules.storeUnknownAsLocal(graphName, meta.target);
        dryWetMB.modifyRules.requireLocalDelete(graphName, meta.target);
        dryWetMB.modifyRules.filterOwnKeys(graphName, meta.target, filter);
        meta.stopIteration();
      },

      wetHandlerCreated: function(handler, Mocks) {
        parts = Mocks;
        dryWetMB = parts.membrane;
        EventListenerProto = Object.getPrototypeOf(parts.wet.Node.prototype);

        {
          let oldHandleEvent = EventListenerProto.handleEventAtTarget;
          EventListenerProto.handleEventAtTarget = function(/*event*/) {
            if (mockOptions.checkEvent)
              mockOptions.checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }

        /**
         * This is a proxy listener for protecting the listener argument of
         * EventTargetWet.prototype.addEventListener().
         */
        const listener = (function(meta) {
          if ((meta.callable !== EventListenerProto.addEventListener) ||
              (meta.trapName !== "apply") ||
              (meta.argIndex !== 1))
            return;

          if (typeof meta.target == "function")
            return;

          if ((typeof meta.target != "object") || (meta.target === null))
            meta.throwException(new Error(".addEventListener requires listener be an object or a function!"));

          try {
            this.whitelist(meta, nameFilters.listener, "dry");
          }
          catch (ex) {
            meta.throwException(ex);
          }
        }).bind(this);
        handler.addProxyListener(listener);
      },

      dryHandlerCreated: function(handler/*, Mocks */) {
        /**
         * This is a long sequence of tests, matching the constructed target
         * to the whitelist to apply.  It's a little more complicated than I
         * would like, but for a manual test, it works well enough.
         */
        var listener = (function(meta) {
          if (meta.target === parts.wet.doc) {
            // parts.dry.doc will be meta.proxy.
            this.whitelist(meta, nameFilters.doc);
            return;
          }
          if (meta.target instanceof parts.wet.Element) {
            // parts.dry.Element will be meta.proxy or in the prototype chain.
            this.whitelist(meta, nameFilters.element);
            return;
          }

          if (meta.target instanceof parts.wet.Node) {
            // parts.dry.Node will be meta.proxy.
            this.whitelist(meta, nameFilters.node);
            return;
          }

          if (meta.target === parts.wet.Element) {
            this.whitelist(meta, nameFilters.proto.element);
            return;
          }

          if (meta.target === parts.wet.Node) {
            this.whitelist(meta, nameFilters.proto.node);
            return;
          }

          if (meta.target === parts.wet.Node.prototype) {
            this.whitelist(meta, nameFilters.proto.node);
            return;
          }

          if (meta.target === EventListenerProto) {
            this.whitelist(meta, nameFilters.target);
            return;
          }
        }).bind(this);

        handler.addProxyListener(listener);
      },
    };

    return mockOptions;
  }
  
  function defineMockOptionsByDistortionsListener(mainIsWet = false) {
    var parts, dryWetMB, EventListenerProto;
    const mockOptions = {
      includeDamp: false,
      logger: null,

      checkEvent: null,

      wetHandlerCreated: function(handler, Mocks) {
        parts = Mocks;
        dryWetMB = parts.membrane;
        EventListenerProto = Object.getPrototypeOf(parts.wet.Node.prototype);

        const distortions = dryWetMB.modifyRules.createDistortionsListener();
        {
          let oldHandleEvent = EventListenerProto.handleEventAtTarget;
          EventListenerProto.handleEventAtTarget = function(/*event*/) {
            if (mockOptions.checkEvent)
              mockOptions.checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }

        /**
         * This is a proxy listener for protecting the listener argument of
         * EventTargetWet.prototype.addEventListener().
         */

        const evLConfig = distortions.sampleConfig();
        evLConfig.filterOwnKeys = EventListenerWetWhiteList;
        evLConfig.storeUnknownAsLocal = true;
        evLConfig.requireLocalDelete = true;

        const evLFilter = function(meta) {
          if ((meta.callable !== EventListenerProto.addEventListener) ||
              (meta.trapName !== "apply") ||
              (meta.argIndex !== 1))
            return false;

          if (typeof meta.target == "function")
            return false;

          if ((typeof meta.target != "object") || (meta.target === null)) {
            meta.throwException(new Error(".addEventListener requires listener be an object or a function!"));
            return false;
          }

          return true;
        };

        distortions.addListener(evLFilter, "filter", evLConfig);

        if (mainIsWet)
          this.whitelistMain(distortions);

        distortions.bindToHandler(handler);
      },

      whitelist: function(distortions, value, filteredOwnKeys, category) {
        const config = distortions.sampleConfig();
        config.filterOwnKeys = filteredOwnKeys;
        config.storeUnknownAsLocal = true;
        config.requireLocalDelete = true;
        distortions.addListener(value, category, config);
      },

      dryHandlerCreated: function(handler/*, Mocks */) {
        if (mainIsWet)
          return;
        const distortions = dryWetMB.modifyRules.createDistortionsListener();
        this.whitelistMain(distortions);
        distortions.bindToHandler(handler);
      },

      whitelistMain: function(distortions) {
        this.whitelist(distortions, parts.wet.doc, docWhiteList, "value");
        this.whitelist(
          distortions, parts.wet.Element, ElementWhiteList, "instance"
        );
        this.whitelist(
          distortions, parts.wet.Node, NodeWhiteList, "instance"
        );
        this.whitelist(distortions, parts.wet.Element, [], "value");
        this.whitelist(
          distortions, parts.wet.Node, NodeProtoWhiteList, "value"
        );
        this.whitelist(
          distortions, parts.wet.Node, NodeProtoWhiteList, "prototype"
        );
        this.whitelist(
          distortions, EventListenerProto, EventTargetWhiteList, "value"
        );
      },
    };

    return mockOptions;
  }

  function defineWhitelistTests(mockDefine) {
    var parts, mockOptions;
    beforeEach(function() {
      mockOptions = mockDefine();
      parts = MembraneMocks(mockOptions);
      wetDocument = parts.wet.doc;
      dryDocument = parts.dry.doc;
    });

    afterEach(function() {
      dryDocument.dispatchEvent("unload");
      dryDocument = null;
      wetDocument = null;
      mockOptions.checkEvent = null;
      mockOptions = null;
    });

    it("exposes listed values.", function() {
      let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "nodeName");
      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "nodeName");
      expect(typeof descWet).not.toBe(undefined);
      expect(typeof descDry).not.toBe(undefined);
      if (descWet && descDry) {
        expect(descWet.value).toBe("#document");
        expect(descDry.value).toBe("#document");
      }
    });

    it("hides unlisted values.", function() {
      let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
      expect(descWet).not.toBe(undefined);
      expect(typeof descWet.value).toBe("function");
      let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
      expect(descDry).toBe(undefined);
    });

    it(
      "and redefining a not-whitelisted property on the wet document has no effect on the dry document.",
      function() {
        let descWet = Reflect.getOwnPropertyDescriptor(
          wetDocument,
          "handleEventAtTarget"
        );

        Reflect.defineProperty(wetDocument, "handleEventAtTarget", {
          value: HEAT,
          writable: false,
          enumerable: true,
          configurable: true,
        });

        let descDry = Reflect.getOwnPropertyDescriptor(
          dryDocument,
          "handleEventAtTarget"
        );
        expect(descDry).toBe(undefined);

        Reflect.defineProperty(wetDocument, "handleEventAtTarget", descWet);
      }
    );

    it(
      "and defining a not-whitelisted property on the dry document has no effect on the wet document.",
      function () {
        var oldDescWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");

        const isDryExtensible = Reflect.isExtensible(dryDocument);
        var defined = Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
          value: HEAT_NEW,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(isDryExtensible);

        var descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
        expect(descWet).not.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(oldDescWet.value);

        var descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
        let expectation = expect(descDry);
        if (isDryExtensible)
          expectation = expectation.not;
        expectation.toBe(undefined);
        if (descDry)
          expect(descDry.value).toBe(HEAT_NEW);
      }
    );

    it(
      "and deleting a not-whitelisted property on the dry document has no effect on the wet document.",
      function() {
        var oldDescWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");

        Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
          value: HEAT_NEW,
          writable: false,
          enumerable: true,
          configurable: true
        });

        var deleted = Reflect.deleteProperty(dryDocument, "handleEventAtTarget");
        expect(deleted).toBe(true);

        var descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
        expect(descWet).not.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(oldDescWet.value);

        var descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
        expect(descDry).toBe(undefined);
      }
    );

    it(
      "and defining a new property on the dry document has no effect on the wet document.",
      function() {
        const isDryExtensible = Reflect.isExtensible(dryDocument);
        let defined = Reflect.defineProperty(dryDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(isDryExtensible);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        let expectation = expect(descDry);
        if (isDryExtensible)
          expectation = expectation.not;
        expectation.toBe(undefined);
        if (descDry)
          expect(descDry.value).toBe(2);
      }
    );

    it(
      "and deleting a new property on the dry document has no effect on the wet document.",
      function() {
        Reflect.defineProperty(dryDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        let deleted = Reflect.deleteProperty(dryDocument, "extra");
        expect(deleted).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).toBe(undefined);
      }
    );

    it(
      "and defining a new property on the wet document has no effect on the dry document.",
      function() {
        const isWetExtensible = Reflect.isExtensible(wetDocument);
        let defined = Reflect.defineProperty(wetDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(isWetExtensible);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        let expectation = expect(descWet);
        if (isWetExtensible)
          expectation = expectation.not;
        expectation.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(2);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).toBe(undefined);
      }
    );

    it(
      "and deleting a new property on the wet document has no effect on the dry document.",
      function() {
        Reflect.defineProperty(wetDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });

        let deleted = Reflect.deleteProperty(wetDocument, "extra");
        expect(deleted).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).toBe(undefined);
      }
    );

    it("applies similarly to inherited names.", function() {
      // Whitelisting applies similarly to inherited names.
      let dryRoot = dryDocument.rootElement;
      expect(dryRoot).not.toBe(wetDocument.rootElement);
      dryDocument.insertBefore(dryRoot, null);

      // ElementWet constructor tests.
      expect(dryRoot.nodeName).toBe("root");
      expect(dryRoot.nodeType).toBe(1);

      // NodeWet constructor tests.
      {
        let kids = dryRoot.childNodes;
        let isArray = Array.isArray(kids);
        if (isArray)
          expect(kids.length).toBe(0);
      }

      /* This doesn't appear because it's not whitelisted under the
       * "instanceof parts.wet.Element" test.  Specifically, it's not part of
       * NodeWhiteList or ElementWhiteList.
       */
      expect(dryRoot.ownerDocument).toBe(undefined);

      expect(dryRoot.parentNode).not.toBe(undefined);
      expect(typeof dryRoot.wetMarker).toBe("undefined");

      // NodeWet.prototype tests
      expect(typeof dryRoot.insertBefore).toBe("function");
      expect(typeof dryRoot.shouldNotBeAmongKeys).toBe("undefined");

      // EventListenerWet tests
      expect(typeof dryRoot.__events__).toBe("undefined");

      // EventListenerWet.prototype tests
      expect(typeof dryRoot.addEventListener).toBe("function");
      expect(typeof dryRoot.dispatchEvent).toBe("function");
      expect(typeof dryRoot.handleEventAtTarget).toBe("undefined");
    });

    it("of method arguments goes both ways.", function() {
      var event = null;

      /* Testing a handleEvent function added as a method.

         We're also testing the white-listing of method arguments by the
         checkEvent function, inspecting a proxied event listener object and
         verifying that basic whitelisting of the arguments, specified manually,
         also works.  The listener object, for instance, is supposed to have
         only one property, the handleEvent() function.  Anything else is
         foreign, and the "trusted" wet code should NOT be able to propagate
         setting or deleting properties to the dry listeners that were passed in.
      */
      let listener = {
        handleEvent: function (evt) {
          event = {};
          let keys = Reflect.ownKeys(evt);
          keys.forEach((key) => { event[key] = evt[key]; }, this);
          event.thisObj = this;
        },
        didFire: false,
      };
      dryDocument.addEventListener("asMethod", listener, false);
      dryDocument.insertBefore(dryDocument.rootElement, null);

      mockOptions.checkEvent = function(event) {
        let handlers = this.__events__.slice(0);
        let length = handlers.length;
        let desired = null;
        for (let i = 0; i < length; i++) {
          let h = handlers[i];
          if (h.type !== event.type)
            continue;
          let hCode = (h.isBubbling) ? 4 - event.currentPhase : event.currentPhase;
          if (hCode === 3)
            continue;

          expect(desired).toBe(null);
          desired = h.listener;
        }

        // desired should be a proxy to listener.
        expect(desired).not.toBe(listener);
        expect(desired).not.toBe(null);
        if (desired === null)
          return;

        let keys = Reflect.ownKeys(desired);

        expect(keys.includes("handleEvent")).toBe(true);
        expect(keys.includes("didFire")).toBe(false);

        desired.foo = 3;
        expect(typeof listener.foo).toBe("undefined");
        {
          let desc = Reflect.getOwnPropertyDescriptor(desired, "foo");
          expect(desc).not.toBe(undefined);
          if (desc) {
            expect(desc.value).toBe(3);
          }
        }

        desired.didFire = true;
        expect(listener.didFire).toBe(false);

        listener.didFire = true;
        mockOptions.checkEvent = null;
      };

      dryDocument.rootElement.dispatchEvent("asMethod");
      mockOptions.checkEvent = null;
      expect(listener.didFire).toBe(true);

      expect(event).not.toBe(null);
      if (event) {
        expect(event.type).toBe("asMethod");
        expect(event.currentPhase).toBe(1);
        expect(event.thisObj).toBe(listener);
      }
    });
  }

  function defineSealingTests(mockDefine) {
    describe("on unsealed objects", function() {
      defineWhitelistTests(mockDefine);
    });

    describe("on sealed dry objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.seal(dryDocument);
      });
    });

    describe("on sealed wet objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.seal(wetDocument);
      });
    });

    describe("on frozen dry objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.freeze(dryDocument);
      });
    });

    describe("on frozen wet objects", function() {
      defineWhitelistTests(mockDefine);
      beforeEach(function() {
        Object.freeze(wetDocument);
      });
    });
  }

  describe("manually", function() {
    defineSealingTests(defineManualMockOptions);
  });

  describe("automatically using distortions listeners on two object graphs", function() {
    defineSealingTests(defineMockOptionsByDistortionsListener.bind(null, false));
  });

  describe("automatically using distortions listeners on one object graph", function() {
    defineSealingTests(defineMockOptionsByDistortionsListener.bind(null, true));
  });
  
  it(
    "and getting a handler from a protected membrane works correctly",
    function() {
      function voidFunc() {}

      const DogfoodLogger = {
        _errorList: [],
        error: function(e) {
          this._errorList.push(e);
        },
        warn: voidFunc,
        info: voidFunc,
        debug: voidFunc,
        trace: voidFunc,

        getFirstError: function() {
          return this._errorList.length ? this._errorList[0] : undefined;
        }
      };
      const Dogfood = new Membrane({logger: DogfoodLogger});

      const publicAPI   = Dogfood.getHandlerByName(
        "public", { mustCreate: true }
      );
      const internalAPI = Dogfood.getHandlerByName(
        "internal", { mustCreate: true }
      );

      // lockdown of the public API here
      const mbListener = {
        mustProxyMethods: new Set(),

        whitelist: function(meta, names, graphName = "internal") {
          if (typeof meta.target === "function")
          {
            names = names.concat(["prototype", "length", "name"]);
          }

          names = new Set(names);
          Dogfood.modifyRules.storeUnknownAsLocal(graphName, meta.target);
          Dogfood.modifyRules.requireLocalDelete(graphName, meta.target);
          Dogfood.modifyRules.filterOwnKeys(
            graphName, meta.target, names.has.bind(names)
          );
          meta.stopIteration();
        },

        handleProxy: function(meta) {
          if (meta.target instanceof Membrane)
          {
            this.whitelist(meta, ["modifyRules", "logger"]);
          }
          else if (meta.target === Membrane)
          {
            this.whitelist(meta, []);
          }
          else if (meta.target === Membrane.prototype)
          {
            this.whitelist(meta, [
              "hasHandlerByGraph",
              "getHandlerByName",
              "convertArgumentToProxy",
              "warnOnce"
            ]);
          }
          else if (!this.mustProxyMethods.has(meta.target))
          {
            meta.proxy = meta.target;
          }
        }
      };

      {
        let keys = Reflect.ownKeys(Membrane.prototype);
        keys.forEach(function(propName) {
          let value = Membrane.prototype[propName];
          if (typeof value == "function")
            mbListener.mustProxyMethods.add(value);
        });
      }

      Object.freeze(mbListener);
      publicAPI.addProxyListener(mbListener.handleProxy.bind(mbListener));

      const DMembrane = Dogfood.convertArgumentToProxy(
        internalAPI, publicAPI, Membrane
      );
  
      expect(function() {
        const dryWetMB = new DMembrane();
        dryWetMB.getHandlerByName(
          "wet", { mustCreate: true }
        );
      }).not.toThrow();
      expect(DogfoodLogger.getFirstError()).toBe(undefined);
    }
  );
});
