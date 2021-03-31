import Membrane from "../../source/core/Membrane.mjs";
import {
  NOT_YET_DETERMINED,
  Primordials,
  allTraps,
} from "../../source/core/utilities/shared.mjs";

import {
  ProxyCylinderMap,
} from "../../source/core/ProxyCylinder.mjs";

import ModifyRulesAPI from "../../source/core/ModifyRulesAPI.mjs";
import ObjectGraphHandler from "../../source/core/ObjectGraphHandler-old.mjs";
import ObjectGraph from "../../source/core/ObjectGraph.mjs";

import RevocableMultiMap from "../../source/core/utilities/RevocableMultiMap.mjs";

import {
  expectValueDescriptor,
  expectInstanceDescriptor,
} from "../helpers/expectDataDescriptor.mjs";

describe("Membrane()", () => {
  let membrane;
  beforeEach(() => {
    membrane = new Membrane({ refactor: "0.10" });
  });

  /* We have to intervene in the behaviors of the other objects in the
     membrane a lot to get this unit-tested.
  */

  describe("class", () => {
    it("exposes the list of Primordials", () => {
      const desc = Reflect.getOwnPropertyDescriptor(Membrane, "Primordials");
      expectValueDescriptor(Primordials, false, true, false, desc);
    });

    it("exposes the list of allTraps", () => {
      const desc = Reflect.getOwnPropertyDescriptor(Membrane, "allTraps");
      expectValueDescriptor(allTraps, false, true, false, desc);
    });

    it("is sealed", () => {
      expect(Object.isSealed(Membrane)).toBe(true);
    });
  });

  describe("has all the initial package properties:", () => {
    it(".cylinderMap instanceof ProxyCylinderMap", () => {
      const desc = Reflect.getOwnPropertyDescriptor(membrane, "cylinderMap");
      expectInstanceDescriptor(ProxyCylinderMap, false, false, false, desc);
    });

    it(".revokerMultiMap instanceof RevocableMultiMap", () => {
      const desc = Reflect.getOwnPropertyDescriptor(membrane, "revokerMultiMap");
      expectInstanceDescriptor(RevocableMultiMap, false, false, false, desc);
    });

    describe(".logger", () => {
      it(".logger defaults to null", () => {
        const desc = Reflect.getOwnPropertyDescriptor(membrane, "logger");
        expectValueDescriptor(null, false, false, false, desc);
      });

      it("can be whatever we pass in at construction", () => {
        const logger = {};
        membrane = new Membrane({logger});

        const desc = Reflect.getOwnPropertyDescriptor(membrane, "logger");
        expectValueDescriptor(logger, false, false, false, desc);
      });
    });
  });

  it("has the initial public property .modifyRules", () => {
    const desc = Reflect.getOwnPropertyDescriptor(membrane, "modifyRules");
    expectInstanceDescriptor(ModifyRulesAPI, false, true, false, desc);
  });

  describe(".hasProxyForValue()", () => {
    it("returns false for any unknown value", () => {
      expect(membrane.hasProxyForValue("wet", {})).toBe(false);
    });

    // this happens when we are looking for a value's proxy in another graph
    it("returns false for a known value but not a known graph", () => {
      const map = membrane.cylinderMap;
      const cylinder = map.buildCylinder("wet");
      const value = {};
      map.set(value, cylinder);

      expect(membrane.hasProxyForValue("dry", value)).toBe(false);
    });

    it("returns true for a known graph with its origin value", () => {
      const cylinder = membrane.cylinderMap.buildCylinder("wet");
      const value = {};

      cylinder.setMetadata("wet", {
        storeAsValue: true,
        value,
      });

      expect(membrane.hasProxyForValue("wet", value)).toBe(true);
    });

    it("returns true for all known graphs and the original value, proxies and shadow targets", () => {
      const cylinder = membrane.cylinderMap.buildCylinder("wet");
      const value = {};

      cylinder.setMetadata("wet", {
        storeAsValue: true,
        value,
      });

      expect(membrane.hasProxyForValue("wet", value)).toEqual(true);

      const proxy = {}, shadowTarget = {};

      cylinder.setMetadata("dry", {
        storeAsValue: false,
        proxy,
        shadowTarget,
      });

      for (let graph of ["wet", "dry"]) {
        for (let key of [proxy, shadowTarget, value]) {
          expect(membrane.hasProxyForValue(graph, key)).toEqual(true);
        }
      }
    });
  });

  describe(".getMembraneValue() (package method)", () => {
    it("returns [false, NOT_YET_DETERMINED] for any unknown value", () => {
      expect(membrane.getMembraneValue("wet", {})).toEqual([
        false,
        NOT_YET_DETERMINED
      ]);
    });

    // this happens when we are looking for a value's proxy in another graph
    it("returns [false, NOT_YET_DETERMINED] for a known value but not a known graph", () => {
      const map = membrane.cylinderMap;
      const cylinder = map.buildCylinder("wet");
      const value = {};
      map.set(value, cylinder);

      expect(membrane.getMembraneValue("dry", value)).toEqual([
        false,
        NOT_YET_DETERMINED
      ]);
    });

    it("returns [true, value] for all known graphs and the original value, proxies and shadow targets", () => {
      const cylinder = membrane.cylinderMap.buildCylinder("wet");
      const value = {};

      cylinder.setMetadata("wet", {
        storeAsValue: true,
        value,
      });

      const expected = [
        true,
        value
      ];

      expect(membrane.getMembraneValue("wet", value)).toEqual(expected);

      const proxy = {}, shadowTarget = {};

      cylinder.setMetadata("dry", {
        storeAsValue: false,
        proxy,
        shadowTarget,
      });

      for (let graph of ["wet", "dry"]) {
        for (let key of [proxy, shadowTarget, value]) {
          expect(membrane.getMembraneValue(graph, key)).toEqual(expected);
        }
      }
    });
  });

  describe(".getMembraneProxy()", () => {
    it("returns false for any unknown value", () => {
      expect(membrane.getMembraneProxy({}, {})).toEqual([
        false,
        NOT_YET_DETERMINED
      ]);
    });

    it("returns [false, NOT_YET_DETERMINED] for a known value but not a known graph", () => {
      const map = membrane.cylinderMap;
      const cylinder = map.buildCylinder("wet");
      const value = {};
      map.set(value, cylinder);

      expect(membrane.getMembraneProxy("dry", value)).toEqual([
        false,
        NOT_YET_DETERMINED
      ]);
    });

    it("returns [true, value or proxy] for all known graphs and the original value, proxies and shadow targets", () => {
      const cylinder = membrane.cylinderMap.buildCylinder("wet");
      const value = {};

      cylinder.setMetadata("wet", {
        storeAsValue: true,
        value,
      });

      const expectedValue = [
        true,
        value
      ];

      expect(membrane.getMembraneProxy("wet", value)).toEqual(expectedValue);

      const proxy = {}, shadowTarget = {};
      const expectedProxy = [
        true,
        proxy
      ];

      cylinder.setMetadata("dry", {
        storeAsValue: false,
        proxy,
        shadowTarget,
      });

      for (let key of [proxy, shadowTarget, value]) {
        expect(membrane.getMembraneProxy("wet", key)).toEqual(expectedValue);
        expect(membrane.getMembraneProxy("dry", key)).toEqual(expectedProxy);
      }
    });
  });

  describe(".getGraphByName()", () => {
    it("returns null for an unknown name", () => {
      expect(membrane.getGraphByName("wet")).toBe(null);
    });

    describe("for legacy ObjectGraphHandler", () => {
      let membrane, handler;
      beforeEach(() => {
        membrane = new Membrane({});
        handler = membrane.getGraphByName("wet", { mustCreate: true });
      });
      it("returns an instance of ObjectGraphHandler for a new name and {mustCreate: true}", () => {
        expect(handler instanceof ObjectGraphHandler).toBe(true);
        expect(handler.membrane).toBe(membrane);
        expect(handler.graphName).toBe("wet");
      });

      it("returns the same ObjectGraphHandler for the same name", () => {
        let handler2 = membrane.getGraphByName("wet");
        expect(handler2).toBe(handler);

        handler2 = membrane.getGraphByName("wet", { mustCreate: true });
        expect(handler2).toBe(handler);
      });

      it("returns a different ObjectGraphHandler for a different name", () => {
        let handler2 = membrane.getGraphByName("dry");
        expect(handler2).toBe(null);

        handler2 = membrane.getGraphByName("dry", { mustCreate: true });
        expect(handler2).not.toBe(handler);

        expect(handler2 instanceof ObjectGraphHandler).toBe(true);
        expect(handler2.membrane).toBe(membrane);
        expect(handler2.graphName).toBe("dry");
      });

      it("returns an ObjectGraphHandler for a symbol name", () => {
        const NAME = Symbol("damp");
        let handler2 = membrane.getGraphByName(NAME);
        expect(handler2).toBe(null);

        handler2 = membrane.getGraphByName(NAME, { mustCreate: true });
        expect(handler2).not.toBe(handler);

        expect(handler2 instanceof ObjectGraphHandler).toBe(true);
        expect(handler2.membrane).toBe(membrane);
        expect(handler2.graphName).toBe(NAME);
      });

      it("throws for a non-string, non-symbol name", () => {
        expect(() => {
          membrane.getGraphByName(null);
        }).toThrowError("graphName must be a string or a symbol!");

        expect(() => {
          membrane.getGraphByName(null, { mustCreate: true });
        }).toThrowError("graphName must be a string or a symbol!");
      });
    });

    describe("for ObjectGraph", () => {
      let handler;
      beforeEach(() => {
        handler = membrane.getGraphByName("wet", { mustCreate: true });
      });

      it("returns an instance of ObjectGraph for a new name and {mustCreate: true}", () => {
        expect(handler instanceof ObjectGraph).toBe(true);
        expect(handler.membrane).toBe(membrane);
        expect(handler.graphName).toBe("wet");
      });

      it("returns the same ObjectGraph for the same name", () => {
        let handler2 = membrane.getGraphByName("wet");
        expect(handler2).toBe(handler);

        handler2 = membrane.getGraphByName("wet", { mustCreate: true });
        expect(handler2).toBe(handler);
      });

      it("returns a different ObjectGraph for a different name", () => {
        let handler2 = membrane.getGraphByName("dry");
        expect(handler2).toBe(null);

        handler2 = membrane.getGraphByName("dry", { mustCreate: true });
        expect(handler2).not.toBe(handler);

        expect(handler2 instanceof ObjectGraph).toBe(true);
        expect(handler2.membrane).toBe(membrane);
        expect(handler2.graphName).toBe("dry");
      });

      it("returns an ObjectGraph for a symbol name", () => {
        const NAME = Symbol("damp");
        let handler2 = membrane.getGraphByName(NAME);
        expect(handler2).toBe(null);

        handler2 = membrane.getGraphByName(NAME, { mustCreate: true });
        expect(handler2).not.toBe(handler);

        expect(handler2 instanceof ObjectGraph).toBe(true);
        expect(handler2.membrane).toBe(membrane);
        expect(handler2.graphName).toBe(NAME);
      });

      it("throws for a non-string, non-symbol name", () => {
        expect(() => {
          membrane.getGraphByName(null);
        }).toThrowError("graphName must be a string or a symbol!");

        expect(() => {
          membrane.getGraphByName(null, { mustCreate: true });
        }).toThrowError("graphName must be a string or a symbol!");
      });
    });
  });

  describe(".ownsGraph() (package method)", () => {
    it("returns false for something that is not an ObjectGraph", () => {
      expect(membrane.ownsGraph({})).toBe(false);
    });

    it("returns true for a known object graph it owns", () => {
      const handler = membrane.getGraphByName("wet", { mustCreate: true });
      expect(membrane.ownsGraph(handler)).toBe(true);
    });
  });

  xdescribe(".convertArgumentToProxy()", () => {

  });

  describe(".bindValuesByHandlers()", () => {
    beforeEach(() => {
      membrane = new Membrane({});
    });

    xit("for ObjectGraph", () => {});

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

    let graphA, graphB, graphC, graphD;
    beforeEach(function() {
      graphA = membrane.getGraphByName(graphNames.A, { mustCreate: true });
      graphB = membrane.getGraphByName(graphNames.B, { mustCreate: true });
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
        graphC = membrane.getGraphByName(graphNames.C, { mustCreate: true });
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
      graphC = membrane.getGraphByName(graphNames.C, { mustCreate: true });
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
        graphC = membrane.getGraphByName(graphNames.C, { mustCreate: true });
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
      graphC = membrane.getGraphByName(graphNames.C, { mustCreate: true });
      graphD = membrane.getGraphByName(graphNames.D, { mustCreate: true });

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

  xdescribe(".wrapDescriptor() (package)", () => {

  });

  xdescribe(".warnOnce() (package)", ()=> {

  });

  describe("graph's .revokeEverything()", () => {
    beforeEach(() => membrane = new Membrane({}));

    let dryHandler, wetHandler, wetObject, wetProxy, dryObject, dryProxy;
    beforeEach(() => {
      wetHandler = membrane.getGraphByName("wet", { mustCreate: true });
      dryHandler = membrane.getGraphByName("dry", { mustCreate: true });
  
      wetObject = { value: true };
      dryProxy = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetObject);
  
      dryObject = { value: false };
      wetProxy = membrane.convertArgumentToProxy(dryHandler, wetHandler, dryObject);
    });

    it("allows revoking wet before dry", () => {
      wetHandler.revokeEverything();
      dryHandler.revokeEverything();

      expect(() => dryProxy.value).toThrow();
      expect(() => wetProxy.value).toThrow();
    });
  
    it("allows revoking dry before wet", () => {
      dryHandler.revokeEverything();
      wetHandler.revokeEverything();
  
      expect(() => dryProxy.value).toThrow();
      expect(() => wetProxy.value).toThrow();
    });
  });
});
