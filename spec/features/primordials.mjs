import Membrane from "../../source/core/Membrane.mjs"

const topValues = [
  /* explicitly testing for prototypes passing through */
  Object.prototype, Function.prototype, Array.prototype,
  /* testing common primordials as well */
  Object, Function, Array, Date, Map, Set, WeakMap, WeakSet
];
const pSet = new Set(Membrane.Primordials);
const passThrough = pSet.has.bind(pSet);

const MUSTCREATE = Object.freeze({ mustCreate: true });
const CREATE_WITH_PASSTHROUGH = Object.freeze({mustCreate: true, passThroughFilter: passThrough});

describe("Primordial values", function() {

  it("are available on the Membrane as a frozen array", function() {
    expect(Array.isArray(Membrane.Primordials)).toBe(true);
    expect(Object.isFrozen(Membrane.Primordials)).toBe(true);
    {
      let desc = Reflect.getOwnPropertyDescriptor(Membrane, "Primordials");
      expect(desc.writable).toBe(false);
      expect(desc.configurable).toBe(false);
    }

    if (!Array.isArray(Membrane.Primordials))
      return;

    topValues.forEach(function(k) {
      expect(Membrane.Primordials.includes(k)).toBe(true);
    });
  });

  it("can pass through all object graphs, if requested", function() {
    const membrane = new Membrane({passThroughFilter: passThrough});
    const wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
    const dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });

    let wetObj = {};
    let dryObj = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetObj);
    expect(dryObj).not.toBe(wetObj);
  });

  it("can pass through specific object graphs, if requested", function() {
    const membrane = new Membrane();
    const wetHandler = membrane.getGraphByName("wet", CREATE_WITH_PASSTHROUGH);
    const dryHandler = membrane.getGraphByName("dry", CREATE_WITH_PASSTHROUGH);

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });
  });

  xit("are available through DistortionsListener instances", function() {
    const membrane = new Membrane();
    const wetHandler = membrane.getGraphByName("wet", MUSTCREATE);
    const dryHandler = membrane.getGraphByName("dry", MUSTCREATE);

    let wetDL = membrane.modifyRules.createDistortionsListener();
    wetDL.ignorePrimordials();
    wetDL.bindToHandler(wetHandler);

    let dryDL = membrane.modifyRules.createDistortionsListener();
    dryDL.ignorePrimordials();
    dryDL.bindToHandler(dryHandler);

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });
  });
});