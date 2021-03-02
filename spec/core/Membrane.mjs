import Membrane from "../../source/core/Membrane.mjs";

describe("Membrane allows multiple revocations", () => {
  let membrane, dryHandler, wetHandler, wetObject, wetProxy, dryObject, dryProxy;
  beforeEach(() => {
    membrane = new Membrane();
    wetHandler = membrane.getHandlerByName("wet", { mustCreate: true });
    dryHandler = membrane.getHandlerByName("dry", { mustCreate: true });

    wetObject = { value: true };
    dryProxy = membrane.convertArgumentToProxy(wetHandler, dryHandler, wetObject);

    dryObject = { value: false };
    wetProxy = membrane.convertArgumentToProxy(dryHandler, wetHandler, dryObject);
  });

  it("revoking wet before dry", () => {
    wetHandler.revokeEverything();
    dryHandler.revokeEverything();

    expect(() => dryProxy.value).toThrow();
    expect(() => wetProxy.value).toThrow();
  });

  it("revoking dry before wet", () => {
    dryHandler.revokeEverything();
    wetHandler.revokeEverything();

    expect(() => dryProxy.value).toThrow();
    expect(() => wetProxy.value).toThrow();
  });
});
