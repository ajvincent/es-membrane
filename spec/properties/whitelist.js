"use strict";

if ((typeof Membrane != "function") || (typeof MembraneMocks != "function")) {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es7-membrane.js");
    var { MembraneMocks } = require("../../docs/dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

describe("Whitelisting object properties", function() {
  describe("manually", function() {
    //{ Setting up environment values.
    function HEAT() { return "handleEventAtTarget stub" }
    function HEAT_NEW() { return "Hello World"; }

    const EventListenerWetWhiteList = [
      "handleEvent",
    ];

    const EventTargetWhiteList = [
      "addEventListener",
      "dispatchEvent",
    ];

    const NodeWhiteList = [
      "childNodes",
      "ownerDocument",
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
    
    var parts, dryWetMB, EventListenerProto, checkEvent = null;
    const mockOptions = {
      whitelist: function(meta, filter, field = "wet") {
        dryWetMB.modifyRules.storeUnknownAsLocal(field, meta.target);
        dryWetMB.modifyRules.requireLocalDelete(field, meta.target);
        dryWetMB.modifyRules.filterOwnKeys(field, meta.target, filter);
        meta.stopIteration();
      },

      wetHandlerCreated: function(handler, Mocks) {
        parts = Mocks;
        dryWetMB = parts.membrane;
        EventListenerProto = Object.getPrototypeOf(parts.wet.Node.prototype);

        {
          let oldHandleEvent = EventListenerProto.handleEventAtTarget;
          EventListenerProto.handleEventAtTarget = function(event) {
            if (checkEvent)
              checkEvent.apply(this, arguments);
            return oldHandleEvent.apply(this, arguments);
          };
          parts.wet.doc.handleEventAtTarget = EventListenerProto.handleEventAtTarget;
        }

        /**
         * This is a proxy listener for protecting the listener argument of
         * EventTargetWet.prototype.addEventListener().
         */
        var listener = (function(meta) {
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
            // parts.dry.Element will be meta.proxy.
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
    //}

    var wetDocument, dryDocument;
    beforeEach(function() {
      parts = MembraneMocks(false, null, mockOptions);
      wetDocument = parts.wet.doc;
      dryDocument = parts.dry.doc;
      checkEvent = null;
    });

    afterEach(function() {
      dryDocument.dispatchEvent("unload");
      dryDocument = null;
      wetDocument = null;
      dryWetMB = null;
      checkEvent = null;
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

        var defined = Reflect.defineProperty(dryDocument, "handleEventAtTarget", {
          value: HEAT_NEW,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(true);

        var descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "handleEventAtTarget");
        expect(descWet).not.toBe(undefined);
        if (descWet)
          expect(descWet.value).toBe(oldDescWet.value);

        var descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "handleEventAtTarget");
        expect(descDry).not.toBe(undefined);
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
        let defined = Reflect.defineProperty(dryDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).toBe(undefined);

        let descDry = Reflect.getOwnPropertyDescriptor(dryDocument, "extra");
        expect(descDry).not.toBe(undefined);
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
        let defined = Reflect.defineProperty(wetDocument, "extra", {
          value: 2,
          writable: false,
          enumerable: true,
          configurable: true
        });
        expect(defined).toBe(true);

        let descWet = Reflect.getOwnPropertyDescriptor(wetDocument, "extra");
        expect(descWet).not.toBe(undefined);
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
      expect(dryRoot.ownerDocument).toBe(dryDocument);
      expect(dryRoot.parentNode).toBe(dryDocument);
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

      checkEvent = function(event) {
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
        checkEvent = null;
      };

      dryDocument.rootElement.dispatchEvent("asMethod");
      checkEvent = null;
      expect(listener.didFire).toBe(true);

      expect(event).not.toBe(null);
      if (event) {
        expect(event.type).toBe("asMethod");
        expect(event.currentPhase).toBe(1);
        expect(event.thisObj).toBe(listener);
      }
    });
  });

  it(
    "and getting a handler from a protected membrane works correctly",
    function() {
      const Dogfood = new Membrane();

      const publicAPI   = Dogfood.getHandlerByField("public", true);
      const internalAPI = Dogfood.getHandlerByField("internal", true);

      // lockdown of the public API here
      const mbListener = {
        mustProxyMethods: new Set(),

        whitelist: function(meta, names, field="internal") {
          if (typeof meta.target === "function")
          {
            names = names.concat(["prototype", "length", "name"]);
          }

          names = new Set(names);
          Dogfood.modifyRules.storeUnknownAsLocal(field, meta.target);
          Dogfood.modifyRules.requireLocalDelete(field, meta.target);
          Dogfood.modifyRules.filterOwnKeys(
            field, meta.target, names.has.bind(names)
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
              "hasHandlerByField",
              "getHandlerByField",
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
        const wetHandler = dryWetMB.getHandlerByField("wet", true);
      }).not.toThrow();
    }
  );
});
