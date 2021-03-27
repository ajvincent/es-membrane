import Membrane from "../../source/core/Membrane.mjs"

const p = {};
function passP(value) {
  if (value === p)
    return true;
  return false;
}

const MUSTCREATE = Object.freeze({ mustCreate: true });
const CREATE_WITH_PASSP = Object.freeze({ mustCreate: true, passThroughFilter: passP });

describe("Pass-through filters", function() {
  describe("on the membrane", function() {
    it("do not wrap objects when returning true", function() {
      const membrane = new Membrane({passThroughFilter: passP});
      const wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
      const dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

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
      const dampHandler = membrane.getGraphByName(
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
      const wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
      const dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it("force wrapping when the membrane filter returns false and there are no graph filters",
       function() {
        const membrane = new Membrane({passThroughFilter: () => false});
        const wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
        const dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

        let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
        expect(proxyToP).not.toBe(p);
        expect(typeof proxyToP).toBe("object");

        let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
        expect(wrappedP).toBe(proxyToP);
      }
    );

    it("propagates an exception thrown", function() {
      const membrane = new Membrane({
        passThroughFilter: function() {
          throw p;
        }
      });

      const wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
      const dryHandler = membrane.getGraphByName("dry", MUSTCREATE);
      expect(function() {
        membrane.convertArgumentToProxy(wetHandler, dryHandler, {});
      }).toThrow(p);
    });
  });

  describe("on object graph wrappers", function() {
    let membrane, wetHandler, dryHandler;
    beforeEach(function() {
      membrane = new Membrane();
    });
    afterEach(function() {
      membrane = undefined;
      wetHandler = undefined;
      dryHandler = undefined;
    });

    it("do not wrap objects when returning true from both graphs", function() {
      wetHandler = membrane.getGraphByName("wet", CREATE_WITH_PASSP);
      dryHandler = membrane.getGraphByName("dry", CREATE_WITH_PASSP);

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
      wetHandler = membrane.getGraphByName("wet", CREATE_WITH_PASSP);
      dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);
    });

    it("wrap an object when the origin graph handler does not return true", function() {
      wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
      dryHandler = membrane.getGraphByName("dry", CREATE_WITH_PASSP);

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

      wetHandler = membrane.getGraphByName("wet", CREATE_WITH_PASSP);
      dryHandler = membrane.getGraphByName("dry", { mustCreate: true, passThroughFilter: passP2});

      let proxyToP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(proxyToP).not.toBe(p);
      expect(typeof proxyToP).toBe("object");

      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(proxyToP);

      // I could test the reverse case, but it's redundant.
    });


    it("propagates an exception thrown", function() {
      wetHandler = membrane.getGraphByName("wet", {
        mustCreate: true,
        passThroughFilter: function() {
          throw p;
        }
      });
      dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

      expect(function() {
        membrane.convertArgumentToProxy(wetHandler, dryHandler, {});
      }).toThrow(p);
    });
  });
});
