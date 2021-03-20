import Membrane from "../../source/core/Membrane.mjs"

describe("Pass-through filters", function() {
  const MUSTCREATE = Object.freeze({ mustCreate: true });
  const p = {};
  function passP(value) {
    if (value === p)
      return true;
    return false;
  }
  describe("on the membrane", function() {
    it("do not wrap objects when returning true", function() {
      const membrane = new Membrane({passThroughFilter: passP});
      const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // second time test
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // the other way test
      wrappedP = membrane.convertArgumentToProxy(dryHandler, wetHandler, p);
      expect(wrappedP).toBe(p);

      // back again
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // through another graph handler
      const dampHandler = membrane.getHandlerByName(
        Symbol("damp"), { mustCreate: true }
      );
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dampHandler, p);
      expect(wrappedP).toBe(p);
    });

    it("defers to previously wrapped values", function() {
      let count = 0;
      const membrane = new Membrane({
        passThroughFilter: function(value) {
          count++;
          if ((value === p) && (count > 1))
            return true;
          return false;
        }
      });
      const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it(
      "allows a value to be wrapped if the filter returns false in the future (don't do this)",
      function() {
        /* XXX ajvincent Seriously, don't.  If you do, and you expect the
           membrane to preserve the identity assertions, you're asking it to
           remember every value that ever passes through it, and that's wasteful
           of memory - at least for the WeakMap that now has to hold every value
           the membrane has seen.
         */
        let count = 0;
        const membrane = new Membrane({
          passThroughFilter: function(value) {
            count++;
            if ((value === p) && (count === 1))
              return true;
            return false;
          }
        });
        const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
        const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

        let wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(p);

        let proxyToP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it(
      "force wrapping when the membrane filter returns false and there are no graph filters",
      function() {
        const membrane = new Membrane({passThroughFilter: () => false});
        const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
        const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

        let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it("cannot be replaced", function() {
      const membrane = new Membrane({
        passThroughFilter: passP,
      });

      let desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
      expect(typeof desc).toBe("object");
      if (!desc)
        return;
      expect(desc.value).toBe(passP);
      expect(desc.writable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect(desc.configurable).toBe(false);
    });

    it("cannot be assigned after construction", function() {
      const membrane = new Membrane();

      let desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
      expect(typeof desc).toBe("object");
      if (!desc)
        return;
      expect(typeof desc.value).toBe("function");
      expect(desc.writable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect(desc.configurable).toBe(false);
    });

    it("cannot be assigned as a non-function value", function() {
      const membrane = new Membrane({passThroughFilter: p});

      let desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
      expect(typeof desc).toBe("object");
      if (!desc)
        return;
      expect(typeof desc.value).toBe("function");
      expect(desc.writable).toBe(false);
      expect(desc.enumerable).toBe(false);
      expect(desc.configurable).toBe(false);
    });

    it("propagates an exception thrown", function() {
      const membrane = new Membrane({
        passThroughFilter: function() {
          throw p;
        }
      });

      const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);
      expect(function() {
        membrane.convertArgumentToProxy(wetHandler, dryHandler, {});
      }).toThrow(p);
    });
  });

  describe("on object graph wrappers", function() {
    let membrane, wetHandler, dryHandler;
    beforeEach(function() {
      membrane = new Membrane();
      wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
      dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);
    });
    afterEach(function() {
      membrane = undefined;
      wetHandler = undefined;
      dryHandler = undefined;
    });

    it("do not wrap objects when returning true from both graphs", function() {
      wetHandler.passThroughFilter = passP;
      dryHandler.passThroughFilter = passP;

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // second time test
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);

      // the other way test
      wrappedP = membrane.convertArgumentToProxy(dryHandler, wetHandler, p);
      expect(wrappedP).toBe(p);

      // back again
      wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });

    it("wrap an object when the target graph handler does not return true", function() {
      wetHandler.passThroughFilter = passP;

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it("wrap an object when the origin graph handler does not return true", function() {
      dryHandler.passThroughFilter = passP;

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it("defers to previously wrapped values", function() {
      let count = 0;
      function passP2(value) {
        count++;
        if ((value === p) && (count > 1))
          return true;
        return false;
      }

      wetHandler.passThroughFilter = passP;
      dryHandler.passThroughFilter = passP2;

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);

      // I could test the reverse case, but it's redundant.
    });

    it(
      "allows a value to be wrapped if the filter returns false in the future (don't do this)",
      function() {
        let count = 0;
        function passP2(value) {
          count++;
          if ((value === p) && (count === 1))
            return true;
          return false;
        }

        wetHandler.passThroughFilter = passP;
        dryHandler.passThroughFilter = passP2;

        let wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(p);

        let proxyToP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        wrappedP = membrane.convertArgumentToProxy(
          wetHandler, dryHandler, p
        );
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it("cannot be replaced more than once", function() {
      expect(wetHandler.mayReplacePassThrough).toBe(true);
      let oldFilter = wetHandler.passThroughFilter;
      wetHandler.passThroughFilter = passP;
      expect(wetHandler.mayReplacePassThrough).toBe(false);

      expect(function() {
        wetHandler.passThroughFilter = oldFilter;
      }).toThrow();
      expect(wetHandler.passThroughFilter).toBe(passP);
    });

    it("cannot be assigned as a non-function value", function() {
      let oldFilter = wetHandler.passThroughFilter;
      expect(function() {
        wetHandler.passThroughFilter = {};
      }).toThrow();

      expect(wetHandler.passThroughFilter).toBe(oldFilter);
    });

    it("propagates an exception thrown", function() {
      wetHandler.passThroughFilter = function() {
        throw p;
      };
      expect(function() {
        membrane.convertArgumentToProxy(wetHandler, dryHandler, {});
      }).toThrow(p);
    });
  });
});
