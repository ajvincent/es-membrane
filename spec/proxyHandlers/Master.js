if ((typeof DataDescriptor != "function") ||
    (typeof isDataDescriptor != "function") ||
    !Array.isArray(allTraps)) {
  if (typeof require == "function") {
    let obj = require("../../docs/dist/node/utilities.js");
    DataDescriptor = obj.DataDescriptor;
    isDataDescriptor = obj.isDataDescriptor;
    allTraps = obj.allTraps;
  }
  else
    throw new Error("Unable to run tests: cannot get DataDescriptor");
}

if (typeof MembraneProxyHandlers != "object") {
  if (typeof require == "function") {
    var { MembraneProxyHandlers } = require("../../docs/dist/node/proxyHandlers.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneProxyHandlers");
}

describe("MembraneProxyHandlers.Master proxy handler", function() {
  "use strict";
  let handler = null, proxy = null, revoke = null, shadow = null, mirror = null;
  beforeEach(function() {
    shadow = {};
    mirror = {};
    handler = new MembraneProxyHandlers.Master({membrane: null});
    let obj = Proxy.revocable(shadow, handler);
    proxy = obj.proxy;
    revoke = obj.revoke;
  });

  afterEach(function() {
    handler = null;
    shadow = null;
    mirror = null;
    if (revoke)
      revoke();
    revoke = null;
    proxy = null;
  });

  it("inherits from MembraneProxyHandlers.LinkedList", function() {
    expect(handler instanceof MembraneProxyHandlers.LinkedList).toBe(true);
  });

  describe("cannot override its traps: ", function() {
    const dummy = function() {};
    allTraps.forEach((trap) => {
      it(trap, function() {
        expect(Reflect.hasOwnProperty(handler, trap)).toBe(false);
        expect(Reflect.defineProperty(
          handler, trap, {
            value: dummy,
            writable: false,
            enumerable: false,
            configurable: false
          }
        )).toBe(false);
        expect(handler[trap]).toBe(MembraneProxyHandlers.LinkedList.prototype[trap]);
      });
    });
  });

  it("cannot insert a new handler at the top level", function() {
    let msg = null;
    try {
      handler.buildNode("foo");
    }
    catch (ex) {
      msg = ex.message;
    }
    expect(msg).toBe("This linked list is locked");

    msg = null;
    let other = new MembraneProxyHandlers.LinkedList(
      {membrane: null}, Reflect
    ).buildNode("bar");
    try {
      handler.insertNode("head", other);
    }
    catch (ex) {
      msg = ex.message;
    }
    expect(msg).toBe("This linked list is locked");
  });

  it("correctly executes every subsidiary handler", function() {
    const names = 
    [
      "outbound",
      "wrapping",
      "distortions",
      "inbound",
    ];
    let traceLog = [];
    names.forEach((name) => {
      const subList = handler.getNodeByName(name).subList;
      const trace = subList.buildNode(name, "Tracing", traceLog);
      subList.insertNode("head", trace);
      subList.lock();
    });

    shadow.one = 1;
    shadow.two = 2;
    shadow.three = 3;
    traceLog.splice(0, traceLog.length);

    expect(Reflect.ownKeys(proxy)).toEqual(["one", "two", "three"]);
    expect(traceLog).toEqual([
      "enter outbound, ownKeys",
      "enter wrapping, ownKeys",
      "enter distortions, ownKeys",
      "enter inbound, ownKeys",

      "leave inbound, ownKeys",
      "leave distortions, ownKeys",
      "leave wrapping, ownKeys",
      "leave outbound, ownKeys",
    ]);
  });
});
