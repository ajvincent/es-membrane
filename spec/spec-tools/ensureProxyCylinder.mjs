import ensureProxyCylinder from "../helpers/ensureProxyCylinder.mjs";

describe("ensureProxyCylinder tool works", () => {
  let handler;
  const target = {};

  beforeEach(() => {
    handler = {
      membrane: jasmine.createSpyObj("membrane", [
        "hasProxyForValue",
        "addPartsToCylinder"
      ]),
      graphName: "wet",
    };
  });

  it("when the membrane doesn't have the value initially", () => {
    handler.membrane.hasProxyForValue.and.returnValue(false);

    ensureProxyCylinder(handler, target);

    expect(handler.membrane.hasProxyForValue).toHaveBeenCalledOnceWith("wet", target);
    expect(handler.membrane.addPartsToCylinder).toHaveBeenCalledOnceWith(handler, target);
  });

  it("when the membrane has the value initially", () => {
    handler.membrane.hasProxyForValue.and.returnValue(true);

    ensureProxyCylinder(handler, target);

    expect(handler.membrane.hasProxyForValue).toHaveBeenCalledOnceWith("wet", target);
    expect(handler.membrane.addPartsToCylinder).toHaveBeenCalledTimes(0);
  });
});
