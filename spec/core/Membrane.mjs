import Membrane from "../../source/core/Membrane.mjs";
import {
  DataDescriptor,
  AccessorDescriptor,
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
import ProxyEntryNotifier from "../../source/core/ProxyEntryNotifier.mjs";

import RevocableMultiMap from "../../source/core/utilities/RevocableMultiMap.mjs";

import {
  expectValueDescriptor,
  expectInstanceDescriptor,
} from "../helpers/expectDataDescriptor.mjs";

import loggerLib from "../helpers/logger.mjs";

describe("Membrane()", () => {
  let membrane;
  beforeEach(() => {
    membrane = new Membrane({ refactor: "0.10" });
  });

  describe("class", () => {
    it("exposes the list of Primordials", () => {
      const desc = Reflect.getOwnPropertyDescriptor(Membrane, "Primordials");
      expectValueDescriptor(Primordials, false, true, false, desc);
    });

    it("exposes the list of allTraps", () => {
      const desc = Reflect.getOwnPropertyDescriptor(Membrane, "allTraps");
      expectValueDescriptor(allTraps, false, true, false, desc);
    });

    it("is frozen", () => {
      expect(Object.isFrozen(Membrane)).toBe(true);
      expect(Object.isFrozen(Membrane.prototype)).toBe(true);
    });
  });

  describe("instance", () => {
    it(".cylinderMap instanceof ProxyCylinderMap", () => {
      const desc = Reflect.getOwnPropertyDescriptor(membrane, "cylinderMap");
      expectInstanceDescriptor(ProxyCylinderMap, false, false, false, desc);
    });

    it(".revokerMultiMap instanceof RevocableMultiMap", () => {
      const desc = Reflect.getOwnPropertyDescriptor(membrane, "revokerMultiMap");
      expectInstanceDescriptor(RevocableMultiMap, false, false, false, desc);
    });

    it(".modifyRules instanceof ModifyRulesAPI", () => {
      const desc = Reflect.getOwnPropertyDescriptor(membrane, "modifyRules");
      expectInstanceDescriptor(ModifyRulesAPI, false, true, false, desc);
    });

    it(".proxyEntryNotifier instanceof ProxyEntryNotifier", () => {
      const desc = Reflect.getOwnPropertyDescriptor(membrane, "proxyEntryNotifier");
      expectInstanceDescriptor(ProxyEntryNotifier, false, true, false, desc);
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

  describe(".convertArgumentToProxy()", () => {
    let wetGraph, dryGraph;
    let proxy, value;

    beforeEach(() => {
      value = { size: 3 };
      wetGraph = membrane.getGraphByName("wet", { mustCreate: true });
      dryGraph = membrane.getGraphByName("dry", { mustCreate: true });
    });

    afterEach(() => {
      wetGraph = null;
      dryGraph = null;
      proxy = null;
    });

    // Jasmine's toEqual matcher interferes with the tests.

    function expectValueAndProxy() {
      let data;
      for (let key of [value, proxy])
      {
        data = membrane.getMembraneValue("wet", key);
        expect(data[0]).toBe(true);
        expect(data[1]).toBe(value);

        data = membrane.getMembraneValue("dry", key);
        expect(data[0]).toBe(true);
        expect(data[1]).toBe(value);

        data = membrane.getMembraneProxy("wet", key);
        expect(data[0]).toBe(true);
        expect(data[1]).toBe(value);

        data = membrane.getMembraneProxy("dry", key);
        expect(data[0]).toBe(true);
        expect(data[1]).toBe(proxy);
      }

      expect(typeof proxy).toBe(typeof value);
      expect(Array.isArray(proxy)).toBe(Array.isArray(value));
    }

    it("creates a proxy from a raw object", () => {
      proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);
      expectValueAndProxy();
    });

    it("creates a proxy from an array", () => {
      value = [];
      proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);

      expectValueAndProxy();
    });

    it("creates a proxy from a function", () => {
      value = function() {};
      proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);

      expectValueAndProxy();
    });

    it("passes through a primitive unchanged", () => {
      value = Symbol("foo");
      expect(membrane.convertArgumentToProxy(wetGraph, dryGraph, value)).toBe(value);

      expect(membrane.getMembraneValue("wet", value)[0]).toBe(false);
      expect(membrane.getMembraneValue("dry", value)[0]).toBe(false);
    });

    it("returns the same value and proxy every time", () => {
      proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);
      expect(membrane.convertArgumentToProxy(wetGraph, dryGraph, value) === proxy).toBe(true);
    });

    it("allows overriding the proxy setting at runtime", () => {
      let proxy2 = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);
      proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value, {override: true});
      expect(proxy === proxy2).toBe(false);

      expectValueAndProxy();
    });

    it("can convert from the proxy to an original value", () => {
      proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);

      expect(membrane.convertArgumentToProxy(dryGraph, wetGraph, proxy)).toBe(value);
    });

    describe("across more than two object graphs", () => {
      let dampGraph;
      beforeEach(() => {
        membrane = new Membrane();
        wetGraph = membrane.getGraphByName("wet", { mustCreate: true });
        dryGraph = membrane.getGraphByName("dry", { mustCreate: true });
        dampGraph = membrane.getGraphByName("damp", { mustCreate: true });
      });

      afterEach(() => {
        dampGraph = null;
      });

      it("converts seamlessly from the origin graph to any graph", () => {
        const dryProxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);
        const dampProxy = membrane.convertArgumentToProxy(wetGraph, dampGraph, value);
        expect(dryProxy === dampProxy).toBe(false);

        expect(dryProxy.size).toBe(3);
        expect(dampProxy.size).toBe(3);

        expect(membrane.convertArgumentToProxy(dryGraph,  wetGraph, dryProxy)).toBe(value);
        expect(membrane.convertArgumentToProxy(dampGraph, wetGraph, dampProxy)).toBe(value);
      });

      it("converts seamlessly from a non-origin graph to any other non-origin graph", () => {
        const dryProxy  = membrane.convertArgumentToProxy(wetGraph, dryGraph,  value);
        expect(dryProxy.size).toBe(3);

        const dampProxy = membrane.convertArgumentToProxy(dryGraph, dampGraph, dryProxy);
        expect(dryProxy === dampProxy).toBe(false);

        expect(dampProxy.size).toBe(3);

        expect(membrane.convertArgumentToProxy(dryGraph,  wetGraph, dryProxy)).toBe(value);
        expect(membrane.convertArgumentToProxy(dampGraph, wetGraph, dampProxy)).toBe(value);
      });
    });
  });

  it(".convertArgumentToProxy() honors the pass-through manager", () => {
    const value = {};
    const passThroughFilter = key => key === value;
    membrane = new Membrane({ refactor: "0.10", passThroughFilter });

    const wetGraph = membrane.getGraphByName("wet", { mustCreate: true });
    const dryGraph = membrane.getGraphByName("dry", { mustCreate: true });

    expect(membrane.convertArgumentToProxy(wetGraph, dryGraph, value)).toBe(value);

    expect(membrane.getMembraneValue("wet", value)[0]).toBe(false);
    expect(membrane.getMembraneValue("dry", value)[0]).toBe(false);
  });

  describe(".bindValuesByHandlers()", () => {
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

    it("accepts when both values are objects unknown to the membrane", function() {
      membrane.bindValuesByHandlers(graphA, values.objA, graphB, values.objB);
      let check = membrane.convertArgumentToProxy(graphB, graphA, values.objB);
      expect(check).toBe(values.objA);

      check = membrane.convertArgumentToProxy(graphA, graphB, check);
      expect(check).toBe(values.objB);
    });

    it("accepts when the same value is passed in for both object graphs", function() {
      membrane.bindValuesByHandlers(graphA, values.objA, graphB, values.objA);
      let check = membrane.convertArgumentToProxy(graphB, graphA, values.objA);
      expect(check).toBe(values.objA);

      check = membrane.convertArgumentToProxy(graphA, graphB, check);
      expect(check).toBe(values.objA);
    });

    it(
      "throws when the first value is an object unknown to the membrane, and the second value is a primitive",
      function() {
        expect(() => {
          membrane.bindValuesByHandlers(graphA, values.objA, graphB, values.str);
        }).toThrowError("bindValuesByHandlers requires two non-primitive values!");
      }
    );

    it(
      "throws when the first value is a primitive, and the second value is an object unknown to the membrane",
      function() {
        expect(() => {
          membrane.bindValuesByHandlers(graphB, values.str, graphA, values.objA);
        }).toThrowError("bindValuesByHandlers requires two non-primitive values!");
      }
    );

    it("throws when both values are primitive", function() {
      expect(function() {
        membrane.bindValuesByHandlers(graphA, values.strA, graphB, "Goodbye");
      }).toThrowError("bindValuesByHandlers requires two non-primitive values!");

      // we can't look up primitives in the membrane.
    });

    it("accepts when both values are known in the correct graph locations", function() {
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
      "accepts when the second value is known to the membrane and the first value is an object",
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

    it("binds to a third object graph holding a proxy", function() {
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

    it("binds to a third object graph holding a raw value", function() {
      graphC = membrane.getGraphByName(graphNames.C, { mustCreate: true });

      membrane.bindValuesByHandlers(graphA, values.objA,
                                    graphB, values.objB);

      membrane.bindValuesByHandlers(graphA, values.objA, graphC, values.objC);

      // ensure graph B and graph C are linked properly
      let check;
      let proxy = membrane.convertArgumentToProxy(graphA, graphC, values.objA);
      expect(proxy).toBe(values.objC);
      check = membrane.convertArgumentToProxy(graphC, graphB, proxy);
      expect(check).toBe(values.objB);

      check = membrane.convertArgumentToProxy(graphB, graphC, proxy);
      expect(check).toBe(values.objC);
    });

    it(
      "throws when a bound object is already defined in the first graph",
      function() {
        membrane.convertArgumentToProxy(
          graphA,
          graphB,
          values.objA
        );

        expect(function() {
          membrane.bindValuesByHandlers(graphA, values.objA, graphB, values.objB);
        }).toThrowError("Value argument does not belong to proposed object graph!");

        // Ensure values.objB is not in the membrane.
        Reflect.ownKeys(graphNames).forEach(function(k) {
          let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
          expect(found).toBe(false);
          void(v);
        });
      }
    );

    it(
      "throws when a bound object is already defined in the second graph",
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
        }).toThrowError("Value argument does not belong to proposed object graph!");

        // Ensure values.objB is not in the membrane.
        Reflect.ownKeys(graphNames).forEach(function(k) {
          let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
          expect(found).toBe(false);
          void(v);
        });
      }
    );

    it(
      "throws when an object is passed in for the wrong object graph",
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
        }).toThrowError("Value argument does not belong to proposed object graph!");

        // Ensure values.objB is not in the membrane.
        Reflect.ownKeys(graphNames).forEach(function(k) {
          let [found, v] = membrane.getMembraneProxy(graphNames[k], values.objB);
          expect(found).toBe(false);
          void(v);
        });
      }
    );

    it("throws when trying to join two sets of object graphs", function() {
      graphC = membrane.getGraphByName(graphNames.C, { mustCreate: true });
      graphD = membrane.getGraphByName(graphNames.D, { mustCreate: true });

      membrane.bindValuesByHandlers(graphA, values.objA,
                                    graphB, values.objB);

      membrane.bindValuesByHandlers(graphC, values.objC,
                                    graphD, values.objD);

      expect(function() {
        membrane.bindValuesByHandlers(graphC, values.objC,
                                      graphA, values.objA);
      }).toThrowError("Linking two object graphs in this way is not safe!");
    });
  });

  describe(".wrapDescriptor() (package)", () => {
    let wetGraph, dryGraph;
    beforeEach(() => {
      wetGraph = membrane.getGraphByName("wet", { mustCreate: true });
      dryGraph = membrane.getGraphByName("dry", { mustCreate: true });
    });
    afterEach(() => {
      wetGraph = null;
      dryGraph = null;
    });

    it("returns undefined when it receives undefined", () => {
      expect(membrane.wrapDescriptor(wetGraph, dryGraph, undefined)).toBe(undefined);
    });

    it("returns an equal data descriptor for a primitive value", () => {
      const desc = new DataDescriptor(Symbol("foo"), false, true, true);
      expect(membrane.wrapDescriptor(wetGraph, dryGraph, desc)).toEqual(desc);
    });

    it("returns a data descriptor with a value from convertArgumentToProxy() for a non-primitive value", () => {
      const value = {};
      const desc = new DataDescriptor(value, true, false, true);
      const proxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, value);

      const wrappedDesc = membrane.wrapDescriptor(wetGraph, dryGraph, desc);
      expect(wrappedDesc.value === proxy).toBe(true);
      expect(wrappedDesc.writable).toBe(desc.writable);
      expect(wrappedDesc.enumerable).toBe(desc.enumerable);
      expect(wrappedDesc.configurable).toBe(desc.configurable);

      const expectedKeys = Reflect.ownKeys(desc);
      const keys = Reflect.ownKeys(wrappedDesc);

      expectedKeys.sort();
      keys.sort();

      expect(keys).toEqual(expectedKeys);
    });

    it("returns an accessor descriptor with proxies for getters and setters", () => {
      const getValue = function() {}, setValue = function() {};

      const getProxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, getValue);
      const setProxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, setValue);
      const desc = new AccessorDescriptor(getValue, setValue, false, true);

      const wrappedDesc = membrane.wrapDescriptor(wetGraph, dryGraph, desc);
      expect(wrappedDesc.get === getProxy).toBe(true);
      expect(wrappedDesc.set === setProxy).toBe(true);
      expect(wrappedDesc.enumerable).toBe(desc.enumerable);
      expect(wrappedDesc.configurable).toBe(desc.configurable);

      const expectedKeys = Reflect.ownKeys(desc);
      const keys = Reflect.ownKeys(wrappedDesc);

      expectedKeys.sort();
      keys.sort();

      expect(keys).toEqual(expectedKeys);
    });
  });

  describe(".warnOnce() (package)", ()=> {
    it("does nothing when there is no logger", () => {
      expect(() => membrane.warnOnce("foo")).not.toThrow();
    });

    it("warns only for the first time it sees a message", () => {
      const logger = loggerLib.getLogger("test.jasmine.logger");
      const appender = new loggerLib.Appender();
      logger.addAppender(appender);

      const membrane = new Membrane({ refactor: "0.10", logger });

      const message = "hello world";
      membrane.warnOnce(message);

      expect(appender.events).toEqual([
        {
          level: "WARN",
          message
        }
      ]);

      membrane.warnOnce(message);

      expect(appender.events).toEqual([
        {
          level: "WARN",
          message
        }
      ]);

      membrane.warnOnce("goodbye");

      expect(appender.events).toEqual([
        {
          level: "WARN",
          message,
        },
        {
          level: "WARN",
          message: "goodbye",
        }
      ]);
    });
  });

  describe("graph's .revokeEverything()", () => {
    beforeEach(() => membrane = new Membrane({}));

    let dryGraph, wetGraph, wetObject, wetProxy, dryObject, dryProxy;
    beforeEach(() => {
      wetGraph = membrane.getGraphByName("wet", { mustCreate: true });
      dryGraph = membrane.getGraphByName("dry", { mustCreate: true });
  
      wetObject = { value: true };
      dryProxy = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetObject);
  
      dryObject = { value: false };
      wetProxy = membrane.convertArgumentToProxy(dryGraph, wetGraph, dryObject);
    });

    it("allows revoking wet before dry", () => {
      wetGraph.revokeEverything();
      dryGraph.revokeEverything();

      expect(() => dryProxy.value).toThrow();
      expect(() => wetProxy.value).toThrow();
    });
  
    it("allows revoking dry before wet", () => {
      dryGraph.revokeEverything();
      wetGraph.revokeEverything();
  
      expect(() => dryProxy.value).toThrow();
      expect(() => wetProxy.value).toThrow();
    });
  });
});
