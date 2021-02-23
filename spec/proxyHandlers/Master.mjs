import {
  allTraps,
} from "../../source/core/sharedUtilities.mjs";
import MembraneProxyHandlers from "../../source/ProxyHandlers/main.mjs";

describe("MembraneProxyHandlers.Master proxy handler", function() {
  const membraneArg = {membrane: null};
  let handler = null, proxy = null, revoke = null, shadow = null;
  beforeEach(function() {
    shadow = {};
    handler = new MembraneProxyHandlers.Master(membraneArg);
    let obj = Proxy.revocable(shadow, handler);
    proxy = obj.proxy;
    revoke = obj.revoke;
  });

  afterEach(function() {
    handler = null;
    shadow = null;
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
    let other = new MembraneProxyHandlers.LinkedListNode({membrane: null}, "bar");
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
      const trace = new MembraneProxyHandlers.Tracing(membraneArg, name, traceLog);
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
