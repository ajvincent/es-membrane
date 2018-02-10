if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("Primordial values", function() {
  "use strict";
  const MUSTCREATE = Object.freeze({ mustCreate: true });
  const topValues = [
    /* explicitly testing for prototypes passing through */
    Object.prototype, Function.prototype, Array.prototype,
    /* testing common primordials as well */
    Object, Function, Array, Date, Map, Set, WeakMap, WeakSet
  ];
  function passThrough() {
    const pSet = new Set(Membrane.Primordials);
    return pSet.has;
  }

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
    const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
    const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });
  });

  it("can pass through specific object graphs, if requested", function() {
    const membrane = new Membrane();
    const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
    const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

    wetHandler.passThroughFilter = passThrough;
    dryHandler.passThroughFilter = passThrough;

    topValues.forEach(function(p) {
      let wrappedP = membrane.convertArgumentToProxy(wetHandler, dryHandler, p);
      expect(wrappedP).toBe(p);
    });
  });

  it("are available through DistortionsListener instances", function() {
    const membrane = new Membrane();
    const wetHandler = membrane.getHandlerByName("wet", MUSTCREATE);
    const dryHandler = membrane.getHandlerByName("dry", MUSTCREATE);

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
