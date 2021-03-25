import Membrane from "../../source/core/Membrane.mjs";
import {
  NOT_YET_DETERMINED,
  Primordials,
  allTraps,
  returnFalse,
} from "../../source/core/utilities/shared.mjs";

import {
  ProxyCylinder,
  ProxyCylinderMap,
} from "../../source/core/ProxyCylinder.mjs";

import ModifyRulesAPI from "../../source/core/ModifyRulesAPI.mjs";

import RevocableMultiMap from "../../source/core/utilities/RevocableMultiMap.mjs";

import {
  expectValueDescriptor,
  expectInstanceDescriptor,
} from "../helpers/expectDataDescriptor.mjs";

describe("Membrane()", () => {
  let membrane;
  beforeEach(() => {
    membrane = new Membrane();
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
      expect(membrane.hasProxyForValue({}, {})).toBe(false);
    });

    // this happens when we are looking for a value's proxy in another graph
    it("returns false for a known value but not a known graph", () => {
      const map = membrane.cylinderMap;
      const cylinder = new ProxyCylinder;
      const value = {};
      map.set(value, cylinder);

      expect(membrane.hasProxyForValue("wet", value)).toBe(false);
    });

    it("returns false for a known graph with its origin value", () => {
      const cylinder = new ProxyCylinder("wet");
      const value = {};

      cylinder.setMetadata(membrane, "wet", {
        storeAsValue: true,
        value,
      });

      expect(membrane.hasProxyForValue("wet", value)).toBe(true);
    });
  });

  describe(".getMembraneValue()", () => {
    it("returns false for any unknown value", () => {
      expect(membrane.getMembraneValue({}, {})).toEqual([
        false,
        NOT_YET_DETERMINED
      ]);
    });
  });

  describe(".getMembraneProxy()", () => {
    it("returns false for any unknown value", () => {
      expect(membrane.getMembraneProxy({}, {})).toEqual([
        false,
        NOT_YET_DETERMINED
      ]);
    });
  });

  xdescribe(".addPartsToCylinder() (package method)", () => {

  });

  xdescribe(".hasHandlerByGraph()", () => {

  });

  xdescribe(".getHandlerByName()", () => {

  });

  xdescribe(".ownsHandler()", () => {

  });

  xdescribe(".passThroughFilter", () => {

  });

  xdescribe(".convertArgumentToProxy()", () => {

  });

  xdescribe(".bindValuesByHandlers()", () => {

  });

  xdescribe(".wrapDescriptor() (package)", () => {

  });

  xdescribe(".warnOnce() (package)", ()=> {

  });

  describe("handler's .revokeEverything()", () => {
    let dryHandler, wetHandler, wetObject, wetProxy, dryObject, dryProxy;
    beforeEach(() => {
      wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
      dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });
  
      wetObject = { value: true };
      dryProxy = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetObject);
  
      dryObject = { value: false };
      wetProxy = membrane.convertArgumentToProxy(dryHandler, wetHandler, dryObject);
    });

    xit("more unit tests", () => {});

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
