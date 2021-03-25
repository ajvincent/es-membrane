import Membrane from "../../source/core/Membrane.mjs";
import {
  NOT_YET_DETERMINED,
  Primordials,
  allTraps,
  returnFalse,
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

    describe(".passThroughFilter", () => {
      it("defaults to returnFalse", () => {
        const desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
        expectValueDescriptor(returnFalse, false, false, false, desc);
      });

      it("is returnFalse when the option isn't a function", () => {
        membrane = new Membrane({passThroughFilter: {}});

        const desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
        expectValueDescriptor(returnFalse, false, false, false, desc);
      });

      it("is adopted from the option when the option is a function", () => {
        const passThroughFilter = () => true;
        membrane = new Membrane({passThroughFilter});

        const desc = Reflect.getOwnPropertyDescriptor(membrane, "passThroughFilter");
        expectValueDescriptor(passThroughFilter, false, false, false, desc);
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

  xdescribe(".ownsGraph()", () => {

  });

  xdescribe(".addPartsToCylinder() (package method)", () => {

  });

  xit(".passThroughFilter", () => {
    // Remember to apply ObjectGraphHandler's passThroughFilter changes to Membrane.
  });

  xdescribe(".convertArgumentToProxy()", () => {

  });

  xdescribe(".bindValuesByHandlers()", () => {

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
