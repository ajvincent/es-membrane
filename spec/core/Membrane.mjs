import Membrane from "../../source/core/Membrane.mjs";

describe("Membrane()", () => {
  let membrane;
  beforeEach(() => {
    membrane = new Membrane();
  });

  /* These tests are going to rely heavily on jasmine.spyOnProperty(),
     jasmine.spyOn(), and the .and.callThrough() methods of spies.

     We have to intervene in the behaviors of the other objects in the
     membrane a lot to get this unit-tested.
  */

  xdescribe("class", () => {
    it("exposes the list of Primordials", () => {

    });

    it("exposes the list of allTraps", () => {

    });
  });

  xdescribe("has all the initial properties:", () => {

  });

  xdescribe(".hasProxyForValue()", () => {

  });

  xdescribe(".getMembraneValue()", () => {

  });

  xdescribe(".getMembraneProxy()", () => {

  });

  xdescribe(".addPartsToCylinder()", () => {

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

  xdescribe(".wrapDescriptor()", () => {

  });

  xdescribe(".warnOnce()", ()=> {

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
