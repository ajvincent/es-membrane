import Membrane from "../../source/core/Membrane.mjs"

describe("Binding two values manually", function() {
  // I'm not using the mocks here, since the concept is simple.
  const graphNames = {
    A: Symbol("A"),
    B: Symbol("B"),
    C: Symbol("C"),
    D: Symbol("D")
  };

  const values = {
    objA: { name: "objA" },
    objB: { name: "objB" },
    objC: { name: "objC" },
    objD: { name: "objD" },

    str: "values.str"
  };

  var membrane, graphA, graphB, graphC, graphD;
  beforeEach(function() {
    membrane = new Membrane();
    graphA = membrane.getHandlerByName(graphNames.A, { mustCreate: true });
    graphB = membrane.getHandlerByName(graphNames.B, { mustCreate: true });
  });
  afterEach(function() {
    graphA.revokeEverything();
    graphA = null;
    graphB.revokeEverything();
    graphB = null;

    if (graphC) {
      graphC.revokeEverything();
      graphC = null;
    }

    if (graphD) {
      graphD.revokeEverything();
      graphD = null;
    }

    membrane = null;
  });

  it("when both values are objects unknown to the membrane", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);
  });

  it("when the same value is passed in for both object graphs", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objA);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objA);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objA);
  });

  it(
    "when the first value is an object unknown to the membrane, and the second value is a primitive",
    function() {
      membrane.bindValuesByHandlers(graphA, values.objA,
                                    graphB, values.str);
      let check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
      expect(check).toBe(values.str);
    }
  );

  it(
    "when the first value is a primitive, and the second value is an object unknown to the membrane",
    function() {
      membrane.bindValuesByHandlers(graphB, values.str,
                                    graphA, values.objA);
      let check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
      expect(check).toBe(values.str);
    }
  );

  it("when both values are known in the correct graph locations", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);

    // Rerunning to make sure a theoretical no-op actually is a no-op.
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);
  });

  it(
    "when the second value is known to the membrane and the first value is an object",
    function() {
      graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
      membrane.bindValuesByHandlers(graphC, values.objC,
                                    graphB, values.objB);
      membrane.bindValuesByHandlers(graphA, values.objA,
                                    graphB, values.objB);
      let check;

      check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
      expect(check).toBe(values.objA);

      check = membrane.convertArgumentToProxy(graphC, graphA, values.objC);
      expect(check).toBe(values.objA);

      check = membrane.convertArgumentToProxy(graphC, graphB, values.objC);
      expect(check).toBe(values.objB);

      check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
      expect(check).toBe(values.objB);

      check = membrane.convertArgumentToProxy(graphB, graphC, values.objB);
      expect(check).toBe(values.objC);

      check = membrane.convertArgumentToProxy(graphA, graphC, values.objA);
      expect(check).toBe(values.objC);
    }
  );

  it("to a third object graph holding a proxy", function() {
    graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
    let objC = membrane.convertArgumentToProxy(
      graphA,
      graphC,
      values.objA
    );

    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphA, graphB, values.objA);
    expect(check).toBe(values.objB);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);

    // ensure graph B and graph C are linked properly
    let proxy = membrane.convertArgumentToProxy(graphA, graphC, values.objA);
    expect(proxy).toBe(objC);
    check = membrane.convertArgumentToProxy(graphC, graphB, proxy);
    expect(check).toBe(values.objB);

    check = membrane.convertArgumentToProxy(graphB, graphC, proxy);
    expect(check).toBe(objC);
  });

  it("when both values are objects in the membrane works", function() {
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);

    // checking for a no-op
    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);
    let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
    expect(check).toBe(values.objA);

    check = membrane.convertArgumentToProxy(graphA, graphB, check);
    expect(check).toBe(values.objB);
  });

  it(
    "fails when an object is already defined in the first graph",
    function() {
      membrane.convertArgumentToProxy(
        graphA,
        graphB,
        values.objA
      );

      expect(function() {
        membrane.bindValuesByHandlers(graphA, values.objA,
                                      graphB, values.objB);
      }).toThrow();

      // Ensure values.objB is not in the membrane.
      Reflect.ownKeys(graphNames).forEach(function(k) {
        let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
        expect(found).toBe(false);
        void(v);
      });
    }
  );

  it(
    "fails when an object is already defined in the second graph",
    function() {
      membrane.convertArgumentToProxy(
        graphA,
        graphB,
        values.objA
      );

      // XXX ajvincent Possibly throwing the wrong exception?
      expect(function() {
        membrane.bindValuesByHandlers(graphB, values.objB,
                                      graphA, values.objA);
      }).toThrow();

      // Ensure values.objB is not in the membrane.
      Reflect.ownKeys(graphNames).forEach(function(k) {
        let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
        expect(found).toBe(false);
        void(v);
      });
    }
  );

  it(
    "fails when an object is passed in for the wrong object graph",
    function() {
      graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
      membrane.convertArgumentToProxy(
        graphA,
        graphC,
        values.objA
      );

      expect(function() {
        membrane.bindValuesByHandlers(graphC, values.objA,
                                      graphB, values.objB);
      }).toThrow();

      // Ensure values.objB is not in the membrane.
      Reflect.ownKeys(graphNames).forEach(function(k) {
        let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
        expect(found).toBe(false);
        void(v);
      });
    }
  );

  it("fails when both values are primitive", function() {
    expect(function() {
      membrane.bindValuesByHandlers(graphA, values.strA,
                                    graphB, "Goodbye");
    }).toThrow();

    // we can't look up primitives in the membrane.
  });

  it("fails when trying to join two sets of object graphs", function() {
    graphC = membrane.getHandlerByName(graphNames.C, { mustCreate: true });
    graphD = membrane.getHandlerByName(graphNames.D, { mustCreate: true });

    membrane.bindValuesByHandlers(graphA, values.objA,
                                  graphB, values.objB);

    membrane.bindValuesByHandlers(graphC, values.objC,
                                  graphD, values.objD);

    expect(function() {
      membrane.bindValuesByHandlers(graphC, values.objC,
                                    graphA, values.objA);
    }).toThrow();
  });
});
